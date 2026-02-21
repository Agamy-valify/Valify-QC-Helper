import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
    title: "Valify QA Assistant",
    description:
        "Generate professional test cases and bug reports with AI-powered workflows.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <header className="topbar">
                    <div className="topbar-inner">
                        <Link href="/" className="brand">
                            <img
                                src="/valify_logo_light.png"
                                alt="Valify Solutions"
                                className="brand-logo"
                            />
                            <span className="brand-text">Valify QA Assistant</span>
                        </Link>
                        <nav className="nav-links">
                            <Link href="/ai/test-case-generator">Test Generator</Link>
                            <Link href="/ai/bug-report-generator">Bug Reporter</Link>
                        </nav>
                    </div>
                </header>
                <div className="app-shell">{children}</div>
                <footer className="site-footer">
                    <div className="site-footer-inner">
                        <span>Credits: Ahmed Agamy - QC Lead</span>
                    </div>
                </footer>
            </body>
        </html>
    );
}