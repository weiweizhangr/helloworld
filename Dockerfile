FROM node:latest
WORKDIR /usr/src/app
RUN npm install consul express prom-client

COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
