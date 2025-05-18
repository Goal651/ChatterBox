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
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const socket_io_1 = require("socket.io");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes/routes"));
const SocketController_1 = __importDefault(require("./socket/SocketController"));
const express_2 = require("uploadthing/express");
const uploadthing_1 = require("./upload/uploadthing");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["https://chatter-box-three.vercel.app", "http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});
// Middleware setup
app.use((0, cors_1.default)({
    origin: ["https://chatter-box-three.vercel.app", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '5mb' }));
app.use(body_parser_1.default.json({ limit: '5mb' }));
app.use((0, cookie_parser_1.default)());
app.use('/api', routes_1.default);
app.use("/api/uploadthing", (0, express_2.createRouteHandler)({
    router: uploadthing_1.uploadRouter,
}));
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGO_URI)
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    server.listen(3001, () => {
        console.log('Server is running on port 3001');
    });
    (0, SocketController_1.default)(io);
}))
    .catch(err => console.log(err));
