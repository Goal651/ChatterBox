import { Socket, Server } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import mainAuth from './AuthController';

const SECRET_KEY = process.env.JWT_SECRET as string;

const SocketAuthController = (io: Server) => {
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }

        try {
            const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;

            if (!decoded || !decoded.id) {
                return next(new Error('Authentication error: Missing user ID in token'));
            }

            // Handle token refresh if necessary
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                try {
                    const refreshedToken = await mainAuth.refreshToken(decoded.id);
                    if (!refreshedToken) {
                        return next(new Error('Authentication error: Unable to refresh token'));
                    }
                    // Optionally, send the new token to the client
                    socket.handshake.auth.token = refreshedToken;
                } catch (refreshError) {
                    return next(new Error('Authentication error: Token refresh failed'));
                }
            }

            socket.data.user = { userId: decoded.id };
            next();
        } catch (err: any) {
            if (err.name === 'TokenExpiredError') {
                return next(new Error('Authentication error: Token expired'));
            }
            return next(new Error('Authentication error: Invalid token'));
        }
    });
};

export default SocketAuthController;
