FROM node:12.18.4

ENV NODE_ENV=production

# Create app directory
RUN mkdir -p /usr/node/app
WORKDIR /usr/node/app

# Copy sources
COPY package.json package-lock.json tsconfig.json ./
COPY ./src ./src

# Install dependencies
RUN npm install && npm cache clean --force

USER node

CMD ["./node_modules/.bin/ts-node-transpile-only", "-r", "dotenv/config", "./src/index.ts"]
