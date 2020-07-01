const express = require('express')
const router = express.Router()

const {
    home, weather
} = require('./controllers/controller')
const {
    checkZipCode, checkForData
} = require('./middleware/middleware')

router.get('/', home)
router.post(
    '/', 
    checkZipCode,
    checkForData,
    weather
)

module.exports = router