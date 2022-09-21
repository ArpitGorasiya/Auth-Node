require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const userRoute = require('./routes/userRoute')

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/user', userRoute)
app.use('/api/user', userRoute)


const port = process.env.PORT
app.listen(port, () => {
    console.log(`Server Running on http://localhost:${port}`)
})

const url = process.env.MONGO_URL
mongoose.connect(url, () => {
    console.log("Database Connected...");
})