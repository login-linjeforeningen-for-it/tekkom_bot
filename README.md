<div align="center">

<img src="https://s3.login.no/beehive/img/logo/logo-white-small.svg" alt="Login logo" width="80" height="80" />

<h1>TekKom Bot</h1>

<p>
  <img src="https://img.shields.io/badge/TypeScript-fd8738?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Bun-fd8738?style=flat-square&logo=bun&logoColor=white" alt="Bun" />
  <img src="https://img.shields.io/badge/Discord.js-fd8738?style=flat-square&logo=discord&logoColor=white" alt="Discord.js" />
  <img src="https://img.shields.io/badge/Fastify-fd8738?style=flat-square&logo=fastify&logoColor=white" alt="Fastify" />
  <img src="https://img.shields.io/badge/PostgreSQL-fd8738?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-fd8738?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
</p>

</div>

---

TekKom Bot is the Discord bot for TekKom at Login. It handles service monitoring alerts, Minecraft server integration, ticket management, and member administration.

Full documentation is available at [outline.login.no/s/tekkombot](https://outline.login.no/s/tekkombot).

## Features

- **Service monitoring alerts** posted to Discord on critical events
- **Minecraft server integration** for survival and creative servers
- **Ticket management** for member requests
- **User and role management** for the Login Discord server

## Getting Started

1. **Configure environment**

   Create a `.env` file in the repo root. See [Configuration](#configuration) below or grab the values from 1Password.

2. **Start**

   ```bash
   docker compose up --build
   ```

3. **Verify** the bot is online by running `/ping` in Discord. Make sure to select TekKom Bot, not Carl-bot.

## Configuration

All variables go in the root `.env` file.

| Name                                   | Notes                                              |
|----------------------------------------|----------------------------------------------------|
| `DISCORD_TOKEN`                        | Discord bot token                                  |
| `DISCORD_CLIENT_ID`                    | Discord application client ID                      |
| `DISCORD_GUILD_ID`                     | Discord server ID                                  |
| `DISCORD_TEKKOM_ROLE_ID`               | Role ID for TekKom members                         |
| `DISCORD_STYRET_ROLE_ID`               | Role ID for board members                          |
| `DISCORD_MINECRAFT_LOG_CHANNEL_ID`     | Channel ID for Minecraft log messages              |
| `DISCORD_SERVICE_MONITORING_CHANNEL_ID`| Channel ID for service monitoring alerts           |
| `DISCORD_TEKKOM_VERV_CHANNEL_ID`       | Channel ID for TekKom role notifications           |
| `MINECRAFT_URL`                        | Minecraft server base URL                          |
| `MINECRAFT_SURVIVAL`                   | Survival server hostname                           |
| `MINECRAFT_CREATIVE`                   | Creative server hostname                           |
| `MINECRAFT_SURVIVAL_PORT`              | Survival server port                               |
| `MINECRAFT_CREATIVE_PORT`              | Creative server port                               |
| `MINECRAFT_PORT`                       | Default Minecraft port                             |
| `TEKKOM_BOT_API_URL`                   | URL of the bot's own API                           |
| `TEKKOM_BOT_API_TOKEN`                 | Token for the bot's own API                        |
| `TEKKOM_BOT_BTG_TOKEN`                 | BTG integration token                              |
| `GITHUB_TOKEN`                         | GitHub token for repository actions                |
| `PRIVATE_TOKEN`                        | GitLab private token                               |
| `HEARTBEAT_URL`                        | Uptime heartbeat URL                               |
| `RUNNING_ID`                           | Unique ID for this running instance                |
| `DB`                                   | Postgres database name                             |
| `DB_HOST`                              | Postgres host                                      |
| `DB_PORT`                              | Postgres port                                      |
| `DB_USER`                              | Postgres username                                  |
| `DB_PASSWORD`                          | Postgres password                                  |

## Project Structure

- `src/commands/` - Slash command definitions (info, management, minecraft, tickets, users)
- `src/managed/` - Managed background processes
- `src/utils/` - Helper utilities
- `src/config.ts` - Configuration and environment variable loading
- `api/` - Companion Fastify API for receiving external events
- `db/` - Database schema
