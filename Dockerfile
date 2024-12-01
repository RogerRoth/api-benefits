# Dockerfile
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Copy static files
COPY public ./public

EXPOSE 3333
CMD [ "npm", "run", "start:prod" ]
