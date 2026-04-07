# Emby Request UI

一个 Emby 求片网站，支持 Docker Compose 一键部署。

## 一键安装（推荐）

在 Ubuntu / Debian VPS 上执行：

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/NSJLUCAS/emby-request-ui/main/scripts/install.sh)"
```

安装完成后访问：

```text
http://你的服务器IP:5900
```

## 自定义安装（可选）

```bash
APP_PORT=6000 TELEGRAM_BOT_TOKEN=xxx TELEGRAM_CHAT_ID=xxx bash -c "$(curl -fsSL https://raw.githubusercontent.com/NSJLUCAS/emby-request-ui/main/scripts/install.sh)"
```

常用环境变量：

- `APP_PORT`：访问端口，默认 `5900`
- `POSTGRES_DB`：数据库名，默认 `emby_request`
- `POSTGRES_USER`：数据库用户，默认 `postgres`
- `POSTGRES_PASSWORD`：数据库密码（不填会自动生成）
- `ADMIN_SESSION_SECRET`：后台会话密钥（不填会自动生成）
- `TELEGRAM_BOT_TOKEN`：Telegram Bot Token（可空）
- `TELEGRAM_CHAT_ID`：Telegram Chat ID（可空）
- `TELEGRAM_CONFIG_SECRET`：Telegram 配置加密密钥（不填会自动生成）

## 一键更新

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/NSJLUCAS/emby-request-ui/main/scripts/update.sh)"
```

## 管理后台

- 登录页：`/admin/login`
- 默认账号：`amdin`
- 默认密码：`admin`

建议首次登录后立即修改密码。

## 常用命令（已部署后）

```bash
cd ~/emby-request-ui
docker compose ps
docker compose logs -f app
docker compose up -d --build
```
