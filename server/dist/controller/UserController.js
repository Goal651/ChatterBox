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
const validator_1 = __importDefault(require("../validator/validator"));
const model_1 = __importDefault(require("../model/model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const KeysController_1 = __importDefault(require("../security/KeysController"));
const emailService_1 = __importDefault(require("../services/emailService"));
const generateVerificationToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = validator_1.default.registerSchema.validate(req.body);
        if (error) {
            const errorMessages = error.details.map((err) => err.message);
            res.status(200).json({ message: errorMessages[0], isError: true });
            return;
        }
        const { email, password, username } = value;
        const existingUser = yield model_1.default.User.findOne({ email }).select('username');
        if (existingUser) {
            res.status(200).json({ message: "User already exist", isError: true });
            return;
        }
        const { publicKey, privateKey } = yield KeysController_1.default.generateKeyPair();
        const salt = yield bcrypt_1.default.genSalt(10);
        const hash = yield bcrypt_1.default.hash(password, salt);
        const newUser = new model_1.default.User({
            email,
            password: hash,
            username,
            publicKey,
            privateKey,
        });
        const verificationToken = generateVerificationToken(newUser._id.toString());
        const emailObject = {
            title: "Email Verification",
            email: email,
            username: username,
            verificationToken
        };
        emailService_1.default.sendEmail(emailObject);
        yield newUser.save();
        res.status(200).json({ message: 'Verification email sent to your email', isError: false });
    }
    catch (err) {
        res.status(500).json({ message: 'Try again later' });
        console.error(err);
    }
});
// User Login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = validator_1.default.loginSchema.validate(req.body);
        if (error) {
            res.status(200).json({ message: error.details[0].message, isError: true });
            return;
        }
        const { email, password } = value;
        const user = yield model_1.default.User.findOne({ email: email }).select('email names password isVerified');
        if (!user) {
            res.status(200).json({ message: 'Invalid email or password', isError: true });
            return;
        }
        const validated = bcrypt_1.default.compareSync(password, user.password);
        if (!validated) {
            res.status(200).json({ message: 'Incorrect Password', isError: true });
            return;
        }
        if (!user.isVerified) {
            res.status(200).json({ message: 'Account not activated! Check your email to activate it.', isError: true });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        if (!accessToken) {
            res.status(200).json({ message: 'Internal server error', isError: true });
            return;
        }
        res.status(200).json({ token: accessToken, isError: false });
    }
    catch (err) {
        res.status(500).json({ message: 'Internal server error' });
        console.error(err);
    }
});
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = res.locals.user;
        const page = req.headers['page'] || 0;
        const numberOfUsersToSkip = 10 * page;
        const users = yield model_1.default.User.find({ _id: { $ne: userId } })
            .select('email username names image  lastActiveTime  unreads')
            .skip(numberOfUsersToSkip);
        const usersWithMessages = yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            const latestMessage = yield model_1.default.Message.findOne({
                $or: [
                    { sender: userId, receiver: user._id },
                    { sender: user._id, receiver: userId }
                ]
            })
                .sort({ createdAt: -1 })
                .exec();
            return Object.assign(Object.assign({}, user.toObject()), { latestMessage: latestMessage || null });
        })));
        res.status(200).json({ users: usersWithMessages, isError: false });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error ' });
    }
});
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = res.locals.user;
        const user = yield model_1.default.User.findById(userId).populate('unreads');
        if (!user) {
            res.status(200).json({ message: 'user not found', isError: true });
            return;
        }
        const latestMessage = yield model_1.default.Message.findOne({
            $or: [
                { sender: userId, receiver: user._id },
                { sender: user._id, receiver: userId }
            ]
        }).sort({ createdAt: -1 }).exec();
        const userObject = {
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            image: user.image,
            unreads: user.unreads,
            lastActiveTime: user.lastActiveTime,
            latestMessage: latestMessage
        };
        res.status(200).json({ user: userObject, isError: false });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error ' + err });
    }
});
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield model_1.default.User.findById(userId).select('_id username names email image lastActiveTime groups ');
        if (!user) {
            res.status(200).json({ message: 'user not found', isError: true });
            return;
        }
        const userObject = {
            _id: user._id,
            username: user.username,
            email: user.email,
            image: user.image,
            groups: user.groups,
            lastActiveTime: user.lastActiveTime
        };
        res.status(200).json({ user: userObject, isError: false });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' + err });
    }
});
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = res.locals.user;
        const { error, value } = validator_1.default.updateUserSchema.validate(req.body);
        if (error) {
            res.status(200).json({ error: error.details[0], isError: true });
            return;
        }
        yield model_1.default.User.findByIdAndUpdate(userId, { username: value.username, names: value.names, email: value.email });
        res.status(200).json({ message: 'user updated', isError: false });
    }
    catch (err) {
        res.status(500).json({ message: 'server error ', err });
    }
});
const editUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.user.userId;
        const { oldPassword, newPassword } = req.body;
        const user = yield model_1.default.User.findById(userId).select('password');
        if (!user) {
            res.status(200).json({ message: 'user not found', isError: true });
            return;
        }
        const validated = bcrypt_1.default.compareSync(oldPassword, user.password);
        if (!validated) {
            res.status(200).json({ message: 'Invalid password', isError: true });
            return;
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        const hash = yield bcrypt_1.default.hash(newPassword, salt);
        yield model_1.default.User.findByIdAndUpdate(userId, { password: hash });
        res.status(200).json({ message: 'user updated', isError: false });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: 'server error ' });
        }
    }
});
const editUserProfilePicture = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.user.userId;
        const { finalFileName } = req.body;
        yield model_1.default.User.findByIdAndUpdate(userId, { image: finalFileName });
        res.status(200).json({ message: 'profile picture updated successfull', isError: false });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = {
    signup,
    login,
    getUsers,
    getUserProfile,
    getUser,
    updateUser,
    editUserPassword,
    editUserProfilePicture
};
