// app/layout.tsx
import Navbar from "@/components/navbar";
import "./globals.css";
import Head from "next/head";

export const metadata = {
  title: "Tania’s Implementations",
  description: "Internal tools for Tania’s Pizza",
  icons: {
    // default favicon
    icon: "/favicon.ico",
    // <link rel="apple-touch-icon" …>
    apple: "/favicon.ico",
    // also set the “shortcut icon” rel for older browsers
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <link 
          rel="icon" 
          href="/tanias-slice.png" 
          type="image/png" 
          sizes="any" 
        />
        <link 
          rel="shortcut icon" 
          href="/tanias-slice.png" 
          type="image/png" 
        />
        <link 
          rel="apple-touch-icon" 
          href="/tanias-slice.png" 
        />
      </Head>
      <body className="bg-gray-50 text-gray-900">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
