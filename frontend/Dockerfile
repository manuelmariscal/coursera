FROM node:16-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV REACT_APP_API_URL=http://web:5000

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 