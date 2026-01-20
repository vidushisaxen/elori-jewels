import { CartProvider } from "../components/cart/cart-context";
import LenisSmoothScroll from "../components/LenisSmoothScroll";
import "./globals.css";
import localFont from "next/font/local";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Suspense } from "react";
import ScrollToTopOnReload from "../components/RelaodToTop";
import Providers from "./providers";


const BSTSpyre = localFont({
  src: [
    {
      path: "./fonts/BSTSpyre-Book.woff2",
      weight: "400",
    },
    {
      path: "./fonts/BSTSpyre-Light.woff2",
      weight: "300",
    },
  ],
  variable: "--font-heading",
  subsets: ["latin"],
});

const Calibre = localFont({
  src: "./fonts/Calibre-Light.woff2",
  variable: "--font-calibre",
  subsets: ["latin"]
});

export const metadata = {
  title: "Elori Jewels",
  description: "Elori Jewels store - Handcrafted, minimal jewellery",
};


export default function RootLayout({ children }) {

  return (
    
    <html lang="en">
      <body className={`${BSTSpyre.variable} ${Calibre.variable} antialiased`}>
        <Suspense fallback={null}>
        <Providers>
          <CartProvider>
            <LenisSmoothScroll>
              {/* <ScrollToTopOnReload> */}
                {/* Put suspense around the data-fetching pieces */}
                <Suspense fallback={null}>
                  <Header />
                </Suspense>

                {children}

                <Suspense fallback={null}>
                  <Footer />
                </Suspense>
              {/* </ScrollToTopOnReload> */}
            </LenisSmoothScroll>
          </CartProvider>
        </Providers>
        </Suspense>
      </body>
    </html>
    
  );
}
