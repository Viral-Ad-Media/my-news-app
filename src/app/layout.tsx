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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <div className="">
          <InteractionPreferences />
          <Header />

          {/* Main Content */}
          <main className="w-full max-w-[1100px] mx-auto px-4 py-8 sm:px-6">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
