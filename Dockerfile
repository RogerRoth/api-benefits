
FROM node:18-alpine
# FROM node:22-alpine

RUN echo "Configuração de ambiente:" && env

RUN apk add --no-cache curl

# Configurar o diretório de trabalho
WORKDIR /app

# Copiar apenas os arquivos necessários para instalar as dependências
COPY package*.json ./

# Instalar apenas as dependências de produção
# RUN npm ci --omit=dev
RUN npm install

# Copiar o restante do código-fonte da aplicação
COPY . .

# COPY public ./public
# COPY .env .env

# Compilar o projeto NestJS
RUN npm run build

# Expor a porta configurada (ajuste conforme necessário)
EXPOSE 3333

# Comando para iniciar a aplicação no modo de produção
CMD ["npm", "run", "start:prod"]