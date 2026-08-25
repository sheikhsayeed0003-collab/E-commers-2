import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Providers } from "@/components/Providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600"],
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MAISON — Luxury Streetwear & Lifestyle",
  description:
    "Premium apparel, footwear, and lifestyle goods. Limited drops, collaborations, and a loyalty program.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${display.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <AnnouncementBar />
          <Header />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
