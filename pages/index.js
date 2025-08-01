import { useState } from 'react';

export default function Home() {
  const [quality, setQuality] = useState(80);
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState('webp');

  const handleDrop = (e) => {
    e.preventDefault();
    setFiles([...files, ...Array.from(e.dataTransfer.files)]);
  };

  const handleUpload = async () => {
    for (let file of files) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('quality', quality);
      formData.append('format', format);

      const res = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.split('.')[0]}.${format}`;
      link.click();
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: 'Arial' }}>
      <h2>批量 PNG/JPG 转换为 WebP / AVIF</h2>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: '2px dashed #888',
          padding: 40,
          marginBottom: 20,
          textAlign: 'center',
          borderRadius: 10,
          backgroundColor: '#f9f9f9',
        }}
      >
        拖拽图片到此区域（支持 PNG 和 JPG）
      </div>

      <div style={{ marginBottom: 10 }}>
        输出格式：
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="webp">WebP</option>
          <option value="avif">AVIF</option>
        </select>
      </div>

      <input
        type="range"
        min={10}
        max={100}
        value={quality}
        onChange={(e) => setQuality(e.target.value)}
      />
      <div>压缩质量: {quality}</div>

      <ul>
        {files.map((f, i) => (
          <li key={i}>{f.name}</li>
        ))}
      </ul>

      <button onClick={handleUpload} disabled={files.length === 0}>
        转换并下载
      </button>
    </div>
  );
}
