const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// Create temp directories if they don't exist
async function ensureTempDirectories() {
    const dirs = [
        'temp/assessmentSheet',
        'temp/supportPlan',
        'temp/dailyReport',
        'temp/reviewReport'
    ];

    for (const dir of dirs) {
        const dirPath = path.join(__dirname, dir);
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
            console.log(`Created directory: ${dirPath}`);
        }
    }
}

// API endpoint to save assessment sheet
app.post('/api/save-assessment', async (req, res) => {
    try {
        const { fileName, html, data } = req.body;

        if (!fileName || !html) {
            return res.status(400).json({
                success: false,
                error: 'fileName and html are required'
            });
        }

        // Ensure the directory exists
        const dirPath = path.join(__dirname, 'temp/assessmentSheet');
        await fs.mkdir(dirPath, { recursive: true });

        // Save HTML file
        const filePath = path.join(dirPath, fileName);
        await fs.writeFile(filePath, html, 'utf-8');

        // Save metadata as JSON
        const metadataFileName = fileName.replace('.html', '.json');
        const metadataPath = path.join(dirPath, metadataFileName);
        const metadata = {
            fileName,
            data,
            createdAt: new Date().toISOString(),
            filePath: `temp/assessmentSheet/${fileName}`
        };
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

        console.log(`Assessment sheet saved: ${filePath}`);

        res.json({
            success: true,
            filePath: `temp/assessmentSheet/${fileName}`,
            message: 'アセスメントシートが保存されました'
        });
    } catch (error) {
        console.error('Error saving assessment sheet:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint to get saved assessments
app.get('/api/assessments', async (req, res) => {
    try {
        const dirPath = path.join(__dirname, 'temp/assessmentSheet');
        const files = await fs.readdir(dirPath);
        const htmlFiles = files.filter(f => f.endsWith('.html'));

        const assessments = [];
        for (const file of htmlFiles) {
            const jsonFile = file.replace('.html', '.json');
            const jsonPath = path.join(dirPath, jsonFile);
            try {
                const jsonContent = await fs.readFile(jsonPath, 'utf-8');
                assessments.push(JSON.parse(jsonContent));
            } catch (error) {
                console.error(`Error reading metadata for ${file}:`, error);
            }
        }

        res.json({ success: true, assessments });
    } catch (error) {
        console.error('Error getting assessments:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API endpoint to get a specific assessment
app.get('/api/assessment/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = path.join(__dirname, 'temp/assessmentSheet', fileName);
        const html = await fs.readFile(filePath, 'utf-8');
        res.send(html);
    } catch (error) {
        console.error('Error reading assessment:', error);
        res.status(404).json({ success: false, error: 'Assessment not found' });
    }
});

// Initialize and start server
async function startServer() {
    try {
        await ensureTempDirectories();
        app.listen(PORT, () => {
            console.log(`HeartUP Server is running on http://localhost:${PORT}`);
            console.log(`Assessment form: http://localhost:${PORT}/assessment/form.html`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();
