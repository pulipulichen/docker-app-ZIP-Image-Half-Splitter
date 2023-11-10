FROM node:18.12.1-bullseye

RUN apt-get update

RUN apt-get install -y \
    unzip zip imagemagick

COPY package.json /
RUN npm install

CMD ["bash"]

ENV LNAG="C.UTF-8"

RUN DEBIAN_FRONTEND=noninteractive
RUN apt-get install -y locales
RUN locale-gen zh_TW.UTF-8
RUN locale-gen zh_CN.UTF-8
RUN update-locale
ENV LANG zh_TW.UTF-8
ENV LC_ALL zh_TW.UTF-8
RUN localedef -c -f UTF-8 -i zh_CN zh_CN.utf8
RUN localedef -c -f UTF-8 -i zh_TW zh_TW.utf8

# PDF抽取圖片 20231110-2214 
RUN apt-get install -y \
    poppler-utils 

