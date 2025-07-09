import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL('https://culi.ai'),
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // For devices with notches
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return children;
}