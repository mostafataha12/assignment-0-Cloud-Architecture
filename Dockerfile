# Use Node.js as the base image
FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose port (update this based on what port your app uses)
EXPOSE 8000

# Command to run the application
CMD ["npm", "start"]