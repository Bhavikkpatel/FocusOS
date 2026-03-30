# 🚀 FocusOS: The Anti-Gravity Execution Environment

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Managed-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/agpl-3.0)
[![Author](https://img.shields.io/badge/Author-Bhavikk@Intel-0071C5?style=for-the-badge&logo=intel)](https://github.com/Bhavikkpatel)

FocusOS is a professional-grade, keyboard-first execution environment designed for thinkers and makers who demand absolute focus. Unlike traditional "task managers" that prioritize organization over action, FocusOS is an **Anti-Gravity Engine** for your mind—eliminating the cognitive weight of management and providing a zero-friction portal to your work.

---

## 🏗️ The Anti-Gravity Engine: How it Works

The Anti-Gravity Engine is a high-performance execution layer designed to eliminate the cognitive load of traditional task management. It is built on three core pillars:

- **Ghost UI Protocol**: More than a visual style, this is a functional interaction standard. The interface features **dynamic opacity layers** that modulate based on your interaction state, ensuring 0% visual noise while you are in a flow state.
- **Zero-Friction Entry**: A globally accessible command bar that allows for instantaneous task capture and mission launching. No clicking through menus; just type, enter, and execute.
- **Flow Time Tracking**: High-precision session logging powered by sub-millisecond context switching. Designed to mirror the way humans actually work—with deep focus sessions, short bursts, and intentional reflection.

---

## ⚡ Tech Stack & Performance

FocusOS is built to production-grade standards with a focus on speed and reliability:

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) for an instantaneous, reactive UI.
- **ORM**: [Prisma](https://www.prisma.io/) for type-safe database access and migrations.
- **Database**: [PostgreSQL](https://www.postgresql.org/) with specialized indexing. The **"Focus Switch"** is designed to be near-instantaneous, ensuring no latency between thought and execution.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) for high-performance, client-side state orchestration.

---

## 🔒 Privacy-First & Open Source

FocusOS is a community-driven sanctuary. We value **Execution** over corporate tracking.

- **Self-Hosting**: You own your data. Deploy to your own infrastructure with a single PostgreSQL instance.
- **Provider Agnostic**: No multi-tenant vendor lock-in. Designed for local-first or private cloud deployment.
- **Open Source**: Licensed under the **GNU Affero General Public License v3 (AGPLv3)**.

---

## 🚀 Quick Start (Self-Hosting)

### 1. Prerequisites
- **Node.js** (v20 or higher)
- **PostgreSQL** (Database)
- **NextAuth** Secret (For secure sign-in)

### 2. Setup
```bash
git clone https://github.com/Bhavikkpatel/FocusOS.git
npm install
cp .env.example .env
```

### 3. Database Initialization
```bash
npx prisma db push
npx prisma generate
```

### 4. Launch
```bash
npm run dev
```

---

## 🤝 Contributing

We value high-tier engineering and clean code. If you want to build the future of distraction-free execution:

- **Found a bug?** Open an Issue.
- **Have an idea?** Start a Discussion.
- **Want to build?** PRs are welcome. 

---

## 🖋️ Author

**Bhavikk Patel** – Software Engineer @ **Intel** | Ex-**Zoho**.  
Focused on high-performance execution environments and minimalist system design.

---

## 📜 License

FocusOS is licensed under the **GNU Affero General Public License v3 (AGPLv3)**. See the [LICENSE](./LICENSE) file for more details.