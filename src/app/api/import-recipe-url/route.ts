import { isPartialImport, parseRecipeHtml } from "@/lib/import-recipe-url/parse-html";
import { importedRecipeToFormValues } from "@/lib/import-recipe-url/to-form-values";
import {
  IMPORT_RECIPE_URL_ERRORS,
  type ImportRecipeUrlResponse,
} from "@/lib/import-recipe-url/types";
import { validateImportUrl } from "@/lib/import-recipe-url/validate-url";
import { createClient } from "@/lib/supabase/server";

const MAX_HTML_BYTES = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15_000;

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { success: false, error: "Non authentifié." } satisfies ImportRecipeUrlResponse,
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: IMPORT_RECIPE_URL_ERRORS.invalidUrl } satisfies ImportRecipeUrlResponse,
      { status: 400 },
    );
  }

  const urlValue =
    typeof body === "object" && body !== null && "url" in body && typeof body.url === "string"
      ? body.url
      : "";

  const parsedUrl = validateImportUrl(urlValue);
  if (!parsedUrl) {
    return Response.json(
      { success: false, error: IMPORT_RECIPE_URL_ERRORS.invalidUrl } satisfies ImportRecipeUrlResponse,
      { status: 400 },
    );
  }

  let html: string;
  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "LivreRecetteBot/1.0 (+recipe-import)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
    });

    if (!response.ok) {
      return Response.json(
        { success: false, error: IMPORT_RECIPE_URL_ERRORS.siteUnreachable } satisfies ImportRecipeUrlResponse,
        { status: 400 },
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return Response.json(
        { success: false, error: IMPORT_RECIPE_URL_ERRORS.notFound } satisfies ImportRecipeUrlResponse,
        { status: 400 },
      );
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_HTML_BYTES) {
      return Response.json(
        { success: false, error: IMPORT_RECIPE_URL_ERRORS.siteUnreachable } satisfies ImportRecipeUrlResponse,
        { status: 400 },
      );
    }

    html = new TextDecoder("utf-8").decode(buffer);
  } catch {
    return Response.json(
      { success: false, error: IMPORT_RECIPE_URL_ERRORS.siteUnreachable } satisfies ImportRecipeUrlResponse,
      { status: 400 },
    );
  }

  const recipe = parseRecipeHtml(html);
  if (!recipe) {
    return Response.json(
      { success: false, error: IMPORT_RECIPE_URL_ERRORS.notFound } satisfies ImportRecipeUrlResponse,
      { status: 400 },
    );
  }

  const data = importedRecipeToFormValues(recipe);
  const partial = isPartialImport(recipe);

  return Response.json({
    success: true,
    partial,
    data,
  } satisfies ImportRecipeUrlResponse);
}
