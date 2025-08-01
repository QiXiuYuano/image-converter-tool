const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// 配置 multer 中间件用于处理文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 将文件大小限制增加到50MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许 PNG 和 JPEG 格式
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new Error('只支持 PNG 和 JPEG 格式'));
    }
  }
});

// 提供静态文件服务
app.use(express.static('public'));
app.use('/downloads', express.static('downloads'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 图像转换 API
app.post('/convert', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未提供文件' });
    }

    const { format, quality } = req.body;
    const inputBuffer = req.file.buffer;

    // 检查输出格式是否有效
    if (format !== 'webp' && format !== 'avif') {
      return res.status(400).json({ error: '只支持 webp 和 avif 格式' });
    }

    // 创建转换器
    let converter = sharp(inputBuffer);
    
    // 根据输出格式设置选项
    const options = {};
    if (format === 'webp') {
      if (quality && quality !== 'lossless') {
        // 有损WebP
        options.quality = parseInt(quality);
      } else {
        // 无损WebP
        options.lossless = true;
      }
    } else if (format === 'avif') {
      if (quality && quality !== 'lossless') {
        // 有损AVIF
        options.quality = parseInt(quality);
      } else {
        // 无损AVIF
        options.lossless = true;
      }
    }

    // 应用格式和选项
    if (format === 'webp') {
      converter = converter.webp(options);
    } else if (format === 'avif') {
      converter = converter.avif(options);
    }

    // 执行转换
    const outputBuffer = await converter.toBuffer();
    
    // 生成文件名
    const originalName = path.parse(req.file.originalname).name;
    const outputFileName = `${originalName}.${format}`;
    
    // 确保 downloads 目录存在
    const downloadsDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }
    
    // 将文件保存到 downloads 目录
    const outputPath = path.join(downloadsDir, outputFileName);
    fs.writeFileSync(outputPath, outputBuffer);
    
    // 返回下载链接
    res.json({
      success: true,
      downloadUrl: `/downloads/${outputFileName}`,
      fileName: outputFileName
    });
  } catch (error) {
    console.error('转换错误:', error);
    res.status(500).json({ error: '图像转换失败: ' + error.message });
  }
});

// 批量转换 API
app.post('/convert-batch', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '未提供文件' });
    }

    const { format, quality } = req.body;
    
    // 检查输出格式是否有效
    if (format !== 'webp' && format !== 'avif') {
      return res.status(400).json({ error: '只支持 webp 和 avif 格式' });
    }

    const results = [];
    
    // 确保 downloads 目录存在
    const downloadsDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }
    
    // 处理每个文件
    for (const file of req.files) {
      try {
        const inputBuffer = file.buffer;
        
        // 创建转换器
        let converter = sharp(inputBuffer);
        
        // 根据输出格式设置选项
        const options = {};
        if (quality && quality !== 'lossless') {
          options.quality = parseInt(quality);
        }
        
        // 应用格式和选项
        if (format === 'webp') {
          converter = converter.webp(options);
        } else if (format === 'avif') {
          converter = converter.avif(options);
        }
        
        // 执行转换
        const outputBuffer = await converter.toBuffer();
        
        // 生成文件名
        const originalName = path.parse(file.originalname).name;
        const outputFileName = `${originalName}.${format}`;
        
        // 将文件保存到 downloads 目录
        const outputPath = path.join(downloadsDir, outputFileName);
        fs.writeFileSync(outputPath, outputBuffer);
        
        results.push({
          originalName: file.originalname,
          fileName: outputFileName,
          downloadUrl: `/downloads/${outputFileName}`,
          status: 'success'
        });
      } catch (fileError) {
        results.push({
          originalName: file.originalname,
          error: fileError.message,
          status: 'error'
        });
      }
    }
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('批量转换错误:', error);
    res.status(500).json({ error: '批量图像转换失败: ' + error.message });
  }
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小超出限制' });
    }
  }
  res.status(500).json({ error: '服务器内部错误: ' + err.message });
});

app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
});
