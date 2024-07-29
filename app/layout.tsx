import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "98.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Windows 9X",
  description: "The future of yesterday",
};

/**
 * A functional component responsible for rendering children in a predefined HTML layout.
 * @param {object} props - Object that contains the properties of RootLayout.
 * @param {React.ReactNode} props.children - React Children of the function.
 * @returns {JSX.Element} HTML content with children.
 */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
