import "./globals.css";

import { Oswald, Space_Grotesk } from "next/font/google";

import Providers from "@/components/Providers";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: "SoleStreet",
  description: "Browse fresh sneakers, order on WhatsApp, or checkout with M-Pesa.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${oswald.variable} ${spaceGrotesk.variable}`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
