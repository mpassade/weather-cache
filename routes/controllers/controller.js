const fetch = require('node-fetch')
const axios = require('axios')
const {client} = require('../middleware/middleware')
require('dotenv').config()

let darkSkyUrl = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/`
let zipCodeUrl = `https://www.zipcodeapi.com/rest/${process.env.ZIP_CODE_API_KEY}/info.json/`

const getDay = (sec) => {
    const days = [
        'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'
    ]
    return days[new Date(sec * 1000).getDay()]
}

const getTime = (sec) => {
    const date = new Date(sec * 1000)
    const hours = '0' + date.getHours();
    const minutes = '0' + date.getMinutes();
    const seconds = '0' + date.getSeconds();
    return hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)
}

const getDate = (sec) => {
    const date = new Date(sec * 1000)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    return month + '/' + day + '/' + year
}

module.exports = {
    home: (req, res) => {
        res.render('main/index')
    },

    weather: (req, res) => {

        let zipUrl = zipCodeUrl + req.body.zipCode + '/degrees'

        fetch(zipUrl)
        .then(zipCodeData => {
            return zipCodeData.json()
        })
        .then(newData => {
            const lat = newData.lat
            const lng = newData.lng
            let dsUrl = darkSkyUrl + lat + ',' + lng
            return dsUrl
        }).then(darkSky => {
            fetch(darkSky).then(dsData => {
                return dsData.json()
            }).then(result => {
                return result.daily.data
            }).then(data => {
                const days = data.map(obj => {
                    return getDay(obj.time)
                })
                const icons = data.map(obj => {
                    return obj.icon
                })
                const date = data.map(obj => {
                    return getDate(obj.time)
                })
                const summary = data.map(obj => {
                    return obj.summary
                })
                const sunrise = data.map(obj => {
                    return getTime(obj.sunriseTime)
                })
                const sunset = data.map(obj => {
                    return getTime(obj.sunsetTime)
                })
                const hiTemp = data.map(obj => {
                    return obj.temperatureHigh
                })
                const lowTemp = data.map(obj => {
                    return obj.temperatureLow
                })

                const finalData = {}
                finalData.date = Date.now()
                finalData.data = data
                client.setex(`redisData:${req.body.zipCode}`, 60*60*5, JSON.stringify(finalData))
                const dataOrigin = ['From DB']
                res.locals.dataOrigin = res.locals.dataOrigin.concat(dataOrigin)
                res.locals.days = res.locals.days.concat(days)  
                res.locals.icons = res.locals.icons.concat(icons)
                res.locals.date = res.locals.date.concat(date)
                res.locals.summary = res.locals.summary.concat(summary)
                res.locals.sunrise = res.locals.sunrise.concat(sunrise)
                res.locals.sunset = res.locals.sunset.concat(sunset)
                res.locals.hiTemp = res.locals.hiTemp.concat(hiTemp)
                res.locals.lowTemp = res.locals.lowTemp.concat(lowTemp)  

                res.render('main/index')
            }).catch((err) => {
                console.log(err)
                return res.status(400).send('Server Error: Cannot get data from Dark Sky API')
            })
        }).catch((err) => {
            console.log(err)
            return res.status(400).send('Server Error: Cannot get data from Zip Code API')
        })
    }
}