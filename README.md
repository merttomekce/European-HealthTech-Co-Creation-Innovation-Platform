# HEALTH AI - European HealthTech Co-Creation Innovation Platform

![GitHub Language Composition](https://img.shields.io/badge/TypeScript-69.3%25-blue) ![CSS](https://img.shields.io/badge/CSS-27.2%25-green) ![JavaScript](https://img.shields.io/badge/JavaScript-3.1%25-yellow)

## 🏥 About HEALTH AI

**HEALTH AI** is a secure, GDPR-compliant web platform enabling structured partner discovery between healthcare professionals and engineers. It facilitates multidisciplinary health-tech innovation through announcement-based matching and secure meeting initiation.

### Key Features
- 🔍 **Intelligent Partner Discovery**: Connect healthcare professionals with tech innovators based on shared interests and expertise
- 📢 **Announcement-Based Matching**: Post and discover health-tech innovation opportunities
- 🔐 **GDPR Compliant**: Built with privacy and data protection at its core
- 🤝 **Secure Collaboration**: Initiate and manage secure meetings and partnerships
- 🌍 **European Healthcare Innovation**: Supporting European health-tech ecosystem development
- 🚀 **AI-Powered Features**: Semantic search and intelligent recommendation engine
- 👥 **Multidisciplinary Teams**: Bridge the gap between healthcare and technology sectors

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js (React) |
| **Language** | TypeScript (69.3%) |
| **Styling** | CSS (27.2%) |
| **Database ORM** | Prisma |
| **Backend & Auth** | Supabase (PostgreSQL) |
| **Database** | PostgreSQL with pgvector |
| **Vector Search** | Supabase pgvector |
| **AI Embeddings** | Local embedding model |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Docker** (optional, for local Supabase stack)

## 🚀 Getting Started Locally

Follow these steps to set up and run HEALTH AI on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/merttomekce/European-HealthTech-Co-Creation-Innovation-Platform.git
cd European-HealthTech-Co-Creation-Innovation-Platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create your environment configuration files by duplicating the `.env.example` file:

```bash
cp .env.example .env
cp .env.example .env.local
```

#### Option A: Using Supabase Cloud (Recommended for Production)

1. Create a free project on [Supabase](https://supabase.com)
2. Navigate to your project settings and copy your credentials
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Add to `.env`:
   ```
   DATABASE_URL=postgresql://postgres:[password]@[host]:6543/postgres
   DIRECT_URL=postgresql://postgres:[password]@[host]:5432/postgres
   ```

#### Option B: Using Local Docker Stack (Recommended for Development)

```bash
npx supabase start
```

This will output your local Supabase URLs and keys. Copy them to your `.env` and `.env.local` files.

#### AI/Vector Search Configuration

For semantic search capabilities, configure your local embedding model:

```env
LOCAL_AI_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
LOCAL_AI_EMBEDDING_DIMENSIONS=384
```

### 4. Generate Prisma Client & Sync Database

```bash
# Generate the Prisma client
npx prisma generate

# Push your database schema
npx prisma db push

# (Optional) Seed your database
npx prisma db seed
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utility functions and helpers
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── styles/                 # CSS stylesheets
├── docs/                   # Project documentation
└── .env.example            # Environment variables template
```

## 🔧 Available npm Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run linting checks
npm run prisma      # Access Prisma CLI
```

## 🔐 Security & GDPR Compliance

HEALTH AI is built with privacy and security as core principles:
- ✅ GDPR-compliant data handling
- ✅ Secure authentication via Supabase
- ✅ Encrypted database connections
- ✅ Data minimization practices
- ✅ User consent management
- ✅ Audit logging capabilities

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Support & Contact

For questions, issues, or collaboration opportunities:
- **Repository**: [European-HealthTech-Co-Creation-Innovation-Platform](https://github.com/merttomekce/European-HealthTech-Co-Creation-Innovation-Platform)
- **Issues**: [GitHub Issues](https://github.com/merttomekce/European-HealthTech-Co-Creation-Innovation-Platform/issues)

## 🌟 Acknowledgments

HEALTH AI is part of the European HealthTech Co-Creation Innovation Platform, dedicated to fostering innovation in healthcare through collaboration between medical professionals and technology experts.

---

**Made with ❤️ for European Healthcare Innovation**
