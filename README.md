# Image Converter Tool

一个将 PNG/JPG 图片转换为 WebP/AVIF 格式的工具，支持质量控制和批量转换。

## 功能特性

- 支持 PNG 和 JPG 格式输入
- 支持转换为 WebP 和 AVIF 格式
- 可调节压缩质量或无损压缩
- 支持单个和批量图片转换
- 响应式前端界面
- 支持拖拽、点击和粘贴上传
- 支持部署到 Vercel 或 VPS

## 本地运行

### 安装依赖

```bash
npm install
```

### 启动服务

```bash
npm start
```

或者在开发模式下运行（支持热重载）：

```bash
npm run dev
```

服务将在 `http://localhost:3000` 上运行。

## 部署到 Vercel

1. 将项目推送到 GitHub/GitLab/Bitbucket
2. 在 [Vercel](https://vercel.com) 上导入项目
3. Vercel 会自动检测配置并部署应用

或者使用 Vercel CLI：

```bash
npm install -g vercel
vercel
```

## 部署到 VPS

1. 将项目上传到 VPS
2. 安装 Node.js 和 npm
3. 安装依赖：
   ```bash
   npm install
   ```
4. 启动服务：
   ```bash
   npm start
   ```
5. （可选）使用 PM2 管理进程：
   ```bash
   npm install -g pm2
   pm2 start server.js
   ```

## 使用方法

1. 打开浏览器访问应用地址
2. 选择输出格式（WebP 或 AVIF）
3. 选择压缩质量（无损或不同压缩率）
4. 通过以下方式上传图片：
   - 点击上传区域选择文件
   - 拖拽文件到上传区域
   - 复制图片并粘贴（Ctrl+V/Cmd+V）
5. 点击"转换图片"按钮
6. 转换完成后下载结果文件

## 技术栈

- 后端：Node.js + Express
- 图像处理：Sharp
- 前端：原生 HTML/CSS/JavaScript
- 文件上传：Multer

## 注意事项

- 输入文件大小限制为 10MB
- 仅支持 PNG 和 JPG 格式输入
- 转换后的文件保存在服务器的 `downloads` 目录中
