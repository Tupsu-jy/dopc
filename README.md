# Delivery Order Price Calculator (DOPC)

A simple Next.js (App Router) application that calculates delivery prices. It includes a bilingual interface (English and Finnish) and demonstrates how to integrate translations with [**next-intl**](https://github.com/amannn/next-intl). This project also supports containerization via Docker and testing with Cypress.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Tests (Cypress)](#tests-cypress)

---

## Features

- **Next.js (App Router)** for modern React structure.
- **Internationalization (i18n)** using [next-intl](https://github.com/amannn/next-intl) (English + Finnish).
- **TypeScript** for type safety and maintainability.
- **ESLint** for code linting and quality checks.
- **Cypress** for end-to-end testing.

---

## Project Structure

.
├── app
│ ├── favicon.ico
│ └── [locale]
│ ├── layout.tsx
│ ├── page.module.css
│ └── page.tsx
├── components
│ ├── InputField.module.css
│ ├── InputField.tsx
│ ├── InvisibleNavbar.module.css
│ └── InvisibleNavbar.tsx
├── cypress
│ ├── e2e
│ │ └── calculator.cy.js
│ ├── fixtures
│ │ └── example.json
│ └── support
│ ├── commands.ts
│ └── e2e.ts
├── cypress.config.ts
├── docker-compose.yml
├── Dockerfile
├── i18n
│ ├── request.ts
│ └── routing.ts
├── messages
│ ├── en.json
│ └── fi.json
├── middleware.ts
├── next.config.js
├── next-env.d.ts
├── package.json
├── package-lock.json
├── public
│ └── background.svg
├── README.md
├── styles
│ └── globals.css
├── tsconfig.json
└── utils
├── apiCalls.ts
└── helpers.ts

## Getting started

# Production mode

In order to start this app you simple need to run the command "docker compose up" in project root. (I assume you have docker here) After this the webpage starts running at localhost at port 3000. It can used by simply going to http://localhost:3000.

# Development mode

This requires simply the combination of running npm install and npm run dev. In this mode you need to got to http://localhost:3000

# Language

This supports both english and finnish and the default language is determined based on your browser. Language can be changed at top right corner.

## Tests (Cypress)

We use Cypress for E2E tests.

Start the dev server:
npm run dev

Open Cypress in interactive mode:
npm run cypress:open

(Optional) Run in headless mode:
npm run cypress:run

Check the cypress/e2e folder for test specs.

Apologies for rushed readme
