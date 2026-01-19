# Shopify + Next.js POC – Elori Jewels

## Overview

This repository contains a **Proof of Concept (POC)** for a headless e-commerce storefront built using **Shopify** and **Next.js** for **Elori Jewels**.

The purpose of this POC is to validate the feasibility, stability, and readiness of a Shopify + Next.js architecture for a modern jewelry storefront.

---

## What This POC Demonstrates

- Shopify Storefront API (GraphQL) integration  
- Headless Shopify architecture with Next.js frontend  
- Core storefront pages:
  - Home
  - Collection / Product Listing Page (PLP)
  - Product Detail Page (PDP)
- Stripe checkout integration (test mode)
- Successful order creation in Shopify Admin
- Inventory management via Shopify Admin
- Stable deployment on Vercel

---

## Live Demo & References

- **Live Demo:** https://elori-jewels.vercel.app/  
- **Repository:** https://github.com/vidushisaxen/elori-jewels  
- **Demo Recording (Optional):**  
  https://res.cloudinary.com/dmc735rru/video/upload/v1768814768/elori-jewels_rcf3ef.mp4

---

## Tech Stack

- **Next.js** (App Router)
- **Shopify Storefront API (GraphQL)**
- **Stripe** (Test Mode)
- **Vercel** (Hosting & Deployment)

---

## Running the Project Locally

This project is built with **Next.js** and was bootstrapped using `create-next-app`.

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm / bun

### Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install


Start Development Server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev


Open http://localhost:3000
 in your browser to view the application.

You can edit the main page at:

app/page.js


Changes will automatically reflect during development.
