import BugReportForm from "@/components/bug-report-form";

export default function BugReportGeneratorPage() {
    return (
        <main className="page-wrap">
            <header className="hero">
                <h1>AI Bug Report Generator</h1>
                <p>
                    Turn vague issue notes into clean, engineering-ready bug reports with reproducible
                    steps, impact, severity, and root-cause hypotheses.
                </p>
            </header>
            <BugReportForm />
        </main>
    );
}