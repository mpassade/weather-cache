const redis = require('redis')
const client = redis.createClient(process.env.REDIS_PORT)

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
    checkZipCode: (req, res, next) => {
        if (req.body.zipCode.length !== 5){
            req.flash('errors', 'Invalid Zip Code')
            return res.redirect('/')
        }
        next()
    },

    checkForData: (req, res, next) => {
        client.get(`redisData:${req.body.zipCode}`, (err, info) => {
            if (err){
                return res.status(400).send('Server Error')
            }

            if (info===null){
                console.log('null call')
                return next()
            }

            
            const currentDate = Date.now()
            const parsedData = JSON.parse(info)
            const redisDate = parsedData.date


            if (+currentDate < +redisDate+(1000*60*60*5)){
                const days = parsedData.data.map(obj => {
                    return getDay(obj.time)
                })
                const icons = parsedData.data.map(obj => {
                    return obj.icon
                })
                const date = parsedData.data.map(obj => {
                    return getDate(obj.time)
                })
                const summary = parsedData.data.map(obj => {
                    return obj.summary
                })
                const sunrise = parsedData.data.map(obj => {
                    return getTime(obj.sunriseTime)
                })
                const sunset = parsedData.data.map(obj => {
                    return getTime(obj.sunsetTime)
                })
                const hiTemp = parsedData.data.map(obj => {
                    return obj.temperatureHigh
                })
                const lowTemp = parsedData.data.map(obj => {
                    return obj.temperatureLow
                })


                res.locals.dataOrigin.push('From Cache')

                res.locals.days = res.locals.days.concat(days)  
                res.locals.icons = res.locals.icons.concat(icons)  
                res.locals.date = res.locals.date.concat(date)  
                res.locals.summary = res.locals.summary.concat(summary)  
                res.locals.sunrise = res.locals.sunrise.concat(sunrise) 
                res.locals.sunset = res.locals.sunset.concat(sunset)  
                res.locals.hiTemp = res.locals.hiTemp.concat(hiTemp)  
                res.locals.lowTemp = res.locals.lowTemp.concat(lowTemp)  


                return res.render('main/index')
            }
            next()
        })
    },

    client: client
}