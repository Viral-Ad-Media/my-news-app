import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import InteractionPreferences from "../components/InteractionPreferences";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
export const metadata: Metadata = {
  title: "AbokiNews",
  description: "AI Powered News App",
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
          <Header />

          {/* Main Content */}
          <main className="flex-1 w-full max-w-[1600px] mx-auto px-3.5 py-5 sm:px-6 sm:py-6 lg:px-8">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
