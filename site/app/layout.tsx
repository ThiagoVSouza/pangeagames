import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Outpost — Visual Directions",
  description: "Three visual directions for the official Pangea Games website.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
