import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sell Me This Pen — Coconut VA",
  description:
    "Encare um lead durão criado por AI. Responda perguntas, suba a barra de fechamento e ganhe uma dica útil pro seu business.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={manrope.variable}>
      <body className="font-sans antialiased min-h-screen">{children}</body>
    </html>
  );
}
