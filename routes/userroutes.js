const express = require('express')
const userRoute = express.Router()
const { otpSend, verifyOtp, updateUser, getAllUser, selectclass, selectstream, resendOTP, updategrade, getsubject, getvideos, updatestream, selectboard, selectlanguage, loginController, getUserProfile, userProfile,updatesubscription,checkExpiredSubscriptions } = require('../controller/usercontroller')
const combinedMiddleware = require('../middleware/auth')
userRoute.post('/sendotp', otpSend)
userRoute.post('/verifyotp', verifyOtp)
userRoute.put('/user/:email', updateUser)
userRoute.get('/user', getAllUser)
userRoute.put('/users', combinedMiddleware, selectclass)
userRoute.put('/userstream', combinedMiddleware, selectstream)
userRoute.put('/resendotp',resendOTP)
userRoute.post('/login', loginController)


userRoute.get('/userss', combinedMiddleware, getUserProfile);
userRoute.put('/userprofile', combinedMiddleware, userProfile);
userRoute.put('/board', combinedMiddleware, selectboard)
userRoute.put('/language', combinedMiddleware, selectlanguage)
userRoute.put('/updategrade', combinedMiddleware, updategrade)
userRoute.put('/updatestream', combinedMiddleware, updatestream)
userRoute.get('/getsubject', combinedMiddleware, getsubject)
userRoute.get('/getvideos/:id', combinedMiddleware, getvideos)
userRoute.put('/subscription',combinedMiddleware,updatesubscription)
userRoute.get('/expiry',combinedMiddleware,checkExpiredSubscriptions)

module.exports = userRoute