const router = require('express').Router()
const {UserModel} = require('../controller/users')
const {success, fail} = require('../public/js/code')
const checkLogin = require('../middlewares/check').checkLogin;
const check = require("../middlewares/jwt").jwt;
// const path = require('path')
// const fs = require('fs')
// const multer = require('multer')
//微信登录
router.post("/codeTotoken",UserModel.weChat)
//注册
router.post("/signup",UserModel.signup)
//登录
router.post("/signin",UserModel.signin)
//获取个人信息
router.get("/getUserInfo",UserModel.getUserInfo)
//关注
router.post("/attention/:userId",UserModel.setArrtent)
//获取关注人的信息
router.get("/attentionList",UserModel.getArrtentList)
module.exports  = router
//export default router
