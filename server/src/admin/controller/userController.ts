import { Request, Response } from "express";
import model from "../../model/model";
import os from "os";
import moment from "moment";

const getAdminStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await model.User.countDocuments();
        const totalMessages = await model.Message.countDocuments();
        const activeUsers = await model.User.countDocuments({ lastActive: { $gte: moment().subtract(5, "minutes").toDate() } });
        const usersInfo = await model.User.find({}, "username lastActiveTime").sort({ lastActive: -1 });

        const uptime = moment.duration(os.uptime(), "seconds").humanize();

        res.json({
            users: totalUsers,
            messages: totalMessages,
            uptime,
            activeUsers,
            usersInfo
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default { getAdminStats };
