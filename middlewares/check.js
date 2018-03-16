const {unLogin} = require('../public/js/code');

//请求传过来前，检查是否登录
module.exports = {
    checkLogin(req, res, next) {
        if (!req.headers['token']) {
            return res.send({
                code: unLogin,
                data: [],
                msg: '未登录'
            })
        }
        next()
    }
}