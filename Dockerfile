# Uses latest bun alpine image for apk package manager
FROM oven/bun:alpine AS builder

# Installs required system dependencies
RUN apk add --no-cache python3 make g++

# Sets the environment variable to point to Python
ENV PYTHON python3

# Sets the working directory
WORKDIR /usr/src/app

# Copies package.json and package-lock.json to the Docker environment
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copies contents
COPY . .

# Stars the application
CMD bun src/index.ts
