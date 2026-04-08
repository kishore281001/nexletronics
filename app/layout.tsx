import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";

export const metadata: Metadata = {
  title: "Nexletronics — Electronics Components & Project Kits",
  description: "Shop premium electronic components, Arduino kits, sensors, modules and DIY project kits at Nexletronics. Fast India-wide shipping.",
  keywords: "Arduino, ESP32, electronic components, sensors, modules, project kits, India",
  openGraph: {
    title: "Nexletronics",
    description: "Your one-stop shop for electronic components & project kits",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,        // prevents iOS auto-zoom on input focus (cursor jump fix)
  userScalable: false,    // belt-and-suspenders for older iOS
  themeColor: "#050508",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
