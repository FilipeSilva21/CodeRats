# 🐀 DevRats

> **Commit. Compete. Conquiste.**

DevRats é uma plataforma de desenvolvimento gamificada que monitora a atividade no GitHub e transforma a programação em um jogo competitivo. Desenvolvedores ganham pontos por commits, competem em squads (equipes) e sobem nos rankings — tudo com proteção anti-trapaça.

---

## 🏗️ Arquitetura

```
CodeRats/
├── backend/          # Java + Spring Boot API (porta 8080)
│   ├── src/main/java/com/devrats/
│   │   ├── DevRatsApplication.java # Ponto de entrada
│   │   ├── controller/             # Controllers REST
│   │   ├── service/                # Lógica de Negócio (Pontuação, Autenticação, Squad)
│   │   ├── model/                  # Entidades JPA
│   │   ├── repository/             # Repositórios Spring Data
│   │   ├── security/               # HMAC & Filtros de Segurança
│   │   └── websocket/              # WebSockets em tempo real
│   └── docker-compose.yml          # PostgreSQL 16
│
├── mobile/           # React Native + Expo (porta 8081)
│   ├── app/                        # Expo Router (roteamento baseado em arquivos)
│   │   ├── (auth)/login.tsx        # Tela de login do GitHub
│   │   └── (tabs)/                 # Início, Squad, Ranking, Perfil
│   └── src/
│       ├── components/ui/          # Sistema de design (Botão, Card, Badge, Avatar)
│       ├── features/               # Stores Zustand (auth, scoring, squad)
│       ├── lib/                    # Cliente de API, hook de WebSocket
│       └── theme/                  # Tema Clean Modern (Claro/Escuro)
│
└── spec.md           # Especificação do projeto
```

## 🛠️ Tecnologias

| Camada     | Tecnologia                         |
|------------|------------------------------------|
| **Backend**    | Java 21, Spring Boot 3.x, Spring Data JPA |
| **Frontend**   | React Native, Expo SDK 54, Expo Router (Web + Mobile) |
| **Banco de Dados**   | PostgreSQL 16 (Docker)            |
| **Autenticação**       | GitHub OAuth 2.0, JWT             |
| **DI**         | Spring IoC                        |
| **Tempo Real**  | Spring WebSockets                 |
| **Estado**      | Zustand                           |
| **Cliente HTTP**| Axios (com atualização automática de JWT) |

---

## 🚀 Primeiros Passos

### Pré-requisitos

- **JDK 21+** — [Download](https://adoptium.net/)
- **Node.js 20+** — [Download](https://nodejs.org/)
- **Docker Desktop** — [Download](https://www.docker.com/products/docker-desktop/)

### 1. Iniciar o Banco de Dados

```bash
cd backend
docker-compose up -d
```

### 2. Executar o Backend

```bash
cd backend
mvn spring-boot:run
```

A API estará disponível em `http://localhost:8080`.  
Verificação de saúde: `GET http://localhost:8080/api/health`

### 3. Executar o Frontend

```bash
cd mobile
npm install
npx expo start
```

Pressione `w` para abrir no navegador, ou escaneie o código QR com o Expo Go.

---

## 📡 Endpoints da API

### Autenticação
| Método | Endpoint             | Autenticação | Descrição             |
|--------|----------------------|-------|-----------------------|
| POST   | `/api/auth/refresh`  | Não    | Atualizar token de acesso |
| GET    | `/api/auth/me`       | JWT   | Obter usuário atual      |
| DELETE | `/api/auth/logout`   | JWT   | Logout                |

### Webhooks
| Método | Endpoint               | Autenticação | Descrição             |
|--------|------------------------|-------|-----------------------|
| POST   | `/api/webhooks/github` | HMAC  | Eventos de push do GitHub |

### Pontuação
| Método | Endpoint               | Autenticação | Descrição             |
|--------|------------------------|-------|-----------------------|
| GET    | `/api/scores/me`       | JWT   | Resumo de pontuação   |
| GET    | `/api/scores/me/daily` | JWT   | Progresso diário      |

### Squads (Equipes)
| Método | Endpoint              | Autenticação | Descrição             |
|--------|-----------------------|-------|-----------------------|
| GET    | `/api/squads/my`      | JWT   | Listar minhas squads  |
| GET    | `/api/squads/:id`     | JWT   | Detalhes da squad     |
| POST   | `/api/squads`         | JWT   | Criar squad           |
| POST   | `/api/squads/join`    | JWT   | Entrar por código de convite |

### Ranking (Leaderboard)
| Método | Endpoint                   | Autenticação | Descrição             |
|--------|----------------------------|-------|-----------------------|
| GET    | `/api/leaderboard/global`  | Não    | Ranking global        |
| WS     | `/leaderboard/:squadId`    | Não    | Atualizações em tempo real |

---

## 🎮 Regras de Pontuação

| Regra                   | Detalhes                                     |
|-------------------------|----------------------------------------------|
| **Pontos base**         | 10 pts por commit válido                     |
| **Penalidade Markdown** | 2 pts para commits apenas com arquivos `.md` |
| **Limite diário**       | Máximo de 200 pts por dia                    |
| **Filtros anti-trapaça**| Commits vazios, merge commits, sem alteração de arquivos |
| **Detecção de duplicata**| Commits são pontuados apenas uma vez (por hash) |

---

## 🔐 Variáveis de Ambiente

| Variável               | Descrição                    | Padrão             |
|------------------------|------------------------------|--------------------|
| `PORT`                 | Porta do servidor            | `8080`             |
| `DATABASE_URL`         | URL JDBC do PostgreSQL       | `localhost:5432`   |
| `DATABASE_USER`        | Usuário do banco de dados    | `postgres`         |
| `DATABASE_PASSWORD`    | Senha do banco de dados      | `devrats123`       |
| `GITHUB_CLIENT_ID`     | Client ID do GitHub App      | —                  |
| `GITHUB_CLIENT_SECRET` | Client Secret do GitHub App  | —                  |
| `GITHUB_WEBHOOK_SECRET`| Segredo de assinatura do webhook | —                  |

---

## 📱 Telas do Mobile

| Tela          | Descrição                                       |
|---------------|-------------------------------------------------|
| **Login**     | OAuth do GitHub com branding e destaques de recursos |
| **Home**      | Dashboard de pontos, progresso diário, estatísticas de sequência (streak) |
| **Squad**     | Criar/entrar em squads, ver ranking dos membros |
| **Ranking**   | Ranking global com sistema de medalhas         |
| **Perfil**    | Estatísticas do usuário, status da integração com GitHub, sair |

---

## 🧑‍💻 Desenvolvimento

### Filosofia da Estrutura do Projeto

- **Arquitetura baseada em recursos (Feature-based)** — cada domínio (auth, scoring, squad) é independente
- **Ecossistema Spring** — Arquitetura orientada a serviços com injeção de dependência
- **Zustand stores** — gerenciamento de estado leve baseado em hooks
- **Tokens de design** — tema centralizado (Clean Modern) com suporte dinâmico para modos claro e escuro

### Comandos Úteis

```bash
# Backend: apenas compilar (sem executar)
cd backend && mvn compile

# Backend: limpeza e build
cd backend && mvn clean package

# Frontend: corrigir versões de dependência
cd mobile && npx expo install --fix

# Banco de Dados: resetar
cd backend && docker-compose down -v && docker-compose up -d
```

---

## 📝 Licença

Este projeto é privado e proprietário.
