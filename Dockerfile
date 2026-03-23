FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate Prisma client and build Next.js app
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
