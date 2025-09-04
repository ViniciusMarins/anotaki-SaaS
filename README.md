# Anotaki SaaS

Desenvolvi sozinho um projeto SaaS completo, com frontend em React e backend em .NET Core. 
O objetivo foi criar uma plataforma inspirada em modelos existentes, como a Bysell e anotaAI, para atender restaurantes e pequenos negócios, oferecendo:

- Acompanhamento de pedidos em tempo real
- Gestão de pedidos para fornecer um serviço de delivery
- Painéis de análise e relatórios de desempenho
- Métricas para acompanhamento de performance do negócio
- Gestão de clientes, produtos, horários de funcionamento, faturamento
- Experiência totalmente agradável para usuários da plataforma

O sistema foi projetado para otimizar processos, reduzir custos operacionais e melhorar a experiência do cliente, consolidando em um único ambiente todas as ferramentas essenciais para a gestão do negócio.

A ideia inicial era refinar a aplicação ao máximo, aplicando conceitos avançados para transformá-la em um software open-source pronto para comercialização. No entanto, por questões de prioridades pessoais, optei por focar em aplicar meus conhecimentos em desenvolvimento de software e extrair o máximo de aprendizado durante todo o processo.

O código está disponível e sinta-se à vontade para contribuir ou clonar o repositório para futuros aprimoramentos!

## 🚀 Tecnologias e Conceitos Utilizados

### Frontend (anotaki.frontend)
- **React 19** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Shadcn UI + Tailwind CSS 4** - Framework CSS utility-first
- **React Router DOM** - Roteamento para aplicações React
- **React Hook Form** - Biblioteca para gerenciamento de formulários
- **Zod** - Validação de esquemas TypeScript-first
- **TanStack Query** - Gerenciamento de estado servidor
- **Axios** - Cliente HTTP para requisições
- **SignalR** - Comunicação em tempo real

### Backend (anotaki.backend)
- **.NET 8** - Framework de desenvolvimento web
- **ASP.NET Core Web API** - Framework para APIs REST
- **Entity Framework Core** - ORM para .NET
- **PostgreSQL** - Banco de dados relacional
- **JWT Authentication + Refresh Token + RBAC** - Autenticação e autorização baseada em tokens e roles
- **SignalR** - Comunicação em tempo real
- **BCrypt.Net** - Hash de senhas
- **RabbitMQ** - Message broker para filas

### Conhecimentos e áreas de estudo aplicadas

- **Implementação de APIs**
- **Utilização de boas práticas e clean code no desenvolvimento** 
- **Tratamento de erros com global handlers/custom exceptions** 
- **Design e implementação de interfaces responsivas e amigáveis** 
- **Autenticação e autorização de usuários com a estratégia de RBAC (Role-Based Access Control)** 
- **Gerenciamento e utilização de banco de dados relacionais** 
- **Comunicação de serviços em tempo real utilizando WebSockets** 
- **Segurança e consistência de dados utilizando validações e hash de informações sensíveis** 
- **Escalabilidade e redução de race conditions utilizando serviço de mensageria** 
- **Encapsulamento da aplicação através de containerização**
- **Validações de formulários e proteção contra SQL Injection e XSS**
- **Utilização de cache client/server side com server state e url states**
- **Análise de dados e relátorios utilizando gráficos**
- **Manipulação de objetos JSON**
- **Otimização de querys de banco de dados utilizando ORM/SQL**
- **Entre outras...**   

### Infraestrutura
- **Docker & Docker Compose** - Containerização e orquestração
- **PostgreSQL** - Banco de dados principal
- **pgAdmin** - Interface web para PostgreSQL
- **RabbitMQ** - Sistema de mensageria

## 📁 Estrutura do Projeto

```
anotaki-SaaS/
├── anotaki.frontend/     # Aplicação React
│   ├── src/                   # Código fonte
│   ├── public/                # Arquivos públicos
│   ├── package.json           # Dependências do frontend
│   └── vite.config.ts         # Configuração do Vite
├── anotaki.backend/      # API .NET Core
│   ├── API/                # Projeto principal
│   │   ├── Controllers/      # Controllers da API
│   │   ├── Models/           # Modelos de dados
│   │   ├── Services/         # Serviços de negócio
│   │   ├── Exceptions/       # Tratamento de exceptions
│   │   ├── Data/             # Contexto do banco
│   │   ├── DTOs/             # Data Transfer Objects
│   │   ├── Hubs/             # SignalR Hubs
│   │   ├── Queues/           # Serviços de mensageria RabbitMQ
│   │   ├── Utils/            # Classes de utilidade
│   │   └── Migrations/       # Migrations do EF
│   └── docker-compose.yml    # Configuração Docker (necessário a criação)
└── README.md                 # Este arquivo
```

## 🛠️ Configuração e Execução

### 1. Clone o Repositório

```bash
git clone https://github.com/ViniciusMarins/anotaki-SaaS.git
cd anotaki-SaaS
```

### 2. Configuração do Backend

#### 2.1. Subir a Infraestrutura com Docker

Crie um arquivo `docker-compose.yml` na pasta `/anotaki.backend` e preencha com as informações necessárias de senha e usuário para os serviços do pgAdmin e RabbitMQ e configure o banco de dados.

```yml
version: '3.8'

services:
  postgres:
    image: postgres:latest
    environment:
      POSTGRES_USER: 
      POSTGRES_PASSWORD: 
      POSTGRES_DB: 
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: 
      PGADMIN_DEFAULT_PASSWORD: 
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - app-network

  rabbitmq:
    image: rabbitmq:3-management
    environment:
      RABBITMQ_DEFAULT_USER:        
      RABBITMQ_DEFAULT_PASS:    
    ports:
      - "5672:5672"     
      - "15672:15672"   
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq  
    networks:
      - app-network

volumes:
  postgres_data:
  rabbitmq_data:

networks:
  app-network:
    driver: bridge
```

 Subir apenas a infraestrutura:
```bash
cd anotaki.backend
docker-compose up -d
```

 Parar os serviços:
```bash
docker-compose down
```

Isso irá inicializar:
- PostgreSQL na porta 5432
- pgAdmin na porta 5050
- RabbitMQ na porta 5672 (management UI na porta 15672)

#### 2.2. Configurar o Banco de Dados e Variáveis de ambiente

Crie um arquivo `appsettings.json` na raiz da pasta `anotaki.backend/API`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=;Port=;Database=;Username=;Password="
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Jwt": {
    "SecretKey": "",
    "Issuer": "",
    "Audience": "",
    "ExpirationInMinutes": ""
  },
  "RefreshToken": {
    "ExpirationInDays": 
  },
  "RabbitMq": {
    "Host": "",
    "Port": ,
    "User": "",
    "Password": ""
  }
}
```

```bash
cd API
update-database
```

#### 2.3. Executar o Backend

```bash
dotnet run
```

O backend estará disponível em `https://localhost:7098` (HTTPS) ou `http://localhost:5276` (HTTP).

### 3. Configuração do Frontend

#### 3.1. Instalar Dependências

```bash
cd anotaki.frontend
npm install
```

#### 3.2. Executar o Frontend

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

## 📄 Contribuição

Este é um projeto autoral e está aberto para contribuições!
## 📞 Suporte

Para suporte, entre em contato através do email ou abra uma issue no repositório.