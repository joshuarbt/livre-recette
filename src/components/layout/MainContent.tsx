"use client";

import { usePathname } from "next/navigation";
import { isTabBarRoute } from "@/lib/navigation/tab-bar-routes";

type MainContentProps = {
  children: React.ReactNode;
};

export function MainContent({ children }: MainContentProps) {
  const pathname = usePathname();

  const paddingClass = isTabBarRoute(pathname) ? "pb-tab-bar md:pb-0" : "";

  return <main className={`flex-1 min-w-0 ${paddingClass}`.trim()}>{children}</main>;
}
