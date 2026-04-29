# Step 1: Build the React application
FROM node:20-slim AS build

# Set the working directory
WORKDIR /app

# Copy package management files
COPY package*.json ./
# Copy bun lockfile if available
COPY bun.lock* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
# Note: In Vite, environment variables starting with VITE_ are embedded during build.
# If you have secrets, consider passing them as --build-arg VITE_MY_VAR=value
RUN npm run build

# Step 2: Serve the application using Nginx
FROM nginx:stable-alpine

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the build stage to the nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 (Google Cloud Run's default port)
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
