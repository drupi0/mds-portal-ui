FROM node:alpine AS BUILD
COPY . /app
WORKDIR /app

# COPY package*.json /app/
RUN npm ci
RUN npm run build --prod

FROM nginx:alpine
COPY --from=BUILD /app/dist /usr/share/nginx/html 
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY environment.json /usr/share/nginx/html
