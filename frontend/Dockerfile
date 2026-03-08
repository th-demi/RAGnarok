FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source
COPY . .

# Build the app (optional for dev, but good practice. For dev we might just use 'pnpm dev')
# For production we would build and start. 
# The prompt says "Ensure project runs with pnpm install pnpm dev". 
# Usually in docker compose dev we just run pnpm dev.

EXPOSE 3000

CMD ["pnpm", "dev"]
