# European HealthTech Co-Creation Innovation Platform

Welcome to the European HealthTech Co-Creation Innovation Platform. This is a Next.js web application built with a modern stack including Prisma, Supabase, and Tailwind CSS (or standard CSS modules based on the configuration), designed to connect doctors, engineers, and healthcare professionals.

## Tech Stack
- **Framework:** Next.js
- **Database ORM:** Prisma
- **Backend & Authentication:** Supabase (PostgreSQL)

## Getting Started Locally

To run this application on your local machine, please follow the steps below.

### 1. Install Dependencies
Make sure you have Node.js installed, then run the following in your terminal:
```bash
npm install
```

### 2. Configure Environment Variables
You need to set up your environment variables for both database access and authentication.

Duplicate the `.env.example` file twice:
1. Rename one to `.env`
2. Rename the other to `.env.local`

**Using Supabase Cloud (Recommended):**
- Create a free project on [Supabase](https://supabase.com).
- Copy your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
- Copy your Database URIs to `.env`:
  - `DATABASE_URL` (Transaction Mode / pooler string - port 6543)
  - `DIRECT_URL` (Session Mode / direct string - port 5432)

**Using Local Docker Stack:**
- You can also run Supabase locally using the CLI:
  ```bash
  npx supabase start
  ```
- Copy the provided local URLs/Keys to your `.env` and `.env.local` files.

### 3. Generate Database Client & Push Schema
Sync your database with Prisma:
```bash
npx prisma generate
npx prisma db push
```

### 4. Start the Application
Start your Next.js local development server:
```bash
npm run dev
```

The app should now be running on [http://localhost:3000](http://localhost:3000).

## Project Documentation
- **Architecture**: See `ARCHITECTURE.md`
- **Design Guidelines**: See `DESIGN.md` and `CLAUDE.md`
