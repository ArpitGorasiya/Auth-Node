const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')
const checkUserAuth = require('../middlewares/auth-middleware')

router.use('/changepass', checkUserAuth)
router.use('/loggeduser', checkUserAuth)

router.post("/register", userController.userRegister)
router.post("/login", userController.userLogin)
router.post("/sendemail", userController.sendEmail)
router.post("/resetpass/:id/:token", userController.resetPassword)

router.post("/changepass", userController.changePassword)
router.get("/loggeduser", userController.loggedUser)

module.exports = router