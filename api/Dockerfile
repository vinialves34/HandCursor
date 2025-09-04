FROM node:22.19.0

# Instalar dependências nativas do robotjs
RUN apt-get update && apt-get install -y \
    build-essential \
    libxtst6 \
    libxtst-dev \
    libx11-dev \
    libx11-xcb-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
CMD ["npm", "start"]
