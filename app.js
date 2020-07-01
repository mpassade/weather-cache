const express = require('express')
const app = express()
const path = require('path')
const morgan = require('morgan')
const flash = require('connect-flash')
const session = require('express-session')
const router = require('./routes/routes')

require('dotenv').config()

const port = process.env.PORT || 8000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use(
    session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60 * 5
        }
    })
)

app.use(flash())

app.use((req, res, next) => {
    res.locals.errors = req.flash('errors')
    res.locals.dataOrigin = []
    res.locals.days = []
    res.locals.icons = []
    res.locals.date = []
    res.locals.summary = []
    res.locals.sunrise = []
    res.locals.sunset = []
    res.locals.hiTemp = []
    res.locals.lowTemp = []
    next()
})

app.use('/', router)

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})