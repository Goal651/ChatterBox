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
            res.redirect('https://chatter-box-three.vercel.app/login/error');
            return
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
        if (!decoded) {
            res.redirect('https://chatter-box-three.vercel.app/login/error');
            return
        }
        // Check if the token is expired
        const diff = decoded.exp - decoded.iat
        if (diff >= oneDay) {
            res.redirect('https://chatter-box-three.vercel.app/login/expired');
        }
        // Check if the user is already verified
        const user = await model.User.findById(decoded.userId);
        if (!user) {
            res.redirect('https://chatter-box-three.vercel.app/login/notfound');
            return    
        }

        if (user.isVerified) {
            res.redirect('https://chatter-box-three.vercel.app/login/already');
            return
        }

        await model.User.findByIdAndUpdate(user._id, { isVerified: true });
        res.redirect('https://chatter-box-three.vercel.app/login/success');
    } catch (error) {
        console.error(error)
    }
}
