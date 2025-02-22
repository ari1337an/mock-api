import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ClerkProvider, SignedOut, SignInButton, SignedIn, UserButton } from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MockAPI - Create Realistic Mock APIs",
  description: "Design, create and manage your mock APIs with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}>
          <div className="absolute top-4 right-4">
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/"/>
            </SignedIn>
          </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
