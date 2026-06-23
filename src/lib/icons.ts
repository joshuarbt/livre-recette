import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  ShoppingCart,
  Snowflake,
  Upload,
  X,
} from "lucide-react";

export type { LucideIcon };

export const navIcons = {
  recipes: ChefHat,
  planning: Calendar,
  courses: ShoppingCart,
  freezer: Snowflake,
} as const satisfies Record<string, LucideIcon>;

export const actionIcons = {
  add: Plus,
  close: X,
  download: Download,
  expand: ChevronDown,
  upload: Upload,
  weekPrev: ChevronLeft,
  weekNext: ChevronRight,
} as const satisfies Record<string, LucideIcon>;
