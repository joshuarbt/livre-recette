import type { Metadata, Viewport } from "next";
import { Nunito, Orbitron, Plus_Jakarta_Sans } from "next/font/google";
import { AppNav } from "@/components/layout/AppNav";
import { MainContent } from "@/components/layout/MainContent";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { AeroBackground } from "@/components/theme/AeroBackground";
import { BarbieSparkles } from "@/components/theme/BarbieSparkles";
import { GhibliClouds } from "@/components/theme/GhibliClouds";
import { MatrixRain } from "@/components/theme/MatrixRain";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { VaporwaveBackground } from "@/components/theme/VaporwaveBackground";
import { getThemePreferences } from "@/lib/theme/server";
import "./globals.css";
import "@/styles/theme-aero.css";
import "@/styles/theme-default-dark.css";
import "@/styles/theme-matrix.css";
import "@/styles/theme-gameboy.css";
import "@/styles/theme-barbie.css";
import "@/styles/theme-vaporwave.css";
import "@/styles/theme-ghibli.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-orbitron",
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
      className={`${plusJakarta.variable} ${nunito.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="flex min-h-full min-w-0 flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider initialTheme={theme} initialColorScheme={colorScheme}>
          <AeroBackground />
          <MatrixRain />
          <VaporwaveBackground />
          <BarbieSparkles />
          <GhibliClouds />
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
