# 社团站点部署说明（阿里云 / 最低预算）

本项目为 **SvelteKit + Node（adapter-node）**，数据保存在服务器本地 JSON（`data/site.json`）与上传目录（`uploads/`）。适合一台低配 **ECS** 跑 Node，成本低、功能完整（公示、作品上传、招新编辑）。

---

## 一、为什么不能「只开 OSS 静态网站」就搞定全部功能？

- **OSS 静态托管**只能放 HTML/CSS/JS 等静态文件，**没有服务器程序**，无法安全地做「上传文件、写数据库、改招新文案」等需要后端的逻辑。
- **最低成本且功能完整**的常见做法：买一台 **轻量应用服务器** 或 **ECS**（学生机 / 突发性能实例），在上面跑本项目的 Node 服务。
- 若坚持 **只用 OSS**：只能放**纯展示页**（招新文案、公告都写死在 HTML 里），作品展示改为外链（B 站、网盘等），**无法在本站直接上传**。要上传则需再加 **函数计算 FC + OSS API** 等，复杂度更高。

下面以「一台 ECS + Node」为主流程；文末补充「仅 OSS 静态」的折中做法。

---

## 二、服务器端部署（推荐：阿里云 ECS / 轻量）

### 1. 准备机器

1. 购买 **Linux** 系统（建议 **Ubuntu 22.04** 或 **Alibaba Cloud Linux 3**）。
2. 安全组放行 **80**（HTTP）、**443**（HTTPS，可选）、**22**（SSH）。
3. 域名（可选）解析到服务器公网 IP；**中国大陆服务器需备案**后才能用 80/443 域名访问（按阿里云控制台指引操作）。

### 2. 安装 Node.js（LTS）

以 Node 20 LTS 为例（版本需 ≥18）：

```bash
# Ubuntu 示例：使用 NodeSource 或 nvm，任选其一
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

### 3. 上传代码并安装依赖

在本地已 `npm run build` 通过后，将项目目录上传到服务器（Git 克隆、scp、SFTP 均可）。

```bash
cd /opt/club-site   # 你的项目路径
npm ci --omit=dev   # 或 npm install --omit=dev
npm run build
```

### 4. 环境变量

```bash
cp .env.example .env
nano .env
```

- **SESSION_SECRET**：用于签发管理员登录 Cookie 的签名密钥，**务必**设为足够长的随机字符串。
- **ADMIN_USERNAME**：管理员账号，默认 `admin`。
- **ADMIN_PASSWORD_HASH**（推荐）：bcrypt 哈希。在项目根执行 `npm run hash-password -- 你的密码`，将输出写入 `.env`。
- **ADMIN_PASSWORD**（仅建议本地调试）：明文密码；生产环境请改用哈希。
- **生产环境**（`NODE_ENV=production`）下**必须**配置 `ADMIN_PASSWORD` 或 `ADMIN_PASSWORD_HASH` 之一，否则无法登录（后台会提示未配置密码）。
- **用 `http://` 访问**（如仅公网 IP、未上 HTTPS）时，Cookie 会自动按协议设置；若仍无法登录，可在 `.env` 中设置 `COOKIE_SECURE=0` 后重启进程。
- **DATA_DIR**、**UPLOAD_DIR**：可选；默认分别为 `data`、`uploads`（**相对于项目根目录**，见下）。请保证进程对该目录有读写权限。
- **PROJECT_ROOT**（可选）：若用 pm2/systemd 启动时**工作目录不是项目根**（例如变成 `/root`），未设置时会把 `data/`、`uploads/` 写到错误位置，表现为**首页轮播空白、访客登录失败、上传图片 404**。解决二选一：① 启动配置里把 `cwd` 设为项目根（推荐）；② 在 `.env` 中设置 `PROJECT_ROOT=/你的项目路径`。本仓库在运行时若入口为 `…/build/index.js`，也会自动把项目根解析为 `build` 的上一级，一般无需手填。
- **首次部署**：请把本地的 **`data/site.json`**（及 **`uploads/`** 中已有文件）一并拷到服务器对应目录，或在后台重新配置轮播、重新注册访客；否则线上是空数据。

### 5. 启动 Node（生产）

**方式 A：直接启动（调试）**

```bash
NODE_ENV=production node build
```

默认监听 **3000** 端口（SvelteKit adapter-node 默认）。

若前面有 **Nginx 反向代理**，建议在运行 Node 的环境变量中增加（与 SvelteKit adapter-node 文档一致）：

```bash
export PROTOCOL_HEADER=x-forwarded-proto
export HOST_HEADER=x-forwarded-host
```

或在 `pm2 ecosystem` / systemd 的 `Environment=` 中写入，使站内生成的 URL 与 Cookie 与公网访问方式一致。

**方式 B：PM2 守护进程（推荐）**

```bash
sudo npm i -g pm2
cd /opt/club-site
# 务必在项目根执行，或显式指定 cwd，避免 data/uploads 路径错乱
pm2 start build/index.js --name club-site --cwd /opt/club-site
pm2 save
pm2 startup   # 按提示执行一行命令，实现开机自启
```

### 6. Nginx 反向代理（可选但常用）

安装 Nginx 后，新增站点配置，把 80 端口转到 `127.0.0.1:3000`：

```nginx
server {
    listen 80;
    server_name 你的域名或IP;

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        /* 必加：否则 Node 不知道访客用 https，登录 Cookie 可能异常 */
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 7. HTTPS（推荐）

使用 **Let’s Encrypt**（`certbot`）申请证书，或阿里云 **SSL 证书**上传到 SLB/CDN。配置 Nginx `listen 443 ssl` 并指向证书文件即可。

### 8. 备份与升级

- 定期备份 **`data/site.json`** 与 **`uploads/`** 目录。
- 更新代码：`git pull` → `npm ci --omit=dev` → `npm run build` → `pm2 restart club-site`。

---

## 三、预算更省时的组合思路

| 方案 | 说明 |
|------|------|
| **轻量应用服务器 + 本仓库** | 通常比「ECS + 负载均衡」便宜，足够社团使用。 |
| **OSS 仅做 CDN 静态资源** | 主站仍在 ECS；图片/大文件可再接到 OSS（需改代码或手工上传），本框架默认存本地 `uploads/`。 |
| **仅 OSS 静态网站** | 需把站点改成纯静态构建（`adapter-static`），并放弃内置上传/API；或招新/公示改为纯前端写死。 |

---

## 四、本地开发

```bash
npm install
npm run dev
```

浏览器访问终端里提示的地址（一般为 `http://localhost:5173`）。

---

## 五、目录说明

| 路径 | 作用 |
|------|------|
| `data/site.json` | 公告、作品元数据、招新正文（首次访问自动生成） |
| `uploads/` | 上传的文件本体 |
| `build/` | `npm run build` 后的 Node 可执行输出 |

---

## 六、安全建议

1. 生产环境**必须**设置 **SESSION_SECRET** 与 **ADMIN_PASSWORD_HASH**（或仅本地调试时使用 **ADMIN_PASSWORD**），并勿泄露。
2. 定期备份 `data/site.json` 与 `uploads/`；服务器只开放必要端口。
3. 若面向公网，建议上 **HTTPS**。

如有问题，可在项目内继续扩展：登录体系、OSS 直传、数据库迁移到 MySQL 等。
