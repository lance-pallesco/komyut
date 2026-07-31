import type { Metadata } from "next";
import { inter, plusJakartaSans } from "./fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { BRAND_TAGLINE } from "@/lib/constants";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "KOMYUT: Community Guide for Commuters",
  description: BRAND_TAGLINE,
  keywords: [
    "commute",
    "philippines",
    "jeepney routes",
    "uv express",
    "mrt route",
    "bgc commute",
    "manila commute guide",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground pb-16 md:pb-0">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <MobileBottomNav />
            <Toaster position="bottom-right" richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
