import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { authOptions } from "@/lib/auth";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Fantasy Dashboard",
  description: "Manage your content, analytics, and social media presence",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const isLoginPage = false; // Layout only wraps non-login pages

  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="h-full bg-background text-foreground">
        <TooltipProvider>
          <div className="flex h-full">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
