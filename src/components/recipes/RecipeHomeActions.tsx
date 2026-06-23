import { RecipeAddAction } from "@/components/recipes/RecipeAddAction";
import { RecipeImportAction } from "@/components/recipes/RecipeImportAction";

type RecipeHomeActionsProps = {
  userId: string;
  existingTitles: string[];
};

export function RecipeHomeActions({ userId, existingTitles }: RecipeHomeActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <RecipeImportAction userId={userId} existingTitles={existingTitles} />
      <RecipeAddAction />
    </div>
  );
}
