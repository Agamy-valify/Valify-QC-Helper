import Link from "next/link";

export default function HomePage() {
    return (
        <main className="page-wrap">
            <header className="hero">
                <h1>AI QA Assistant</h1>
                <p>Create high-quality test cases and bug reports with Gemini-powered analysis.</p>
            </header>

            <section className="cards two-col">
                <article className="card">
                    <h2>Test Case Generator</h2>
                    <p className="muted">Generate structured cases from user stories and acceptance criteria.</p>
                    <Link className="link-btn" href="/ai/test-case-generator">
                        Open Tool
                    </Link>
                </article>
                <article className="card">
                    <h2>Bug Report Generator</h2>
                    <p className="muted">Create reproducible bug reports from incident details and logs.</p>
                    <Link className="link-btn" href="/ai/bug-report-generator">
                        Open Tool
                    </Link>
                </article>
            </section>
        </main>
    );
}