FROM node:12.18.1-alpine
WORKDIR /app
COPY .env .env
COPY package*.json ./
RUN npm install --only=production
COPY ./src ./src
# EXPOSE 4001
CMD npm start