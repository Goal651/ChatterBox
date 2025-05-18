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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AuthController_1 = __importDefault(require("./AuthController"));
const SECRET_KEY = process.env.JWT_SECRET;
const SocketAuthController = (io) => {
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const token = (_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token;
        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
            if (!decoded || !decoded.id) {
                return next(new Error('Authentication error: Missing user ID in token'));
            }
            // Handle token refresh if necessary
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                try {
                    const refreshedToken = AuthController_1.default.refreshToken(decoded.id);
                    if (!refreshedToken) {
                        return next(new Error('Authentication error: Unable to refresh token'));
                    }
                    socket.handshake.auth.token = refreshedToken;
                }
                catch (refreshError) {
                    return next(new Error('Authentication error: Token refresh failed'));
                }
            }
            socket.data.user = { userId: decoded.id };
            next();
        }
        catch (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new Error('Authentication error: Token expired'));
            }
            return next(new Error('Authentication error: Invalid token'));
        }
    }));
};
exports.default = SocketAuthController;
