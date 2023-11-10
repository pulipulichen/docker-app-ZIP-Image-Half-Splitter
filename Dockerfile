FROM node:18.12.1-buster

RUN apt-get update

RUN apt-get install -y \
    unzip zip imagemagick

COPY package.json /
RUN npm install

CMD ["bash"]

ENV LNAG="C.UTF-8"

RUN apt-get install -y locales
RUN locale-gen zh_TW.UTF-8
ENV LANG zh_TW.UTF-8
ENV LC_ALL zh_TW.UTF-8