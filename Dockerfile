FROM node:22-alpine
WORKDIR /app
COPY package.json engine.js server.js ./
COPY public ./public
RUN mkdir -p /app/storage && chown -R node:node /app
USER node
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","server.js"]

