# Emby Request UI

一个给 Emby 用户使用的求片网站，基于 `Next.js App Router`、`Tailwind CSS`、`Prisma` 和 `PostgreSQL` 构建。

当前功能包括：

- 首页提交求片
- 公开进度页 `/progress`
- 管理后台 `/admin`
- Prisma + PostgreSQL 数据持久化
- Docker / Docker Compose 部署

## 技术栈

- Next.js 15
- React 18
- Tailwind CSS
- Prisma
- PostgreSQL
- Docker Compose

## 默认信息

- 前台首页：`/`
- 公开进度页：`/progress`
- 管理后台：`/admin`
- 默认后台账号：`amdin`
- 默认后台密码：`admin`

说明：登录后台后可以在后台修改管理员密码。

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

项目根目录创建 `.env`，可参考：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/emby_request?schema=public"
ADMIN_SESSION_SECRET="replace-with-a-long-random-string"
```

如果你已经有 `.env.example`，也可以直接复制：

```bash
cp .env.example .env
```

Windows PowerShell 可以这样复制：

```powershell
Copy-Item .env.example .env
```

### 3. 启动 PostgreSQL

确保本地 PostgreSQL 已启动，并且已创建数据库：

- 数据库名：`emby_request`
- 用户名、密码请和 `DATABASE_URL` 保持一致

### 4. 执行 Prisma 迁移

```bash
npx prisma migrate dev --name init
```

### 5. 启动开发环境

```bash
npm run dev
```

默认访问：

- `http://localhost:3000`

## Docker 部署

项目已经内置：

- [Dockerfile](./Dockerfile)
- [docker-compose.yml](./docker-compose.yml)
- [.dockerignore](./.dockerignore)

默认部署方式：

- 应用容器：Next.js
- 数据库容器：PostgreSQL 16
- 对外端口：`5900`
- 容器启动时自动执行：`prisma migrate deploy`

### 1. 准备 `.env`

推荐在服务器项目目录下准备 `.env`：

```env
POSTGRES_DB=emby_request
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=change-this-to-a-long-random-string
```

说明：

- `docker-compose.yml` 会自动把这些变量组装成容器内使用的 `DATABASE_URL`
- 对外访问端口默认固定为 `5900`

### 2. 启动容器

```bash
docker compose up -d --build
```

### 3. 查看运行日志

```bash
docker compose logs -f app
```

如果看到应用正常启动，就可以通过以下地址访问：

- `http://服务器IP:5900`

## Linux VPS 部署步骤

### 1. 安装基础环境

服务器需要先安装：

- Git
- Docker
- Docker Compose Plugin

### 2. 拉取项目

```bash
git clone https://github.com/NSJLUCAS/emby-request-ui.git
cd emby-request-ui
```

### 3. 配置环境变量

创建 `.env`：

```env
POSTGRES_DB=emby_request
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=change-this-to-a-long-random-string
```

### 4. 启动项目

```bash
docker compose up -d --build
```

### 5. 检查服务状态

```bash
docker compose ps
docker compose logs -f app
```

## 以后如何更新项目

### 本地开发并推送

```bash
git pull origin main
npm run dev
npm run build
git add .
git commit -m "your update message"
git push origin main
```

### VPS 拉取并更新

```bash
cd /path/to/emby-request-ui
git pull origin main
docker compose up -d --build
docker compose logs -f app
```

## 数据库变更流程

如果你修改了 [schema.prisma](./prisma/schema.prisma)，请按下面流程操作：

```bash
npx prisma migrate dev --name your_migration_name
npm run build
git add .
git commit -m "Add prisma migration"
git push origin main
```

服务器更新时，容器会自动执行：

```bash
npx prisma migrate deploy
```

## 常用命令

启动开发环境：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

启动生产环境：

```bash
npm run start
```

生成 Prisma Client：

```bash
npm run prisma:generate
```

创建 Prisma 迁移：

```bash
npm run prisma:migrate
```

## 注意事项

- `.env` 不要提交到 GitHub
- 生产环境请修改默认管理员密码
- 生产环境请替换默认数据库密码
- 生产环境请使用足够长的 `ADMIN_SESSION_SECRET`
- 每次上线前建议先本地执行一次 `npm run build`
