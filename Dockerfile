# Project env
FROM node:18.0.0-alpine3.15

# Install MongoDB client tools
RUN apk update && \
    apk add --no-cache mongodb-tools

# Container directory
WORKDIR /app

# Copy all necessary files
COPY . .

# Make wait-for-it.sh executable
RUN chmod +x wait-for-it.sh

# Install packages
RUN npm install

# Container port
EXPOSE 3001

# Last command to run the project
CMD ["sh", "-c", "./wait-for-it.sh mongo:27017 -- npm run migrate:up && npm run dev"]
