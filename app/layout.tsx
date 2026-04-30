// app/layout.js
import "./globals.css"; // Ensure your tailwind styles are imported

export const metadata = {
  title: "Minimalist AI Chat",
  description: "A clean AI interface",
};

import { ReactNode } from "react";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        {/* This children prop is where your page.js content goes */}
        {children}
      </body>
    </html>
  );
}