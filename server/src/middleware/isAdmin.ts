import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import model from "@/model/model"

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
        const user = await model.User.findById(decoded.id)
        if (!user) {
            res.status(401).json({ message: "Access denied" })
            return
        }
        if (user.email !== "test1@gmail.com") {
            res.status(401).json({ message: "Access denied" })
            return
        }

        next()
    } catch (error) {
        res.status(401).json({ message: "Invalid token" })
    }
}
