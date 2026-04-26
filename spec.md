\# Product Specification: DevRats (Working Title)



\## 1. Visão Geral do Produto

O "DevRats" é uma plataforma gamificada para desenvolvedores, inspirada na dinâmica do "Gym Rats". O objetivo é incentivar a consistência na programação (o "commit de cada dia") através de pressão social positiva, competições em \*squads\* (equipes) e tabelas de classificação (leaderboards). A plataforma rastreia a atividade do usuário no GitHub de forma automática e segura, convertendo esforço real de código em pontos.



\## 2. Plataformas e Stack Tecnológico

A aplicação será multiplataforma, compartilhando a mesma base de código para Web e Mobile.



\* \*\*Front-end (Cross-platform):\*\* Ionic com Angular \*ou\* React Native com Expo (Web + Mobile).

\* \*\*Back-end (API Restful):\*\* .NET 8 \*ou\* Java com Spring Boot.

\* \*\*Comunicação em Tempo Real (Opcional/Recomendado):\*\* SignalR ou WebSockets para atualização instantânea dos placares.



\## 3. Arquitetura de Integração com GitHub

A comunicação com o código do usuário será feita utilizando a arquitetura moderna de \*\*GitHub Apps\*\*, garantindo segurança e privacidade.



\* \*\*Autenticação:\*\* GitHub OAuth (apenas para capturar Perfil e Username).

\* \*\*Motor de Rastreamento:\*\* Webhooks. O sistema não fará requisições de \*polling\* (perguntar a toda hora). O GitHub enviará um \*Payload JSON\* via POST para a API sempre que uma ação ocorrer.

\* \*\*Segurança da Integração:\*\* O aplicativo solicitará as menores permissões possíveis:

&#x20;   \* `Metadata`: Read-only

&#x20;   \* `Contents`: Read-only (estritamente para receber notificações de \*Push\*)

&#x20;   \* `Pull Requests`: Read-only (opcional, para bônus de pontuação)

\* \*\*Instalação Granular:\*\* O usuário terá a liberdade de instalar o app apenas nos repositórios que desejar (ex: apenas projetos pessoais, bloqueando repositórios corporativos).



\## 4. Segurança e Validação (Anti-Fraude)

Para manter a integridade da competição, o back-end implementará rigorosos controles de segurança:



1\.  \*\*Validação de Origem (Webhook Secret):\*\* Toda requisição recebida no endpoint `/webhooks` será validada utilizando criptografia HMAC (`x-hub-signature-256`) comparando o JSON recebido com o \*Secret\* cadastrado no GitHub. Requisições sem a assinatura correta serão descartadas.

2\.  \*\*Anti-Cheat (Regras de Negócio):\*\*

&#x20;   \* Limites de pontos diários para evitar \*farming\* (ex: fazer 500 commits em um dia).

&#x20;   \* Valorização de \*streaks\* (dias consecutivos) sobre volume bruto.

&#x20;   \* Filtros no back-end para ignorar commits vazios (`--allow-empty`) e balancear pontuação em arquivos de documentação (`.md`).



\## 5. Dinâmica Principal: Squads

O coração da retenção do aplicativo é o formato de grupos.

\* Usuários podem criar \*squads\* e gerar links/códigos de convite.

\* A pontuação individual alimenta a pontuação coletiva do \*squad\*.

\* \*(A definir na próxima fase: se a competição será "Squad vs Squad" em ligas, ou cooperativa buscando metas semanais).\*



\## 6. Fluxo de Usuário (Happy Path)

1\.  Usuário acessa o app/web e faz login via GitHub OAuth.

2\.  Cria ou entra em um \*Squad\* usando um código de convite.

3\.  É redirecionado para autorizar a instalação do \*GitHub App\* em sua conta.

4\.  Seleciona quais repositórios deseja monitorar.

5\.  Abre sua IDE, codifica e faz um `git push`.

6\.  A API recebe o Webhook, calcula os pontos e o aplicativo atualiza o \*leaderboard\* do \*squad\* em tempo real.



\## 7. Ambiente de Desenvolvimento

\* Para testes locais da integração com Webhooks do GitHub antes do deploy da API, será utilizada a ferramenta \*\*Ngrok\*\* para expor a porta local (ex: `localhost:5000`) para a internet pública, permitindo a entrega dos \*payloads\* em ambiente de desenvolvimento.

