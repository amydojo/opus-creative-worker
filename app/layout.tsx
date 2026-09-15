import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OPUS OS",
  description: "Creative production OS for Opus Plastic Surgery",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
