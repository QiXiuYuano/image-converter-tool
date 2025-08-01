import fs from 'fs';
import multer from 'multer';
import sharp from 'sharp';

export const config = {
  api: { bodyParser: false },
};

const upload = multer({ dest: '/tmp' });

const handler = async (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err || !req.file) {
      return res.status(400).json({ error: '图片上传失败' });
    }

    const inputPath = req.file.path;
    const format = (req.body.format || 'webp').toLowerCase();
    const quality = parseInt(req.body.quality || '80', 10);
    const outputPath = `${inputPath}.${format}`;

    try {
      let image = sharp(inputPath);
      if (format === 'avif') {
        await image.avif({ quality }).toFile(outputPath);
        res.setHeader('Content-Type', 'image/avif');
      } else {
        await image.webp({ quality }).toFile(outputPath);
        res.setHeader('Content-Type', 'image/webp');
      }

      const buffer = fs.readFileSync(outputPath);
      res.setHeader('Content-Disposition', `attachment; filename=converted.${format}`);
      res.send(buffer);
    } catch (e) {
      res.status(500).json({ error: '转换失败', detail: e.message });
    } finally {
      fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
  });
};

export default handler;
