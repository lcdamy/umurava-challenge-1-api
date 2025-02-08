# Project environment
FROM node:18.0.0-alpine3.15

# Install MongoDB client tools
RUN apk update && \
    apk add --no-cache mongodb-tools

# Container directory
WORKDIR /app

# Copy the wait-for-it.sh script explicitly
COPY wait-for-it.sh /app/wait-for-it.sh

# Make wait-for-it.sh executable
RUN chmod +x /app/wait-for-it.sh

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install packages
RUN npm install

# Copy the rest of the application files
COPY . .

# Container port
EXPOSE 3001

# Last command to run the project
CMD ["sh", "-c", "/app/wait-for-it.sh mongo:27017 -- npm run migrate:up && npm run dev"]
