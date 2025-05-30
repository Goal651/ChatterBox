require('dotenv').config();
import express from 'express'
import http from 'http'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'
import routes from './routes/routes'
import SocketController from './socket/SocketController'
import { createRouteHandler } from 'uploadthing/express';
import { uploadRouter } from './upload/uploadthing';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://chatter-box-three.vercel.app", "http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});


// Middleware setup

app.use(cors({
    origin: ["https://chatter-box-three.vercel.app", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],

}));

app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(cookieParser());
app.use('/api', routes)
app.use("/api/uploadthing", createRouteHandler({
    router: uploadRouter,
}));

// Connect to MongoDB
mongoose.connect( process.env.MONGO_URI as string)
    .then(async () => {
        server.listen(3001, () => {
            console.log('Server is running on port 3001');
        });
        SocketController(io)
    })
    .catch(err => console.log(err));
