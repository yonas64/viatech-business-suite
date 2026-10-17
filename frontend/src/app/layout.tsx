import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Viatech Management",
  description: "Viatech inventory and sales management",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
