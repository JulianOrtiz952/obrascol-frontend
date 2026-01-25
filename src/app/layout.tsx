import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Topbar } from "@/components/Topbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Obrascol - Gestión de Inventario",
  description: "Sistema de gestión de inventario para Obrascol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900 min-h-screen`}>
        <Topbar />
        <main className="pt-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
