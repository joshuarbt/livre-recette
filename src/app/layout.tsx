import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppNav } from "@/components/layout/AppNav";
import { MainContent } from "@/components/layout/MainContent";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { AeroBackground } from "@/components/theme/AeroBackground";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getThemePreferences } from "@/lib/theme/server";
import "./globals.css";
import "@/styles/theme-aero.css";
import "@/styles/theme-default-dark.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "App cuisine",
  description: "Livre de recettes et planning des repas",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme, colorScheme } = await getThemePreferences();

  return (
    <html
      lang="fr"
      data-theme={theme}
      data-color-scheme={colorScheme}
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full min-w-0 flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider initialTheme={theme} initialColorScheme={colorScheme}>
          <AeroBackground />
          <div className="app-shell flex min-h-full min-w-0 flex-1 flex-col">
            <AppNav />
            <MainContent>{children}</MainContent>
            <MobileTabBar />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
