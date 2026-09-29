# Stage 1: Build Stage
FROM docker.io/library/node:20-alpine AS builder
# Set the working directory in the container
WORKDIR /app

# Copy package.json, package-lock.json, and .npmrc
COPY package.json package-lock.json ./
COPY .npmrc ./

# Install dependencies (including devDependencies for building)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application in standalone mode
RUN npm run build

# Stage 2: Production Stage
FROM docker.io/library/node:20-alpine AS production

WORKDIR /app

# Copy the standalone output from build stage
COPY --from=builder /app/.next/standalone ./

# Copy the static files needed for CSS and assets
COPY --from=builder /app/.next/static ./.next/static

# Copy production package.json and lockfile
COPY --from=builder /app/package.json ./

# Install only production dependencies
#RUN npm install --production

# Expose port
EXPOSE 3000

# Start the standalone server
CMD ["node", "server.js"]
