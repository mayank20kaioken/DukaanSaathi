# DukaanSaathi 🇮🇳
### Your AI-Powered Business Partner for Everyday Retail

**DukaanSaathi** is an AI-assisted retail management platform designed to help India's local shopkeepers manage daily operations, understand business performance, track inventory, and make smarter business decisions.

From a digital *khata* to Hindi voice assistance and AI-powered invoice processing, DukaanSaathi brings essential shop-management workflows into one unified workspace.

> **Our vision:** Make powerful business intelligence accessible to every neighbourhood shopkeeper — in a language they understand.

---

## ✨ What Makes DukaanSaathi Different?

Traditional shop-management tools can be complicated, disconnected, or difficult for small retailers to use. DukaanSaathi aims to make everyday business management simpler through an intuitive interface, accessible AI assistance, and data-driven insights.

- 🗣️ **Hindi-First AI Assistance** — Ask questions about sales, product prices, margins, customer credit, and suppliers using supported Hindi, Hinglish, or English queries.
- 🧾 **AI Bill Scanner** — Upload or capture supplier invoices, extract information using OCR, review the results, and prepare verified expenses.
- 📊 **Business Intelligence** — Understand sales, profitability, expenses, cash flow, and business-health indicators.
- 📦 **Smart Inventory Management** — Monitor stock levels, identify potential shortages, and explore reorder recommendations.
- 🤝 **Digital Khata** — Organise customer credit, outstanding balances, and repayment records.
- 🌐 **TinyFish Market Scout** — Research publicly available supplier listings and compare potential prices with recorded buying costs when live integration is configured.

---

## 🚀 Key Features

### 1. Hindi Voice Assistant — हिंदी वॉयस साथी

Interact with shop information through supported voice or text queries.

Example questions:

- "Aaj ki total sale kitni hui?"
- "Maggi ka khareedne aur bechne ka rate batao."
- "Sabse zyada munafa kis product mein hai?"
- "Kis customer ka sabse zyada udhaar baaki hai?"
- "Kaunse products dobara order karne hain?"
- "Sharma Traders ka contact number kya hai?"

Answers depend on the records available in the application. Voice recognition and spoken responses depend on browser support and permissions.

### 2. AI Bill Scanner

Simplify supplier invoice processing with a review-first workflow.

- Upload an invoice image or use a supported camera.
- Extract text using OCR.
- Review and edit supplier and invoice details.
- Inspect extracted line items, quantities, prices, taxes, and totals.
- Compare calculated amounts with the printed invoice total.
- Confirm the information before saving an expense.
- Optionally update stock when the workflow supports it.

**Accuracy matters:** OCR can misread invoice information. Extracted values must be checked against the original document. The scanner must not silently substitute demonstration data for a real invoice.

### 3. Business Performance Dashboard

Bring important business indicators together in one workspace.

- Daily sales and gross profit.
- Net operating profit after recorded operating expenses.
- Customer credit and outstanding balances.
- Inventory valuation and low-stock alerts.
- Sales and profit trends.
- Business-health indicators and prioritised action suggestions.

Financial results depend on the completeness and accuracy of recorded transactions and the application's calculation rules.

### 4. Digital Khata & Udhaar Management

Organise customer credit records and repayment activity.

- Track outstanding customer balances.
- Record credit transactions and repayments.
- Identify overdue accounts.
- Review customer ledger activity.
- Prepare customer statements and payment reminders where supported.

### 5. Inventory & Stock Intelligence

Help retailers understand what is selling and what needs attention.

- Product catalogue and pricing.
- Stock-level monitoring.
- Low-stock and reorder suggestions.
- Expiry-date monitoring when dates are recorded.
- Dead-stock insights and demand-planning tools.

### 6. TinyFish Market Scout

Explore supplier and market-price research through TinyFish-powered web automation.

The intended workflow is to:

1. Search for a product and its pack size.
2. Research relevant public supplier listings.
3. Extract available product and price information.
4. Compare comparable listings with recorded buying prices.
5. Review original source links and potential savings.
6. Save reviewed benchmarks when supported.

Live research requires valid TinyFish credentials and a working server-side integration. Results may vary by website, product availability, pack size, and source quality. Public listing prices are not guaranteed wholesale offers.

### 7. Additional Business Tools

The broader DukaanSaathi roadmap also includes:

- Smart expense management.
- Sales history and point of sale.
- Demand forecasting.
- Festival demand planning.
- Customer loyalty and feedback.
- Supplier price comparison.
- Group-buying opportunities.
- Competitor price tracking.
- AI business advice.
- Business-risk alerts.
- Officer ID information extraction and authorised verification workflows.

