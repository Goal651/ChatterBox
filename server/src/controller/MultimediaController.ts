import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mime from 'mime-types';

// Chunked File Upload
const fileUpload = async (req: Request, res: Response) => {
    const { name, typefolder } = req.headers;
    if (!name || !typefolder) {
        res.status(400).json({ message: 'Missing headers' });
        return
    }
    const filename = decodeURIComponent(name.toString());
    const uploadDir = path.join(__dirname, `../uploads/${typefolder}/`);
    await fs.promises.mkdir(uploadDir, { recursive: true });
    const finalFileName = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}_${filename}`;
    const finalPath = path.join(uploadDir, finalFileName);
    const writeStream = fs.createWriteStream(finalPath);
    req.pipe(writeStream);
    writeStream.on('finish', () => res.status(200).json({ finalFileName, uploadComplete: true }));
    writeStream.on('error', (err) => {
        console.error(err);
        res.status(500).json({ message: 'Upload failed', error: err });
    });
};

// File Streaming for Download or Playback
const sendFileStream = async (req: Request, res: Response) => {
    try {
        const fileName = req.params.fileName;
        if (!fileName) {
            res.status(404).json({ message: 'File not found' });
            return;
        }

        const filePath = path.join(__dirname, `../uploads/messages/${fileName}`);
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ message: 'File not found' });
            return;
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': end - start + 1,
                'Content-Type': 'application/octet-stream',
            });
            fs.createReadStream(filePath, { start, end }).pipe(res);
        } else {
            res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': 'application/octet-stream' });
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error streaming file', error: err });
    }
};

const sendFile = async (req: Request, res: Response) => {
    try {
        const { fileName } = req.params as { fileName: string };

        if (!fileName) {
            res.status(400).json({ message: 'Filename is required' });
            return;
        }

        const filePath = path.join(__dirname, '../uploads/messages/', fileName);

        if (!fs.existsSync(filePath)) {
            res.status(400).json({ message: 'File not found' });
            return;
        }

        const fileBuffer = await fs.promises.readFile(filePath);
        const mimeType = mime.lookup(fileName) || 'application/octet-stream';

        const fileBase64 = fileBuffer.toString('base64');
        const finalFile = `data:${mimeType};base64,${fileBase64}`;

        res.status(200).json({ file: finalFile, fileType: mimeType });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' })
    }
};

export default {
    fileUpload,
    sendFileStream,
    sendFile
};
