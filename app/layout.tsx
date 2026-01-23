import Providers from "@/providers/Providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knovia Assessment Platform",
  description: "Knovia Assessment Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
