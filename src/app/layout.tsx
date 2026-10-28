import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SiteChrome from "../components/SiteChrome";
import InteractionPreferences from "../components/InteractionPreferences";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
export const metadata: Metadata = {
  title: "AbokiNews",
  description: "News from your country. Read the story, follow the source.",
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/rss.xml", title: "AbokiNews — All Stories RSS 2.0 Feed" },
        { url: "/rss.xml?location=ng", title: "AbokiNews — Nigeria Desk RSS Feed" },
      ],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem("color-scheme");var m=document.querySelector('meta[name="color-scheme"]');if(m)m.content=s||"light dark";var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.classList.toggle("light",s==="light");}catch(e){}`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <div className="min-h-dvh flex flex-col overflow-x-clip">
          <InteractionPreferences />
          <SiteChrome>{children}</SiteChrome>
        </div>
      </body>
    </html>
  );
}
