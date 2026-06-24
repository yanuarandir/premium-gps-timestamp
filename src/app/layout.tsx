import type { Metadata } from "next";
import { Montserrat, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timestamp Generator",
  description: "Add GPS and timestamps to your photos easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${montserrat.variable} ${robotoMono.variable} font-sans h-full antialiased bg-[#000000] text-white`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#000000]">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
