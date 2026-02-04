'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { Topbar } from "@/components/Topbar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <body className={`${inter.className} antialiased bg-slate-50 text-slate-900 min-h-screen`}>
      <AuthProvider>
        {!isLoginPage && <Topbar />}
        <main className={cn("min-h-screen", !isLoginPage && "pt-16")}>
          {children}
        </main>
      </AuthProvider>
    </body>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <LayoutContent>{children}</LayoutContent>
    </html>
  );
}
