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
const model_1 = __importDefault(require("../model/model"));
const refreshToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};
const checkToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.headers['accesstoken'];
        if (!accessToken) {
            res.status(401).json({ message: 'Redirecting to login...' });
            return;
        }
        const decodedToken = jsonwebtoken_1.default.decode(accessToken);
        if (!decodedToken || !decodedToken.id) {
            res.status(401).json({ message: 'Redirecting to login...' });
            return;
        }
        jsonwebtoken_1.default.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    const newToken = refreshToken(decodedToken.id);
                    res.status(401).json({ message: 'Redirecting to login...' });
                    return;
                }
                res.status(401).json({ message: 'Redirecting to login...' });
                return;
            }
            res.locals.user = { userId: decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id };
            next();
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Redirecting to login...' });
        return;
    }
});
const checkUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = res.locals.user;
        const user = yield model_1.default.User.findById(userId).select('_id');
        if (!user) {
            res.status(200).json({ message: 'Redirecting to login...' });
            return;
        }
        res.status(200).json({ message: 'Welcome back ' + user.username });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Redirecting to login...' });
    }
});
// Verifying email after signup
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        yield model_1.default.User.updateOne({ _id: decoded.userId }, { isVerified: true });
        res.json({ message: "Email verified successfully!" });
    }
    catch (error) {
        res.status(401).json({ message: 'Check your email and try again' });
    }
});
exports.default = {
    checkToken,
    checkUser,
    refreshToken,
    verifyUser
};
