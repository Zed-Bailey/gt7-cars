import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AppLayout from "./_components/AppLayout";

import "primeicons/primeicons.css"
import "primereact/resources/themes/soho-light/theme.css";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GranTurismo Car Notifier",
  description: "Get notified when your favorite car comes into the legend or used car dealership",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className + " min-h-screen"} >
          <Providers>
            <AppLayout>
              {children}
            </AppLayout>
            
          </Providers>
        </body>
    </html>
  );
}
