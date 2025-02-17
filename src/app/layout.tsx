import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MockAPI - Create Realistic Mock APIs",
  description: "Design, create and manage your mock APIs with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
