# Project env
FROM node:18.0.0-alpine3.15

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

