FROM node:20

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Expose the port on which the app will run
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]