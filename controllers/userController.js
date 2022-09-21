const UserModel = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const transporter = require('../config/emailConfig')

class UserController {
    static userRegister = async (req, res) => {
        const { name, email, password, confirmPassword, tc } = req.body
        const user = await UserModel.findOne({ email: email })
        if (user) {
            res.send({ "status": "failed", "msg": "Email is Already Exists" })
        } else {
            if (name && email && password && confirmPassword && tc) {
                if (password === confirmPassword) {
                    try {
                        const salt = await bcrypt.genSalt(10)
                        const hash = await bcrypt.hash(password, salt)
                        const reguser = new UserModel({
                            name: name,
                            email: email,
                            password: hash,
                            tc: tc
                        })
                        await reguser.save()
                        const save_user = await UserModel.findOne({ email: email })
                        const token = jwt.sign({ userId: save_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
                        res.send({ "status": "success", "msg": "User Successfully Register", "token": token })
                    } catch (error) {
                        console.log(error)
                        res.send({ "status": "failed", "msg": "Unabel to Register" })
                    }
                } else {
                    res.send({ "status": "failed", "msg": "Password and Confirm Password Not Matched" })
                }
            } else {
                res.send({ "status": "failed", "msg": "All Fields Are Required" })
            }
        }
    }

    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body
            if (email && password) {
                const user = await UserModel.findOne({ email: email })
                if (user != null) {
                    const isMatch = await bcrypt.compare(password, user.password)
                    if (user.email === email && isMatch) {
                        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })

                        res.send({ "status": "success", "msg": "User Successfully Login", "token": token })
                    } else {
                        res.send({ "status": "failed", "msg": "Invalid Credentials" })
                    }
                } else {
                    res.send({ "status": "failed", "msg": "Invalid Credentials" })
                }
            } else {
                res.send({ "status": "failed", "msg": "All Fields Are Required" })
            }
        } catch (error) {
            console.log(error);
            res.send({ "status": "failed", "msg": "Unable to Login" })
        }
    }

    static changePassword = async (req, res) => {
        const { password, confirmPassword } = req.body
        if (password && confirmPassword) {
            if (password !== confirmPassword) {
                res.send({ "status": "failed", "msg": "password and Confirm Password not Match" })
            } else {
                const salt = await bcrypt.genSalt(10)
                const hash = await bcrypt.hash(password, salt)
                await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: hash } })
                res.send({ "status": "success", "msg": "Password Successfully Changed" })
            }
        } else {
            res.send({ "status": "failed", "msg": "All Fields Are Required" })
        }
    }

    static loggedUser = async (req, res) => {
        res.send({ "user": req.user })
    }

    static sendEmail = async (req, res) => {
        const { email } = req.body
        if (email) {
            const user = await UserModel.findOne({ email: email })
            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY
                const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '10m' })
                const link = `http://localhost:3000/api/user/reset/${user._id}/${token}`
                console.log(link)

                // let info = await transporter.sendMail({
                //     from: process.env.EMAIL_FROM,
                //     to: user.email,
                //     subject: "Password Reset Link...",
                //     html: `<h1><a href=${link}>Click Here</a> to Reset Your Password</h1>`
                // })

                res.send({
                    "status": "success", "msg": "Password Reset Link Sent Successfully... Please Check Your Email",
                    //  "info": info 
                })
            } else {
                res.send({ "status": "failed", "msg": "Invalid Email" })
            }
        } else {
            res.send({ "status": "failed", "msg": "Email is Required" })
        }
    }

    static resetPassword = async (req, res) => {
        const { password, confirmPassword } = req.body
        const { id, token } = req.params
        const user = await UserModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try {
            jwt.verify(token, new_secret)
            if (password && confirmPassword) {
                if (password !== confirmPassword) {
                    res.send({ "status": "failed", "msg": "Passwrod and Confirm Password are Not Match" })
                } else {
                    const salt = await bcrypt.genSalt(10)
                    const hash = await bcrypt.hash(password, salt)
                    await UserModel.findByIdAndUpdate(user._id, { $set: { password: hash } })
                    res.send({ "status": "success", "msg": "Password Reset Successfully" })
                }
            } else {
                res.send({ "status": "failed", "msg": "All Field are Required" })
            }
        } catch (error) {
            res.send({ "status": "failed", "msg": "Invalid Token" })
        }
    }
}

module.exports = UserController