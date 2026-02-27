import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ChatProvider } from "@/context/ChatContext";
import { ProductProvider } from "@/context/ProductContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import Sidebar from "@/components/Sidebar";
import FloatingChat from "@/components/FloatingChat";
import ToastStack from "@/components/ToastStack";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ECCE - Sistema",
  description: "Una aplicación con temas dinámicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ToastProvider>
          <AuthProvider>
            <ThemeProvider>
              <ProductProvider>
                <ChatProvider>
                  <div className="flex min-h-screen bg-black/5 dark:bg-black/20">
                    <Sidebar />
                    <main className="flex-1 transition-all duration-300 relative w-full overflow-x-hidden">
                      {children}
                    </main>
                  </div>
                  <FloatingChat />
                </ChatProvider>
              </ProductProvider>
            </ThemeProvider>
          </AuthProvider>
          <ToastStack />
        </ToastProvider>
      </body>
    </html>
  );
}
