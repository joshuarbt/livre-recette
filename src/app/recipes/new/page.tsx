import { redirect } from "next/navigation";

export default function LegacyNewRecipePage() {
  redirect("/recettes/nouvelle");
}
