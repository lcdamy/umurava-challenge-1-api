# Project env
FROM node:18.0.0-alpine3.15

# Install MongoDB client tools
RUN apk update && \
    apk add --no-cache mongodb-tools

# Container directory
WORKDIR /app

#  Copy my file to Container
COPY . .

# Install packages
RUN npm install

# container port
EXPOSE 3001

# last command to run the project
CMD ["npm","run", "dev"]

