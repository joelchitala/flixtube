FROM node:12.18.1-alpine
WORKDIR /app
COPY .env .env
COPY package*.json ./
RUN npm install --only=production
COPY ./src ./src
COPY ./videos ./videos
# EXPOSE 4000
CMD npm start