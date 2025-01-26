# Use a lightweight Node.js image
FROM node:20-alpine

# Create and change to the app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build your Next.js app for production
RUN npm run build

# Expose the port Next.js runs on (default is 3000)
EXPOSE 3000

# Run Next.js in production mode
CMD ["npm", "run", "start"]
