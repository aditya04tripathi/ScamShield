import { Lato, DM_Serif_Display } from "next/font/google";
import { constructMetadata } from "@/lib/generate-metadata";

import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});
const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lato.className}`}>
      <body className={`dark antialiased ${dmSerifDisplay.variable}`}>
        {children}
      </body>
    </html>
  );
}
