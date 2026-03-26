# 🚀 FocusOS: Anti-Gravity Execution Environment

FocusOS is a minimalist, keyboard-first, and distraction-free execution system built for thinkers and makers who value deep work. It silences the noise and provides a "Zero-Gravity" portal to your tasks.

---

## 🏗️ Architecture & Philosophy

- **Execution over Management**: No infinite folders. No metric traps. Just pick a task and enter the flow.
- **Ghost UI**: The interface adapts to your state, fading away when you are focused.
- **Privacy First**: Fully self-hostable with **AGPLv3** open-source code.
- **Modern Stack**: Built with Next.js 14, Prisma, PostgreSQL (Supabase), and Cloudflare R2.

---

## ⚡ Quick Start (Self-Hosting)

FocusOS is designed to be deployed and owned by you. Follow these steps to spin up your personal sanctuary.

### 1. Prerequisites

- **Node.js** (v20 or higher)
- **PNPM** or **NPM**
- **PostgreSQL** (We recommend [Supabase](https://supabase.com))
- **Google Auth** (For secure sign-in via NextAuth)
- **Cloudflare R2** (Optional, for task attachments)

### 2. Clone and Install

```bash
git clone https://github.com/Bhavikkpatel/FocusOS.git
cd FocusOS
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory and populate it with your credentials. See `.env.example` for the required keys.

```env
# Database
DATABASE_URL="postgres://..."

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-id"
GOOGLE_CLIENT_SECRET="your-secret"

# Storage (Optional)
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
R2_ENDPOINT="..."
```

### 4. Database Setup

```bash
npx prisma db push
npx prisma generate
```

### 5. Running FocusOS

```bash
npm run dev
```

---

## 🛡️ Deployment

### Vercel / Cloudflare Pages

1. Fork this repository.
2. Link your repository to Vercel/Cloudflare.
3. Add your Environment Variables.
4. Set the build command to `npm run build` and the output directory to `.next`.

---

## 🤝 Community & Contributing

FocusOS is a community-driven sanctuary. We value **Execution** over corporate fluff.

- **Found a bug?** Open an Issue.
- **Have an idea?** Start a Discussion.
- **Want to build?** PRs are welcome. 

See the [Features Page](https://focusos.io/features) and [Our Story](https://focusos.io/about) for more depth.

---

## 📜 License

FocusOS is licensed under the **GNU Affero General Public License v3 (AGPLv3)**. See the [LICENSE](./LICENSE) file for more details.