# ----------------------------------------------------------------------
# Stage 1: Build & Install Dependencies (Builder Stage)
# Uses a slightly larger image to handle package installation reliably.
# ----------------------------------------------------------------------
# Stage 1: Build & Install Dependencies (Builder Stage)
# Uses a slightly larger image to handle package installation reliably.
# ----------------------------------------------------------------------
FROM node:22-alpine AS builder

# Security updates
RUN apk update && apk upgrade

# Set the working directory for all subsequent instructions
WORKDIR /usr/src/app

# Set the environment variable for production (critical for security/size)
ENV NODE_ENV production

# 1. Copy only package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# 2. Install dependencies (only production dependencies are installed)
RUN npm ci --only=production && \
    npm cache clean --force

# ----------------------------------------------------------------------
# Stage 2: Final Production Runtime Image
# Copies only the necessary files for the application to run.
# ----------------------------------------------------------------------
FROM node:22-alpine AS production
RUN apk update && apk upgrade

# Set the working directory
WORKDIR /usr/src/app

# Use a non-root user for enhanced security (recommended best practice)
USER node

# Copy the installed node_modules from the 'builder' stage
# Rename source stage from 'base' to 'builder' to avoid ambiguity
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy the application source code (your .js files)
COPY --chown=node:node . .

# Expose the port your Node.js application listens on (e.g., 3000)
EXPOSE 3000

# Command to run the application
CMD [ "node", "src/index.js" ]
