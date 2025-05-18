import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import model from '@/model/model';

const refreshToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
};

const checkToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers['accesstoken'] as string | undefined;
        if (!accessToken) {
            res.status(401).json({ message: 'Redirecting to login...' });
            return
        }

        const decodedToken = jwt.decode(accessToken) as { id: string } | null;
        if (!decodedToken || !decodedToken.id) {
            res.status(401).json({ message: 'Redirecting to login...' });
            return
        }

        jwt.verify(accessToken, process.env.JWT_SECRET as string, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    const newToken = refreshToken(decodedToken.id);
                    res.status(401).json({ message: 'Redirecting to login...' });
                    return
                }
                res.status(401).json({ message: 'Redirecting to login...' });
                return
            }
            res.locals.user = { userId: decodedToken?.id };
            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Redirecting to login...' });
        return
    }
};

const checkUser = async (req: Request, res: Response) => {
    try {
        const { userId } = res.locals.user
        const user = await model.User.findById(userId).select('_id')
        if (!user) {
            res.status(200).json({ message: 'Redirecting to login...' })
            return
        }
        res.status(200).json({ message: 'Welcome back ' + user.username })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Redirecting to login...' })
    }
}

// Verifying email after signup
const verifyUser = async (req: Request, res: Response) => {
    try {
        const { token } = req.params as { token: string };
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        await model.User.updateOne({ _id: decoded.userId }, { isVerified: true });
        res.json({ message: "Email verified successfully!" });
    } catch (error) {
        res.status(401).json({ message: 'Check your email and try again' });
    }
}


export default {
    checkToken,
    checkUser,
    refreshToken,
    verifyUser
}
