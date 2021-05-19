const express = require('express')
const session = require('express-session')

require('dotenv').config()
const PORT = process.env.PORT
const app = express()

app.listen(PORT, () => console.log(`http://localhost:${PORT}`))