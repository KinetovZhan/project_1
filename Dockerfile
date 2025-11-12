# -- Сборка приложения --
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm config set strict-ssl false
# RUN npm cache clean --force
RUN npm install --include=dev
# RUN ls -la node_modules
# CMD ["sh"]
COPY . .
RUN npm run build

# -- Production --
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 5500
CMD ["nginx", "-g", "daemon off;"]