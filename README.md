# Konsi Benefícios API

<div align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" alt="RabbitMQ" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white" alt="Elasticsearch" />
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose" />
</div>

---

Este projeto faz parte de um desafio proposto pela Konsi, é uma API desenvolvida em **NestJS** para lidar com mensagens e comunicação entre diferentes serviços, utilizando **RabbitMQ**, **Redis**, e **Elasticsearch**. Ele inclui uma página estática hospedada via **Nginx**.

O desafio é fazer uma API que busque e retorne a matrícula do servidor em uma determinada API externa.

---

## Fluxograma

O fluxo abaixo demonstra as operações realizadas pelo sistema:

![Fluxograma do Sistema](assets/flow_benefits.png)

O usuário acessa uma página web, preenche o CPF e realiza uma busca. A requisição é enviada para a API, que inicialmente consulta o cache no Redis. Se o CPF for encontrado no cache, a API utiliza o índice armazenado para buscar os dados no Elasticsearch e retorna os resultados ao usuário. Caso o CPF não esteja no cache, uma mensagem é enviada para a fila no RabbitMQ. Para evitar bloqueios, a API responde ao usuário informando que os dados estarão disponíveis em breve. O RabbitMQ processa a fila e consulta uma API externa para obter os benefícios associados ao CPF. Se benefícios forem encontrados, os dados são salvos no Elasticsearch e o CPF, juntamente com seu índice, é armazenado no Redis para consultas futuras.

## Pré-requisitos

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/en) (versão 22 ou superior)

## Configuração

### 1. Clone o Repositório

Clone o repositório para o seu ambiente local:

```bash
git clone https://github.com/RogerRoth/konsi-api-beneficios.git
cd konsi-api-beneficios
```

###  2. Crie o Arquivo .env
Crie um arquivo .env copiando o .env.EXAMPLE na raiz do projeto. Abaixo deixo as variáveis de ambiente não sensíveis:

```
KONSI_BASE_URL = ''
KONSI_AUTH_USER = ''
KONSI_AUTH_PASSWORD = ''

ELASTIC_SEARCH_URL='http://elasticsearch:9200'
ELASTIC_SEARCH_USERNAME='elastic'
ELASTIC_SEARCH_PASSWORD='password'


RABBITMQ_URL='amqp://konsi:123456@rabbitmq:5672'
RABBITMQ_QUEUE='cpf_queue'
RABBITMQ_HEARTBEAT_INTERVAL_IN_SECONDS=90
RABBITMQ_DEFAULT_USER='konsi'
RABBITMQ_DEFAULT_PASS='123456'

REDIS_URL='redis://redis:6379'

PORT = 3333
```

###  3. Inicialize o Ambiente
Use o Docker Compose para inicializar o ambiente:

```bash
docker-compose up --build -d
```
Aguarde todos os serviços inicializarem, há um healthcheck para garantir que todos os serviços subam de acordo com a ordem necessária.

###  4. Verifique o Status dos Contêineres
Caso necessário, verifique o status dos contêineres:

```bash
docker-compose ps
```

###  5. Acesse a aplicação Web: 
A aplicação web esta rodando através do servidor **Nginx**, basta acessar a Url abaixo:

```bash
http://localhost
```
![Pagina web](assets/web_page.png)

Exibição dos benefícios pela página web.

###  6. Parar os Contêineres
Para parar os contêineres, use o comando:
```bash
docker-compose down
```
### Testes Unitários
Os testes unitários são importantes para garantir que cada parte da aplicação funcione corretamente de forma isolada. Este projeto utiliza o framework de testes **Vitest** para realizar os testes unitários.

#### Executando os Testes Unitários
Para executar os testes unitários, siga os passos abaixo:

1. Certifique-se de que as dependências estão instaladas:
```bash
npm install
```
2. Execute os testes unitários:

```bash
npm run test
```
3. Para ver a cobertura dos testes:
```bash
npm run test:cov
```

###  Estrutura do Projeto
- `docker-compose.yml`: Arquivo de configuração do Docker Compose.
- `Dockerfile`: Arquivo de configuração do Docker para a API NestJS.
- `src/`: Código-fonte da aplicação.
- `public/`: Arquivos estáticos servidos pelo Nginx.


###  Health Checks
Os serviços têm *health checks* configurados para garantir que estão funcionando corretamente:

- **RabbitMQ**: Verifica o status do RabbitMQ.
- **Redis**: Verifica se o Redis está respondendo a pings.
- **Elasticsearch**: Verifica o estado do cluster do Elasticsearch.
- **API**: Verifica a rota `/api/v1/health` da API.


### Recursos
- [Documentação do Docker](https://docs.docker.com/)
- [Documentação do Docker Compose](https://docs.docker.com/compose/)
- [Documentação do NestJS](https://docs.nestjs.com/)


### Contribuição
Sinta-se à vontade para abrir issues e pull requests para melhorias e correções.

## Licença
Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.