# CAN Festival 2026 交互站

移动端优先的演出时间表网站，支持：

- 按日期切换（4.17 / 4.18 / 4.19）
- 按风格标签多选筛选
- 乐队详情弹层（国家、简介、代表作、专辑）
- 网易云链接跳转

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

当前已配置 `vite.config.ts`：

- `base: '/can2026/'`

对应线上访问路径：

- `https://festival.ironieser.cc/can2026/`

## Cloudflare Pages 部署步骤

1. 把代码推到 GitHub 仓库。
2. 进入 Cloudflare Dashboard -> `Workers & Pages` -> `Create` -> `Pages` -> `Connect to Git`。
3. 选择该仓库，构建配置填写：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 首次部署完成后，进入项目 `Custom domains`，添加：
   - `festival.ironieser.cc`
5. 在 Cloudflare DNS 确认该域名记录已代理（橙云状态）。
6. 由于本项目使用 SPA，`public/_redirects` 已配置：
   - `/can2026/*  /can2026/index.html  200`
   - `/  /can2026/  302`

## 数据维护

乐队数据文件在：

- `src/data/lineup.json`

可继续补全字段：

- `tags`
- `description`
- `topTracks`
- `albums`
- `neteaseUrl`
