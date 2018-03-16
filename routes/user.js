const router = require('express').Router()
const {UserModel} = require('../controller/users')
const {success, fail} = require('../public/js/code')
const checkLogin = require('../middlewares/check').checkLogin
// const path = require('path')
// const fs = require('fs')
// const multer = require('multer')
//注册
router.post("/signup",UserModel.signup)
//登录
router.post("/signin",UserModel.signin)
//关注
router.post("/attention/:userId",checkLogin,UserModel.setArrtent)
//获取关注人的信息
router.get("/attentionList",checkLogin,UserModel.getArrtentList)
module.exports  = router
//export default router
