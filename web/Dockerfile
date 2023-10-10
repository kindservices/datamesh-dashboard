FROM node:19-alpine3.16 AS build

WORKDIR /app
COPY . .
RUN yarn
RUN yarn build

FROM node:19-alpine3.16 AS deploy

WORKDIR /app
RUN rm -rf ./*
COPY --from=build /app/package.json .
COPY --from=build /app/build .
RUN yarn --prod
ENTRYPOINT ["node", "index.js"]