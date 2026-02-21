# AI QA Assistant

## Overview
AI QA Assistant is a Next.js web app for generating professional test cases and structured bug reports using Gemini AI. It includes file upload parsing (text + PDF), deep-analysis mode, and JSON export.

## Features
- **AI Test Case Generator**: Produces structured test cases from user stories and acceptance criteria.
- **AI Bug Report Generator**: Produces reproducible bug reports with severity, priority, and impact details.
- **File Parsing**: Parses text-based files and PDFs to enrich prompts.
- **Deep Analysis Toggle**: Uses a stronger model path when needed.
- **JSON Export**: Download generated outputs as JSON.

## Project Structure
```
ai-qa-assistant
├── src
│   ├── app
│   │   ├── ai
│   │   │   ├── bug-report-generator
│   │   │   │   └── page.tsx
│   │   │   └── test-case-generator
│   │   │       └── page.tsx
│   │   ├── api
│   │   │   ├── bug-reports
│   │   │   │   └── route.ts
│   │   │   ├── test-cases
│   │   │   │   └── route.ts
│   │   │   └── uploads
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── bug-report-form.tsx
│   │   ├── test-case-form.tsx
│   │   ├── file-upload.tsx
│   │   └── ui
│   │       └── index.ts
│   ├── lib
│   │   ├── ai-client.ts
│   │   ├── validators.ts
│   │   └── types.ts
│   └── middleware.ts
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-qa-assistant.git
   ```
2. Navigate to the project directory:
   ```
   cd ai-qa-assistant
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Set up environment variables by copying `.env.example` to `.env` and filling in required values:
   - `GEMINI_API_KEY`

## Usage
- Start the development server:
  ```
  npm run dev
  ```
- Open your browser and navigate to `http://localhost:3000` to access the application.

## Notes
- App routes are under `src/app` and API handlers are in `src/app/api`.
- Upload parsing is stateless (no persistence in this MVP).

## Contribution
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your branch and create a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.