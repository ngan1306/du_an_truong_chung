# syntax=docker/dockerfile:1
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

FROM nginx:alpine

# Runtime defaults; Render can override these service environment variables.
ENV PORT=10000 \
    API_PROXY_URL=http://127.0.0.1:5000

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]
