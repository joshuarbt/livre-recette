import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppNav } from "@/components/layout/AppNav";
import { MainContent } from "@/components/layout/MainContent";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getThemePreferences } from "@/lib/theme/server";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "App cuisine",
  description: "Livre de recettes et planning des repas",
  applicationName: "App cuisine",
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
  const { colorScheme } = await getThemePreferences();

  return (
    <html
      lang="fr"
      data-color-scheme={colorScheme}
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full min-w-0 flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider initialColorScheme={colorScheme}>
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
