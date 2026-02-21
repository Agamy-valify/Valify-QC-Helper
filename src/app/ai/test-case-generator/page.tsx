import TestCaseForm from "@/components/test-case-form";

export default function TestCaseGeneratorPage() {
    return (
        <main className="page-wrap">
            <header className="hero">
                <h1>AI Test Case Generator</h1>
                <p>
                    Professional test generation using ISO/IEC/IEEE 29119 principles with boundary,
                    negative, and security coverage.
                </p>
            </header>
            <TestCaseForm />
        </main>
    );
}