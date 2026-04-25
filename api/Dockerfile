# Latest bun alpine image
FROM oven/bun:alpine

# Sets the working directory
WORKDIR /usr/src/app

# Copies package.json and bun.lock to the Docker environment
COPY package.json bun.lock ./

# Installs required dependencies
RUN bun install --frozen-lockfile

# Copies contents
COPY . .

# Stars the application
CMD bun start
