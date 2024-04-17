import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import styles from "./page.module.css"
import Navbar from "./navbar/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Youtube",
  description: "Youtube Clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <div className={styles.mainPage}> */}
        <Navbar />
        {children}
        {/* </div> */}
      </body>
    </html>
  );
}
