import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mime from 'mime-types';

// Chunked File Upload
const fileUpload = async (req: Request, res: Response) => {
    try {
        const { name, totalchunks, currentchunk, typefolder } = req.headers as {
            name: string,
            totalchunks: string,
            currentchunk: string,
            typefolder: string
        };

        const filename = decodeURIComponent(name);
        const firstChunk = parseInt(currentchunk) === 0;
        const lastChunk = parseInt(currentchunk) === (parseInt(totalchunks) - 1);
        const ext = filename.split('.').pop();

        // Upload directory
        const uploadDir = path.join(__dirname, `../uploads/${typefolder}/`);
        await fs.promises.mkdir(uploadDir, { recursive: true });

        // Generate temporary file name
        const tmpFileNameHash = crypto.createHash('sha256').update(filename).digest('hex');
        const tmpFilename = `tmp_${tmpFileNameHash}.${ext}`;
        const tmpFilepath = path.join(uploadDir, tmpFilename);

        // Handle first chunk: remove any existing temp file
        if (firstChunk && fs.existsSync(tmpFilepath)) fs.unlinkSync(tmpFilepath);

        // Append received chunk to the temporary file
        const writeStream = fs.createWriteStream(tmpFilepath, { flags: 'a' });

        req.on('data', (chunk) => writeStream.write(chunk));
        req.on('end', () => writeStream.end());

        writeStream.on('finish', async () => {
            if (lastChunk) {
                // Rename temp file to final file
                const randomString = crypto.randomBytes(4).toString('hex');
                const finalFileName = `${Date.now()}_${randomString}_${filename}`;
                const finalFilePath = path.join(uploadDir, finalFileName);

                await fs.promises.rename(tmpFilepath, finalFilePath);
                return res.status(200).json({ finalFileName, uploadComplete: true });
            }
            res.status(200).json({ message: `Chunk ${currentchunk} received` });
        });

        writeStream.on('error', (err) => {
            console.error(err);
            res.status(500).json({ message: 'Error writing chunk to file', error: err });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err });
    }
};

// File Streaming for Download or Playback
const sendFileStream = async (req: Request, res: Response) => {
    try {
        const fileName = req.params.fileName;
        if (!fileName) {
            res.status(404).json({ message: 'File not found' });
            return
        }

        const filePath = path.join(__dirname, `../uploads/messages/${fileName}`);
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
            return
        }

        const filePath = path.join(__dirname, '../uploads/messages/', fileName);

        if (!fs.existsSync(filePath)) {
            res.status(404).json({ message: 'File not found' })
            return
        }

        const fileBuffer = await fs.promises.readFile(filePath);
        const mimeType = mime.lookup(fileName) || 'application/octet-stream'

        const fileBase64 = fileBuffer.toString('base64');
        const finalFile = `data:${mimeType};base64,${fileBase64}`

        res.status(200).json({ file: finalFile, fileType: mimeType });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
export default {
    fileUpload,
    sendFileStream,
    sendFile
}
