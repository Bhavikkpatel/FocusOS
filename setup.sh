#!/bin/bash

echo "🚀 Setting up FocusOS developer environment..."

# 1. Setup Environment Variables
if [ ! -f .env ]; then
  echo "📄 Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️  IMPORTANT: Please update .env with your real database and storage credentials."
else
  echo "✅ .env file already exists."
fi

# 2. Install Dependencies
echo "📦 Installing npm dependencies..."
npm install

# 3. Database Setup
echo "🗄️  Setting up Prisma database client..."
npx prisma generate

echo "🚀 Pushing schema to the database..."
npx prisma db push

echo "🎉 Setup complete! Start the application with:"
echo "   npm run dev"
