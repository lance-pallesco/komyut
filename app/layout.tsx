import type { Metadata } from "next";
import { manrope, inter } from "./fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
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

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserProfileProvider } from "@/components/providers/user-profile-provider";
import { GuestAuthProvider } from "@/components/providers/guest-auth-provider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground pb-16 md:pb-0">
        <AuthProvider session={session}>
          <UserProfileProvider>
            <GuestAuthProvider>
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
            </GuestAuthProvider>
          </UserProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
