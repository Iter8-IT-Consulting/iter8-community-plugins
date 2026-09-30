import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Iter8Credit } from "@/components/Iter8Credit";
import { site } from "./site";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: site.name,
  description: site.purpose,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${openSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <Iter8Credit />
      </body>
    </html>
  );
}
