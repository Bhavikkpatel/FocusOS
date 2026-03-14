# Neon Database Setup - Quick Guide

## Steps to Get Your Connection String

1. **Open Neon**: https://neon.tech
   
2. **Sign Up**: 
   - Click "Sign up"
   - Use GitHub (fastest) or email
   - It's completely free, no credit card needed

3. **Create Project**:
   - After signup, click "Create Project" or "New Project"
   - Project name: `FocusOS` (or any name you like)
   - Region: Choose closest to you
   - PostgreSQL version: 16 (or latest)
   - Click "Create Project"

4. **Get Connection String**:
   - After project creation, you'll see a connection string
   - Look for: `postgresql://user:password@ep-xxxxx.neon.tech/dbname?sslmode=require`
   - Click the "Copy" button next to the connection string
   - **IMPORTANT**: Make sure you copy the string that ends with `?sslmode=require`

5. **Send me the connection string** and I'll:
   - Update the `.env` file
   - Run database migrations
   - Start the development server
   - Open the app in your browser

## Screenshot Guide

When you're on Neon dashboard, you should see:
- A section called "Connection String" or "Connection Details"
- A dropdown that might say "Node.js" or "Prisma"
- Select "Prisma" if available
- Copy the entire string

## Example Connection String Format

```
postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

**Once you have the connection string, paste it here and I'll handle the rest!**
