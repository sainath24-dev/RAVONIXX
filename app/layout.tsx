import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import Providers from "@/components/Providers";
import NoiseOverlay from "@/components/NoiseOverlay";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ClickSpark from "@/components/ClickSpark";
import "./globals.css";

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08090C" },
    { media: "(prefers-color-scheme: light)", color: "#08090C" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ravonixx.xyz"),
  title: {
    default: "RAVONIXX | Free Fire Esports & Tactical Playbook",
    template: "%s | RAVONIXX",
  },
  description: "Official hub for RAVONIXX Free Fire esports organization. Discover active player rosters, sensitivities, custom HUD loadouts, map strategies, and broadcasts.",
  icons: {
    icon: [
      { url: "/images/logo/ravonixx_dark.png", sizes: "any" },
      { url: "/images/logo/ravonixx_dark.png", type: "image/png" },
    ],
    shortcut: "/images/logo/ravonixx_dark.png",
    apple: "/images/logo/ravonixx_dark.png",
  },
  openGraph: {
    title: "RAVONIXX | Free Fire Esports & Tactical Playbook",
    description: "Official hub for RAVONIXX Free Fire esports organization. Discover active player rosters, sensitivities, loadouts, and community updates.",
    url: "https://ravonixx.xyz",
    siteName: "RAVONIXX",
    images: [
      {
        url: "/images/logo/ravonixx_dark.png",
        width: 800,
        height: 800,
        alt: "RAVONIXX Official Black Emblem",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <link rel="icon" href="/images/logo/ravonixx_dark.png" sizes="any" />
        <link rel="apple-touch-icon" href="/images/logo/ravonixx_dark.png" />
      </head>
      <body className="font-body bg-void text-text-primary antialiased min-h-screen flex flex-col justify-between">
        <Providers>
          <NoiseOverlay />
          <ClickSpark sparkColor="#A855F7" sparkSize={5} sparkCount={9} />
          <Nav />
          <main className="flex-grow pt-[104px]">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
