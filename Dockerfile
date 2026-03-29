# Multi-stage build for React application
FROM node:18-alpine AS build

# Install ffmpeg for video optimization
RUN apk add --no-cache ffmpeg

# Create React App: these must exist at build time
ARG REACT_APP_API_URL=/api
ARG REACT_APP_TIMEZONE=Asia/Kolkata
ARG REACT_APP_TINYMCE_API_KEY=
ARG REACT_APP_GOOGLE_ANALYTICS_ID=
ENV REACT_APP_API_URL=$REACT_APP_API_URL \
    REACT_APP_TIMEZONE=$REACT_APP_TIMEZONE \
    REACT_APP_TINYMCE_API_KEY=$REACT_APP_TINYMCE_API_KEY \
    REACT_APP_GOOGLE_ANALYTICS_ID=$REACT_APP_GOOGLE_ANALYTICS_ID

WORKDIR /app

COPY package.json package-lock.json ./

# Using --legacy-peer-deps because react-helmet-async doesn't support React 19 yet
RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run optimize || echo "Asset optimization skipped (ffmpeg may not be available)"

RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Install wget for health checks
RUN apk add --no-cache wget

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Set proper permissions (nginx user already exists in nginx:alpine)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    mkdir -p /var/run/nginx && \
    chown -R nginx:nginx /var/run/nginx

# Switch to non-root user (nginx user already exists in nginx:alpine)
USER nginx

# Expose port 80
EXPOSE 80

# Health check (curl is not available in alpine, use wget instead)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
