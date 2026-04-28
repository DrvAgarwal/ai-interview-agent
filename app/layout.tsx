import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const monaSans = Mona_Sans({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Intvu",
    description: "AI-powered mock-interview",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${monaSans.variable} ${monaSans.className} antialiased pattern`}
                suppressHydrationWarning
            >
                {children}
                <Toaster />
            </body>
        </html>
    );
}