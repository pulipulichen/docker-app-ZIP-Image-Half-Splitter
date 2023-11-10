FROM node:18.12.1-buster

RUN apt-get update

RUN apt-get install -y \
    unzip zip imagemagick

COPY package.json /
RUN npm install

CMD ["bash"]

ENV LNAG="C.UTF-8"