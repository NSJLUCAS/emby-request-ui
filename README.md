# Emby Request UI

一个用于 Emby 用户提交求片的站点，支持：

- 前台提交求片
- 公开进度页 `/progress`
- 后台管理 `/admin`
- PostgreSQL 数据存储
- Docker Compose 部署

## 默认信息

- 前台首页：`/`
- 进度页：`/progress`
- 后台：`/admin`
- 默认后台账号：`amdin`
- 默认后台密码：`admin`

建议上线后先登录后台修改管理员密码。

## VPS 部署

### 1. 安装环境

服务器需要先安装：

- Git
- Docker
- Docker Compose Plugin

### 2. 拉取项目

```bash
git clone https://github.com/NSJLUCAS/emby-request-ui.git
cd emby-request-ui
```

### 3. 准备 `.env`

在项目根目录创建 `.env`：

```env
POSTGRES_DB=emby_request
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=change-this-to-a-long-random-string
```

### 4. 启动

```bash
docker compose up -d --build
```

### 5. 查看日志

```bash
docker compose logs -f app
```

部署完成后访问：

```text
http://你的服务器IP:5900
```

## 怎么修改 `docker-compose.yml`

当前项目默认文件是 [docker-compose.yml](./docker-compose.yml)。

最常改的是下面这几项：

### 1. 修改访问端口

默认是：

```yml
ports:
  - "5900:3000"
```

如果你想改成 `6000`，就改成：

```yml
ports:
  - "6000:3000"
```

左边是 VPS 对外端口，右边 `3000` 是容器内应用端口，一般不要改右边。

### 2. 修改数据库名、用户名、密码

`docker-compose.yml` 里会读取 `.env`：

```yml
environment:
  POSTGRES_DB: ${POSTGRES_DB:-emby_request}
  POSTGRES_USER: ${POSTGRES_USER:-postgres}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
```

所以通常你不用改 `yml`，直接改 `.env` 就可以：

```env
POSTGRES_DB=emby_request
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-new-password
ADMIN_SESSION_SECRET=your-long-random-secret
```

### 3. 修改容器名

默认是：

```yml
container_name: emby-request-app
container_name: emby-request-db
```

如果你想换名字，可以直接改，但不是必须。

### 4. 修改数据库持久化卷

默认是：

```yml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

一般不用改。这个卷是用来保存 PostgreSQL 数据的，不然重建容器后数据会丢失。

## 修改完之后怎么生效

每次改完 `.env` 或 `docker-compose.yml`，执行：

```bash
docker compose up -d --build
```

如果只是看状态：

```bash
docker compose ps
```

如果要看日志：

```bash
docker compose logs -f app
```

## 更新项目

以后项目更新时，在 VPS 执行：

```bash
git pull origin main
docker compose up -d --build
docker compose logs -f app
```

## 注意

- `.env` 不要提交到 GitHub
- 上线后请修改默认后台密码
- `ADMIN_SESSION_SECRET` 请换成你自己的随机字符串
- 如果你改了端口，记得服务器防火墙也要放行对应端口

