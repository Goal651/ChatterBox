"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const mime_types_1 = __importDefault(require("mime-types"));
// Chunked File Upload
const fileUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, totalchunks, currentchunk, typefolder } = req.headers;
        if (!name || !totalchunks || !currentchunk || !typefolder) {
            res.status(400).json({ message: 'Missing required headers' });
            return;
        }
        const filename = decodeURIComponent(name);
        const firstChunk = parseInt(currentchunk) === 0;
        const lastChunk = parseInt(currentchunk) === (parseInt(totalchunks) - 1);
        const ext = filename.split('.').pop();
        // Upload directory
        const uploadDir = path_1.default.join(__dirname, `../uploads/${typefolder}/`);
        yield fs_1.default.promises.mkdir(uploadDir, { recursive: true });
        // Generate temporary file name
        const tmpFileNameHash = crypto_1.default.createHash('sha256').update(filename).digest('hex');
        const tmpFilename = `tmp_${tmpFileNameHash}.${ext}`;
        const tmpFilepath = path_1.default.join(uploadDir, tmpFilename);
        // Handle first chunk: remove any existing temp file
        if (firstChunk && fs_1.default.existsSync(tmpFilepath))
            fs_1.default.unlinkSync(tmpFilepath);
        // Append received chunk to the temporary file
        const writeStream = fs_1.default.createWriteStream(tmpFilepath, { flags: 'a' });
        req.on('data', (chunk) => writeStream.write(chunk));
        req.on('end', () => writeStream.end());
        writeStream.on('finish', () => __awaiter(void 0, void 0, void 0, function* () {
            if (lastChunk) {
                // Rename temp file to final file
                const randomString = crypto_1.default.randomBytes(4).toString('hex');
                const finalFileName = `${Date.now()}_${randomString}_${filename}`;
                const finalFilePath = path_1.default.join(uploadDir, finalFileName);
                yield fs_1.default.promises.rename(tmpFilepath, finalFilePath);
                return res.status(200).json({ finalFileName, uploadComplete: true });
            }
            res.status(200).json({ message: `Chunk ${currentchunk} received` });
        }));
        writeStream.on('error', (err) => {
            console.error(err);
            res.status(500).json({ message: 'Error writing chunk to file', error: err });
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err });
    }
});
// File Streaming for Download or Playback
const sendFileStream = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileName = req.params.fileName;
        if (!fileName) {
            res.status(404).json({ message: 'File not found' });
            return;
        }
        const filePath = path_1.default.join(__dirname, `../uploads/messages/${fileName}`);
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({ message: 'File not found' });
            return;
        }
        const stat = fs_1.default.statSync(filePath);
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
            fs_1.default.createReadStream(filePath, { start, end }).pipe(res);
        }
        else {
            res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': 'application/octet-stream' });
            fs_1.default.createReadStream(filePath).pipe(res);
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error streaming file', error: err });
    }
});
const sendFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileName } = req.params;
        if (!fileName) {
            res.status(400).json({ message: 'Filename is required' });
            return;
        }
        const filePath = path_1.default.join(__dirname, '../uploads/messages/', fileName);
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({ message: 'File not found' });
            return;
        }
        const fileBuffer = yield fs_1.default.promises.readFile(filePath);
        const mimeType = mime_types_1.default.lookup(fileName) || 'application/octet-stream';
        const fileBase64 = fileBuffer.toString('base64');
        const finalFile = `data:${mimeType};base64,${fileBase64}`;
        res.status(200).json({ file: finalFile, fileType: mimeType });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.default = {
    fileUpload,
    sendFileStream,
    sendFile
};
