import jwt from 'jsonwebtoken';
import model from "@/model/model";
import { Request, Response } from "express";

interface DecodedToken {
    userId: string;
    iat: number;
    exp: number;
}

export default async function EmailVerifierController(req: Request, res: Response) {

    try {
        const oneDay = 24 * 60 * 60 * 1000;
        const token = req.params.token
        if (!token) {
            res.redirect('http://localhost:5173/login/error');
            return
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
        if (!decoded) {
            res.redirect('http://localhost:5173/login/error');
            return
        }
        // Check if the token is expired
        const diff = decoded.exp - decoded.iat
        if (diff >= oneDay) {
            res.redirect('http://localhost:5173/login/expired');
        }
        // Check if the user is already verified
        const user = await model.User.findById(decoded.userId);
        if (!user) {
            res.redirect('http://localhost:5173/login/notfound');
            return    
        }

        if (user.isVerified) {
            res.redirect('http://localhost:5173/login/already');
            return
        }

        await model.User.findByIdAndUpdate(user._id, { isVerified: true });
        res.redirect('http://localhost:5173/login/success');
    } catch (error) {
        console.error(error)
    }
}