Some capabilities may be prototypes, demo-driven, or dependent on future backend and external-service integrations. Their presence in the roadmap does not imply production readiness.

---

## 🛠️ Technology Stack

The current project is built around the following technologies:

| Technology | Purpose |
|---|---|
| React | Component-based user interface |
| TypeScript | Typed application development |
| Vite | Development server and production build |
| Tailwind CSS | Utility-based styling |
| Recharts | Dashboard visualisations |
| Tesseract.js | Optical character recognition |
| Web Speech APIs | Browser-supported speech recognition and synthesis |
| TinyFish | External web research and automation integration |
| Node.js-compatible server middleware | Server-side TinyFish API proxy |

The application uses a dark midnight-navy interface with forest-mint and electric-lime accents, designed for clear financial information and accessible retail workflows.

---

## 📁 Project Structure

```text
dukaansaathi/
├── public/                 # Public assets and icons
├── server/
│   └── tinyfishProxy.ts    # Server-side TinyFish integration
├── src/
│   ├── assets/             # Application assets
│   ├── components/
│   │   ├── common/         # Shared UI components
│   │   ├── layout/         # Navigation and app layout
│   │   └── modals/         # Forms and modal workflows
│   ├── context/
│   │   └── AppContext.tsx  # Shared application state
│   ├── data/
│   │   └── mockData.ts     # Demonstration records
│   ├── services/
│   │   ├── marketResearchService.ts
│   │   ├── ocrService.ts
│   │   └── voiceAssistantEngine.ts
│   ├── types/
│   │   └── index.ts        # Shared TypeScript types
│   ├── utils/              # Formatting and utility functions
│   ├── views/              # Application screens
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── .env.example            # Example environment configuration
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm.
- Git.
- A modern browser such as Chrome or Edge.

### 1. Clone the repository

```bash
git clone https://github.com/mayank20kaijoken/DukaanSaathi.git
cd DukaanSaathi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file in the project root if you intend to use TinyFish live research.

```env
TINYFISH_API_KEY=your_tinyfish_api_key_here
```

Replace the placeholder with your own valid API key. Do not commit the `.env` file or expose the key in frontend code.

The project includes `.env.example` as a reference for environment configuration.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL printed in the terminal. The current development setup has been using `http://localhost:5174/`, but Vite may select another available port.

### 5. Build for production

```bash
npm run build
```

To run the production preview, if supported by the project scripts:

```bash
npm run preview
```

Check `package.json` for the exact scripts available in your version of the project.

---

## 🔐 Security & Data Integrity

DukaanSaathi is designed around the principle that business decisions should be based on trustworthy records.

- Keep API keys and credentials on the server.
- Never commit real `.env` files or secrets.
- Treat OCR output as unverified until reviewed.
- Distinguish demonstration data from genuine external results.
- Do not claim an ID is authentic merely because its text was extracted.
- Preserve the original printed invoice total separately from calculated totals.
- Require confirmation before saving financial transactions.
- Avoid treating forecasts and AI recommendations as guaranteed outcomes.

Before using the application with real shop records, verify its persistence, access controls, transaction handling, and data-protection requirements.

---

## 🧪 Testing & Verification

The development workflow should include:

- Production build and TypeScript checks.
- Hindi and Hinglish voice-query testing.
- OCR extraction and invoice-total reconciliation.
- Expense-saving and optional stock-update checks.
- Customer ledger and repayment validation.
- TinyFish authentication, live-request and error-handling tests.
- Responsive layout and browser-permission checks.

A successful build confirms that the application compiles; it does not establish that every feature or external integration works in production.

---

## 🗺️ Roadmap

- [ ] Complete and validate the invoice-scanning workflow.
- [ ] Improve Hindi voice-query accuracy and fallback behaviour.
- [ ] Validate live TinyFish supplier research with configured credentials.
- [ ] Strengthen persistence and transaction consistency.
- [ ] Expand automated testing for financial calculations.
- [ ] Improve accessibility and mobile usability.
- [ ] Evaluate secure multi-shop and multi-user support.
- [ ] Prepare deployment and production-readiness documentation.

---

## 🎯 Project Goal

DukaanSaathi aims to help local retailers spend less time managing scattered records and more time growing their businesses.

By combining accessible interfaces, reliable financial records, Hindi voice interactions, invoice processing, and external market research, the project explores how AI can become a practical everyday partner for India's small-business ecosystem.

**Built with the vision of empowering every neighbourhood shopkeeper. 🇮🇳**

---

## 📄 License

No license has been selected yet. Until a license is added, the repository should not be assumed to grant general permission to reuse, modify, or redistribute the code.
