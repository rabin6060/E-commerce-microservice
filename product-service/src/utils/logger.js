const winston = require('winston')

const logger = winston.createLogger({
    level: process.env.NODE_ENV ==='production'? 'info':'debug',
    format:winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({stack:true}),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta:{service:'product-service'},
    transports:[
        new winston.transports.Console({
            format:winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        //error file for errors only
        new winston.transports.File({filename:'error.log',level:'error'}),
        //logger for combined error
        new winston.transports.File({filename:'combined.log'})
    ]
})
module.exports = {logger}