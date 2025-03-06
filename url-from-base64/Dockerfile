FROM node:20-alpine

EXPOSE 3000

RUN mkdir /opt/node_app && chown node:node /opt/node_app && npm install typescript -g

WORKDIR /opt/node_app

USER node

COPY --chown=node:node package*.json ./

RUN npm install && npm cache clean --force

COPY --chown=node:node . .

RUN tsc

CMD ["node", "dist/app.js"]
