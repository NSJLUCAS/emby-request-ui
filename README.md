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

## VPS 部署教程

下面这份教程默认你用的是 `Ubuntu / Debian` 系 VPS。

### 第 1 步：连接 VPS

在你自己的电脑终端里执行：

```bash
ssh root@你的服务器IP
```

如果你不是 `root` 用户，就把 `root` 换成你自己的用户名。

如果你不是 `root` 登录，下面出现的安装类命令前面都加上 `sudo`，例如：

```bash
sudo apt update
sudo apt upgrade -y
```

### 第 2 步：更新系统

```bash
apt update
apt upgrade -y
```

### 第 3 步：安装 Git

```bash
apt install -y git
```

安装完成后检查：

```bash
git --version
```

### 第 4 步：安装 Docker 和 Docker Compose

先安装需要的工具：

```bash
apt install -y ca-certificates curl gnupg
```

再安装 Docker：

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

设置 Docker 开机自动启动：

```bash
systemctl enable docker
systemctl start docker
```

检查是否安装成功：

```bash
docker --version
docker compose version
```

### 第 5 步：拉取项目

```bash
git clone https://github.com/NSJLUCAS/emby-request-ui.git
cd emby-request-ui
```

### 第 6 步：创建 `.env`

直接执行：

```bash
nano .env
```

把下面内容粘贴进去：

```env
POSTGRES_DB=emby_request
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=change-this-to-a-long-random-string
```

说明：

- `POSTGRES_DB`：数据库名
- `POSTGRES_USER`：数据库用户名
- `POSTGRES_PASSWORD`：数据库密码
- `ADMIN_SESSION_SECRET`：后台登录会话密钥，建议改成一串很长的随机字符

`nano` 保存方法：

- 按 `Ctrl + O`
- 按回车
- 按 `Ctrl + X`

注意：用 `docker compose` 部署时，不需要你手动写 `DATABASE_URL`。

### 第 7 步：启动项目

```bash
docker compose up -d --build
```

### 第 8 步：查看是否启动成功

查看容器状态：

```bash
docker compose ps
```

查看项目日志：

```bash
docker compose logs -f app
```

如果看到应用正常启动，就可以打开：

```text
http://你的服务器IP:5900
```

## 怎么修改 `docker-compose.yml`

先打开文件：

```bash
nano docker-compose.yml
```

当前项目默认文件是 [docker-compose.yml](./docker-compose.yml)。

最常改的是这几项。

### 1. 修改访问端口

默认是：

```yml
ports:
  - "5900:3000"
```

含义：

- 左边 `5900`：外部访问端口
- 右边 `3000`：容器内应用端口

如果你想改成 `6000`，就改成：

```yml
ports:
  - "6000:3000"
```

改完以后访问地址也会变成：

```text
http://你的服务器IP:6000
```

### 2. 修改数据库配置

你通常不用改 `docker-compose.yml`，直接改 `.env` 就可以。

比如：

```env
POSTGRES_DB=emby_request
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-new-password
ADMIN_SESSION_SECRET=your-long-random-secret
```

### 3. 修改容器名称

默认是：

```yml
container_name: emby-request-app
container_name: emby-request-db
```

这个只是容器名字，改不改都可以。

### 4. 数据库数据保存位置

默认是：

```yml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

这段不要随便删。它是用来保存数据库数据的，不然重建容器后数据会丢失。

## 修改完后怎么生效

每次改完 `.env` 或 `docker-compose.yml` 后，执行：

```bash
docker compose up -d --build
```

然后再看日志：

```bash
docker compose logs -f app
```

## 服务器放行端口

如果你用了防火墙，还要放行端口。

例如你用的是 `5900`：

```bash
ufw allow 5900/tcp
ufw reload
```

如果你的系统还没开启 `ufw`，这一步可以先跳过。

## 更新项目

以后项目更新时，在 VPS 里执行：

```bash
cd ~/emby-request-ui
git pull origin main
docker compose up -d --build
docker compose logs -f app
```

## 常用命令

查看运行状态：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f app
```

停止项目：

```bash
docker compose down
```

重新启动：

```bash
docker compose up -d
```

重新构建并启动：

```bash
docker compose up -d --build
```

## 注意事项

- `.env` 不要上传到 GitHub
- 上线后请尽快修改后台默认密码
- `ADMIN_SESSION_SECRET` 一定要改成你自己的随机字符串
- 如果你改了端口，也要记得服务器防火墙同步放行
