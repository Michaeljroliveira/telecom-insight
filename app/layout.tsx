import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Telecom Insight",
  description: "Plataforma de gestão operacional para supervisão de telecom",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
