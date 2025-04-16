import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "common/components/Header";
import Footer from "common/components/Footer";
import { getUserFromServer } from "common/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({ children }) {
  const user = await getUserFromServer();
  console.log("페이지 랜더링!");

  return (
    <html lang='ko'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header user={user} />
        <main className='page-content'>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
