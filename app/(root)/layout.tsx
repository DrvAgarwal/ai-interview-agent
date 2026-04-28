import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <div className="root-layout">
            <nav className="p-4 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="Logo" width={38} height={32} />
                    <h2 className="text-white font-semibold text-lg">Intvu</h2>
                </Link>
                <div className="flex items-center gap-2">
                    <Link href="/" className="text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-sm">🏠 Home</Link>
                    <Link href="/practice" className="text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-sm">🎯 Practice</Link>
                    <Link href="/analytics" className="text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-sm">📊 Analytics</Link>
                    <Link href="/leaderboard" className="text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-sm">🏆 Leaderboard</Link>
                </div>
            </nav>
            <main>{children}</main>
        </div>
    );
}