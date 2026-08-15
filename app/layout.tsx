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
  metadataBase: new URL("https://www.ravonixx.xyz"),
  title: {
    default: "RAVONIXX | Free Fire Esports & Tactical Playbook",
    template: "%s | RAVONIXX",
  },
  description:
    "Official website of RAVONIXX Esports organization. Explore pro Free Fire rosters, sensitivities, custom HUD loadouts, map strategies, tournament scrims, and highlights.",
  keywords: [
    "RAVONIXX",
    "RAVONIXX Esports",
    "Free Fire Esports",
    "Free Fire India",
    "Free Fire sensitivity settings",
    "Free Fire custom HUD",
    "FFWS",
    "Free Fire World Series",
    "Esports organization India",
    "Free Fire tournament scrims",
    "Pro gamer sensitivity",
    "Free Fire tactical playbook",
  ],
  authors: [{ name: "RAVONIXX Esports", url: "https://www.ravonixx.xyz" }],
  creator: "RAVONIXX",
  publisher: "RAVONIXX",
  alternates: {
    canonical: "https://www.ravonixx.xyz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "1oHAWBlA1YYNJTDj6AfI0kRi_EeyNSJvOc1mPpEkSSI",
  },
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
    description:
      "Official hub for RAVONIXX Free Fire esports organization. Discover active player rosters, sensitivities, custom HUD loadouts, map drop strategies, and broadcasts.",
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
  twitter: {
    card: "summary_large_image",
    title: "RAVONIXX | Free Fire Esports Organization",
    description:
      "Official hub for RAVONIXX Free Fire esports organization. Roster, sensitivities, custom HUDs, and scrim schedules.",
    images: ["/images/logo/ravonixx_dark.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SportsOrganization",
      "@id": "https://ravonixx.xyz/#organization",
      "name": "RAVONIXX",
      "url": "https://ravonixx.xyz",
      "logo": "https://ravonixx.xyz/images/logo/ravonixx_dark.png",
      "description": "Premier Free Fire competitive esports organization and tactical consultancy.",
      "sameAs": [
        "https://www.youtube.com/@ravonixx-09",
        "https://www.instagram.com/ravonixx.ind",
        "https://dsc.gg/ravonixx",
        "https://www.linkedin.com/company/ravonixx"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://ravonixx.xyz/#website",
      "url": "https://ravonixx.xyz",
      "name": "RAVONIXX",
      "publisher": {
        "@id": "https://ravonixx.xyz/#organization"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <meta name="google-site-verification" content="1oHAWBlA1YYNJTDj6AfI0kRi_EeyNSJvOc1mPpEkSSI" />
        <link rel="icon" href="/images/logo/ravonixx_dark.png" sizes="any" />
        <link rel="apple-touch-icon" href="/images/logo/ravonixx_dark.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
