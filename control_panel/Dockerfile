FROM node:latest
WORKDIR /code
COPY . /code
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]