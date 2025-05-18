"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const GroupController_1 = __importDefault(require("../controller/GroupController"));
const UserController_1 = __importDefault(require("../controller/UserController"));
const MessageController_1 = __importDefault(require("../controller/MessageController"));
const AuthController_1 = __importDefault(require("../auth/AuthController"));
const MultimediaController_1 = __importDefault(require("../controller/MultimediaController"));
const WebPusherController_1 = __importDefault(require("../controller/WebPusherController"));
const NotificationController_1 = __importDefault(require("../controller/NotificationController"));
const userController_1 = __importDefault(require("../admin/controller/userController"));
const isAdmin_1 = require("../middleware/isAdmin");
const router = express_1.default.Router();
//Authentication
router.get('/auth', AuthController_1.default.checkToken, AuthController_1.default.checkUser);
router.post('/login', UserController_1.default.login);
router.get('/verifyEmail/:token', AuthController_1.default.verifyUser);
//pinging server
router.get('/ping', GroupController_1.default.ping);
//apis for users
router.get('/getProfile', AuthController_1.default.checkToken, UserController_1.default.getUserProfile);
router.get('/getUser/:email', AuthController_1.default.checkToken, UserController_1.default.getUser);
router.get('/getUsers', AuthController_1.default.checkToken, UserController_1.default.getUsers);
router.post('/signup', UserController_1.default.signup);
router.put('/editUser/', AuthController_1.default.checkToken, UserController_1.default.updateUser);
router.put('/editUserPassword', AuthController_1.default.checkToken, UserController_1.default.editUserPassword);
router.put('/editUserProfilePicture', AuthController_1.default.checkToken, UserController_1.default.editUserProfilePicture);
//apis for groups
router.get('/getGroups', AuthController_1.default.checkToken, GroupController_1.default.getGroups);
router.get('/getGroup/:name', AuthController_1.default.checkToken, GroupController_1.default.getGroup);
router.post('/createGroup', AuthController_1.default.checkToken, GroupController_1.default.createGroup);
router.put('/editGroupProfile/:group', AuthController_1.default.checkToken, GroupController_1.default.updateGroupPhoto);
router.put('/updateGroup/:groupId', AuthController_1.default.checkToken, GroupController_1.default.updateGroup);
router.post('/addMember', AuthController_1.default.checkToken, GroupController_1.default.addMember);
//apis for messages
router.get('/gmessage/:group', AuthController_1.default.checkToken, MessageController_1.default.getGMessage);
router.get('/message/:receiverId', AuthController_1.default.checkToken, MessageController_1.default.getMessage);
//apis for files
router.post('/uploadFile', AuthController_1.default.checkToken, MultimediaController_1.default.fileUpload);
router.get('/getFile/:fileName', AuthController_1.default.checkToken, MultimediaController_1.default.sendFile);
//apis for pusher
router.post('/webPusher/subscribe', AuthController_1.default.checkToken, WebPusherController_1.default.webPusherController);
//apis for notifications
router.get('/getNotifications', AuthController_1.default.checkToken, NotificationController_1.default.getNotification);
//apis for admin
router.get('/admin/stats', isAdmin_1.isAdmin, userController_1.default.getAdminStats);
exports.default = router;
