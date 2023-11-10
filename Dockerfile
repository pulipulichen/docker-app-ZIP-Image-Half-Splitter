FROM node:18.12.1-buster

RUN apt-get update

RUN apt-get install -y \
    unzip zip imagemagick

COPY package.json /
RUN npm install

CMD ["bash"]

RUN localedef -c -f UTF-8 -i zh_CN zh_CN.utf-8 zh_TW zh_TW.utf-8 