import type { LucideIcon } from "lucide-react";
import { Calendar, ChefHat, ChevronDown, ChevronLeft, ChevronRight, Plus, ShoppingCart, Snowflake, X } from "lucide-react";

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
  expand: ChevronDown,
  weekPrev: ChevronLeft,
  weekNext: ChevronRight,
} as const satisfies Record<string, LucideIcon>;
