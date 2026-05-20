# Backend Dockerfile for Meal Fit
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

ENV PORT=5000
ENV HOST=0.0.0.0

EXPOSE 5000

CMD ["node", "server.js"]
