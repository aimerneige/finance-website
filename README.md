# 知钱 · 金融入门

React + Vite + mdui 2 的中文静态学习站点。支持亮色 / 暗色主题、九个交互公式、复利、按月储蓄目标、房贷和现值计算器。所有计算在浏览器本地运行，无账号、后端、数据库或外部 API。

## 本地使用

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

构建产物为 `dist/`，直接部署该目录的内容；本项目不创建 GitHub CI，不执行 push 或部署。

## GitHub Pages 与 Cloudflare CDN

- `public/CNAME` 内容为 `finance.aimer.moe`，构建后自动复制到 `dist/CNAME`。请自行在 GitHub Pages 设置自定义域名，并按 GitHub 官方说明配置 DNS 和 HTTPS。
- 相对资源路径与哈希路由（例如 `/#/mortgage`）支持纯静态托管，刷新计算器页面不需要服务器 rewrite。`public/.nojekyll` 禁用 Jekyll。
- 源码链接固定为 `https://github.com/aimerneige/finance-website`，可在 `src/main.jsx` 中修改。
- 仅提供免费金融教育，不处理商业交易、不提供商业 SaaS、不收集金融或身份数据。GitHub 免费版 Pages 通常需使用公开仓库。遵守 [GitHub Pages 使用限制](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)：发布站点上限 1 GB，月带宽软上限 100 GB；运营者仍需监控实际流量。
- 所有必要 CSS、JS、图标均随构建输出，无视频、大文件下载或外部字体。适合作为普通 HTML 网站使用 Cloudflare 免费 CDN，避免视频及不成比例的大文件传输；参见 [Cloudflare CDN 条款](https://www.cloudflare.com/service-specific-terms-application-services/#content-delivery-network-terms) 与 [视频 / 大文件政策](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/delivering-videos-with-cloudflare/)。合规也取决于后续添加的内容和实际使用方式。
- 不需要 Cloudflare Workers、R2 或付费服务。建议让带哈希的静态资源正常缓存，更新发布时留意 HTML 缓存，不必配置“缓存所有内容”。

## 计算约定

利率输入为百分数，计算时转为小数。计算器只接受非负利率、非负金额；年利率上限 100%，年数上限 100 年，房贷年数须为正整数。储蓄按固定名义年利率 / 12 计息，每月末存款，达标月份向上取整，超过 12,000 个月提示调整计划。房贷使用固定利率，提供等额本息与等额本金明细，不包括税费、提前还款和实际银行舍入规则。公式体验中的 72 法则仅为近似值。页面用于学习参考，不构成投资建议。
