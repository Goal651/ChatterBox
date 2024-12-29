import express from 'express'
import controller from '../controller/AppController'
import messageController from '../controller/MessageController'
import auth from '../auth/AuthController'
import mediaController from '../controller/MultimediaController'

const router = express.Router()

//Authentication
router.get('/auth', auth.checkToken, auth.checkUser)
router.post('/login', controller.login)

//pinging server
router.get('/ping', controller.ping)

//creation of groups and users
router.post('/signup', controller.signup)
router.post('/create-group', auth.checkToken, controller.createGroup)

//getting users and groups
router.get('/getUserProfile', auth.checkToken, controller.getUserProfile);
router.get('/getUser/:email', auth.checkToken, controller.getUser)
router.get('/getUsers', auth.checkToken, controller.getUsers)
router.get('/getGroups', auth.checkToken, controller.getGroups);
router.get('/getGroup/:name', auth.checkToken, controller.getGroup);

//getting messages
router.get('/gmessage/:group', auth.checkToken, messageController.getGMessage)
router.get('/message/:receiverId/:phase', auth.checkToken, messageController.getMessage)

//updating user,groups and messages
router.put('/editUserProfile', auth.checkToken, controller.updateUserPhoto)
router.put('/editGroupProfile/:group', auth.checkToken, controller.updateGroup)
router.put('/editUser/', auth.checkToken, controller.updateUser)
router.put('/updateGroupProfile/:group', auth.checkToken, controller.updateGroup)
router.post('/addMember', auth.checkToken, controller.addMember)

//file uploads
router.post('/uploadFile', auth.checkToken, mediaController.fileUpload)
router.get('/getFile/:fileName', auth.checkToken, mediaController.sendFile)


export default router;