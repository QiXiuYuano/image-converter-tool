class ImageConverter {
    constructor() {
        this.selectedFiles = [];
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.convertBtn = document.getElementById('convertBtn');
        this.results = document.getElementById('results');
        this.outputFormat = document.getElementById('outputFormat');
        this.quality = document.getElementById('quality');
    }

    bindEvents() {
        // 文件选择事件
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // 拖拽上传事件
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });

        // 粘贴上传事件
        document.addEventListener('paste', (e) => {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            const files = [];
            for (let item of items) {
                if (item.kind === 'file') {
                    files.push(item.getAsFile());
                }
            }
            if (files.length > 0) {
                this.handleFileSelect(files);
            }
        });

        // 转换按钮事件
        this.convertBtn.addEventListener('click', () => {
            if (this.selectedFiles.length > 1) {
                this.convertBatch();
            } else if (this.selectedFiles.length === 1) {
                this.convertSingle();
            }
        });
    }

    handleFileSelect(files) {
        // 过滤出图片文件
        const imageFiles = Array.from(files).filter(file => 
            file.type === 'image/png' || file.type === 'image/jpeg'
        );

        if (imageFiles.length === 0) {
            this.showMessage('请选择 PNG 或 JPG 格式的图片文件', 'error');
            return;
        }

        this.selectedFiles = imageFiles;
        this.updateUploadArea();
        this.convertBtn.disabled = false;
    }

    updateUploadArea() {
        const content = this.uploadArea.querySelector('.upload-content');
        if (this.selectedFiles.length > 0) {
            content.innerHTML = `
                <p>已选择 ${this.selectedFiles.length} 个文件:</p>
                <ul style="text-align: left; max-height: 200px; overflow-y: auto;">
                    ${this.selectedFiles.map(file => `<li>${file.name}</li>`).join('')}
                </ul>
            `;
        }
    }

    async convertSingle() {
        const file = this.selectedFiles[0];
        const formData = new FormData();
        formData.append('image', file);
        formData.append('format', this.outputFormat.value);
        formData.append('quality', this.quality.value);

        this.showLoading();

        try {
            const response = await fetch('/convert', {
                method: 'POST',
                body: formData
            });

            // 检查响应是否为JSON格式
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`服务器返回非JSON响应: ${text.substring(0, 100)}...`);
            }

            const result = await response.json();

            if (result.success) {
                this.showResults([{
                    originalName: file.name,
                    fileName: result.fileName,
                    downloadUrl: result.downloadUrl,
                    status: 'success'
                }]);
            } else {
                this.showMessage(result.error || '转换失败', 'error');
            }
        } catch (error) {
            console.error('转换错误详情:', error);
            this.showMessage('转换过程中出现错误: ' + error.message, 'error');
        }
    }

    async convertBatch() {
        const formData = new FormData();
        
        // 添加所有文件
        this.selectedFiles.forEach((file, index) => {
            formData.append('images', file);
        });
        
        formData.append('format', this.outputFormat.value);
        formData.append('quality', this.quality.value);

        this.showLoading();

        try {
            const response = await fetch('/convert-batch', {
                method: 'POST',
                body: formData
            });

            // 检查响应是否为JSON格式
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`服务器返回非JSON响应: ${text.substring(0, 100)}...`);
            }

            const result = await response.json();

            if (result.success) {
                this.showResults(result.results);
            } else {
                this.showMessage(result.error || '批量转换失败', 'error');
            }
        } catch (error) {
            console.error('批量转换错误详情:', error);
            this.showMessage('批量转换过程中出现错误: ' + error.message, 'error');
        }
    }

    showLoading() {
        this.results.innerHTML = '<div class="loading">正在转换中...</div>';
    }

    showResults(results) {
        let html = '<h2>转换结果</h2>';
        
        results.forEach(result => {
            if (result.status === 'success') {
                html += `
                    <div class="result-item">
                        <div class="result-info">
                            <h3>${result.originalName}</h3>
                            <p>已转换为: ${result.fileName}</p>
                        </div>
                        <div class="result-actions">
                            <a href="${result.downloadUrl}" download>下载</a>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="result-item">
                        <div class="result-info">
                            <h3>${result.originalName}</h3>
                            <p style="color: #e74c3c;">转换失败: ${result.error}</p>
                        </div>
                    </div>
                `;
            }
        });

        this.results.innerHTML = html;
    }

    showMessage(message, type) {
        this.results.innerHTML = `<div class="${type}">${message}</div>`;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ImageConverter();
});
