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
const axios_1 = __importDefault(require("axios"));
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ username, email, verificationToken, title }) {
    var _b;
    if (!username || !email || !verificationToken) {
        throw new Error("All fields are required.");
    }
    try {
        const response = yield axios_1.default.post("https://api.emailjs.com/api/v1.0/email/send", {
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_TEMPLATE_ID,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            template_params: {
                to_email: email,
                to_name: username,
                verification_link: 'https://chatter-box-three.vercel.app/verify/' + verificationToken,
                message_title: title,
            },
            accessToken: process.env.EMAILJS_PRIVATE_KEY
        });
        if (response.status === 200)
            return "Email sent successfully.";
        else
            throw new Error("Error sending email.");
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error((_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.data);
        }
        throw new Error("An error occurred while sending the email.");
    }
});
exports.default = {
    sendEmail,
};
