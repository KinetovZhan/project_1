# -- Сборка приложения --
FROM node:24.11.1-alpine3.22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm config set strict-ssl false
RUN npm install --include=dev
COPY . .
# RUN npm run build

# -- Production --
# FROM node:18-alpine AS production
# COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
CMD ["npm", "run", "dev"]