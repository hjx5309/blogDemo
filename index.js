const path = require('path')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const config = require('config-lite')(__dirname)
const bodyParser = require('body-parser')
const routes = require('./routes');
const check = require("./middlewares/jwt").jwt;
const {tools} = require("./middlewares/tool")
//const pkg = require('../package')
//日志
const winston = require('winston')
//日志代码
const expressWinston = require('express-winston')
const serverErr = require('./public/js/code').serverErr

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 隐藏 x-powered-by
app.disable('x-powered-by')

const isDev = process.env.NODE_ENV !== 'production'

if (isDev) {
    app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", config.homeUrl)
        res.header("Access-Control-Allow-Credentials", true) // 携带cookie
        res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With")
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
        if (req.method == "OPTIONS") {
            res.send(200) // 让options请求快速返回
        } else {
            next()
        }
    })
}

app.use(express.static(path.join(__dirname, 'public')))
//app.use(/^((?!signup|signup|captcha).)+$/,check.verifyToken)
// 生产环境增加编译后的dist静态资源
if (!isDev) {
    app.use(express.static(path.join(__dirname, '../dist')))
}
app.use("/user",tools)
app.use(/^((?!signup|signin|codeTotoken|public).)+$/,check.verifyToken)
app.use(session({
    name: config.session.key,
    secret: config.session.secret,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: config.session.maxAge,
        httpOnly: false
    },
    store: new MongoStore({
        url: config.mongodb
    })
}))

// app.use(expressWinston.logger({
//     transports: [
//         new winston.transports.Console({
//             json: true,
//             colorize: true
//         }),
//         new winston.transports.File({
//             filename: 'logs/success.log'
//         })
//     ]
// }))

routes(app)

// app.use(expressWinston.errorLogger({
//     transports: [
//         new winston.transports.Console({
//             json: true,
//             colorize: true
//         }),
//         new winston.transports.File({
//             filename: 'logs/error.log'
//         })
//     ]
// }))

app.use((err, req, res, next) => {
    let errData = {
        code: serverErr,
        data: [],
        msg: err.message
    }

    res.status(500)
    res.send(errData)
})

if (module.parent) {
    module.exports = app
} else {
    const port = process.env.PORT || config.port
    app.listen(port, () => {
        console.log(`listening on port ${port}`)
    })
}
