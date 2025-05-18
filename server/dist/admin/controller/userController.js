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
const model_1 = __importDefault(require("../../model/model"));
const os_1 = __importDefault(require("os"));
const moment_1 = __importDefault(require("moment"));
const getAdminStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalUsers = yield model_1.default.User.countDocuments();
        const totalMessages = yield model_1.default.Message.countDocuments();
        const activeUsers = yield model_1.default.User.countDocuments({ lastActive: { $gte: (0, moment_1.default)().subtract(5, "minutes").toDate() } });
        const usersInfo = yield model_1.default.User.find({}, "username lastActiveTime").sort({ lastActive: -1 });
        const uptime = moment_1.default.duration(os_1.default.uptime(), "seconds").humanize();
        res.json({
            users: totalUsers,
            messages: totalMessages,
            uptime,
            activeUsers,
            usersInfo
        });
    }
    catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = { getAdminStats };
