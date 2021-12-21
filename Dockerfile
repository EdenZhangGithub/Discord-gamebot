FROM node:16.13.1-alpine3.12
# Adding build tools to make yarn install work on Apple silicon / arm64 machines
RUN apk add --no-cache python2 g++ make

WORKDIR /
COPY package.json yarn.lock ./
RUN npm install --production
RUN npm run build && npm run start
COPY . .
CMD ["node", "index.js"]