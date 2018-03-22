"use strict";
const userModel = require("../models/user").User;
const UserAttent = require("../models/userAttention").UserAttent
const config = require('../config/default');
//const jwt = require('jsonwebtoken');
const jwt = require("../middlewares/jwt").jwt
//const passport = require('passport');
const { success, fail, Invalid } = require('../public/js/code');
const bcrypt = require('bcrypt');
const {wx} = require("./weChat")
class User {
    constructor() {
        this.signin = this.signin.bind(this);
        this.signup = this.signup.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
        this.getUserByName = this.getUserByName.bind(this);
        this.create = this.create.bind(this);
        this.setArrtent = this.setArrtent.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
        this.weChat = this.weChat.bind(this)
    }
    //登录
    /**
     * @api {post} /user/signin  登录
     * @apiName Signin
     * @apiGroup User
     * @apiParam {String} name 名称
     * @apiParam {String} passport 密码
     * @apiSuccess {String} token 认证token
     * @apiSuccess {String} code 状态码 
     * @apiSuccess {String} message 状态码
     * @apiSuccessExample {json} 返回样例:
    * {
    *   "code": 0,
    *   "message": "请求成功",
    *   "token":"12345678900987654321"
    * }
     * */
    async signin(req, res, next) {
        var that = this
        if (!req.body.name || !req.body.passport) {
            res.send({ code: fail, message: '请输入您的账号密码.' })
        } else {
            //查找用户名称
            const admin = await this.getUserByName(req.body.name);
            //如果名字存在，就不能注册,不存在才能注册
            if (admin) {
                if (req.body.passport == admin.passport) {
                    try {
                        // await this.update(admin._id, { token });
                        var token = await jwt.setToken(admin._id)
                        res.send({ code: success, message: '登录成功', token })
                    } catch (e) {
                        res.send({ code: fail, message: e.message })
                    }
                } else {
                    res.send({ code: fail, message: '账户与密码不匹配' })
                }
                res.send({ code: fail, message: '已存在用户，请更换名称' })

            } else {
                res.send({ code: fail, message: '用户不存在，请检查用户名' })

            }


        }
    }
    //获取个人信息
    async getUserInfo(req, res, next) {

        var Id = req.body._id;
        try {
            var user = await this.getUserById(Id).select({ "name": 1, "_id": 0,"avatarUrl":1 });
            res.tools.setJson(success,  "success",  user )
        } catch (e) {
            res.send({ code: fail, message: e.message })
        }
    }

    async weChat(req, res, next){
        try {
            if (!req.body.jsCode.length) {
                throw new Error('请填写jsCode')
            }
        } catch (e) {
            res.send({ code: fail, message: e.message, })
        }
       var data = await wx.codeOpenId(req.body.jsCode);
       const body =JSON.parse(data.body)
       if(body.openid){
         var token;
         //检查该Id是否存在
         //如果不存在就插入
         //如果存在就查出
         var isExit = await userModel.findOne({name:req.body.name});
         if(isExit){
          token = await jwt.setToken(isExit._id);
         }else{
            const newUser = { name: req.body.name, avatarUrl: req.body.avatarUrl,openId:body.openid };
            var user = await userModel.insert(newUser);
            token = await jwt.setToken(user.ops[0]._id)  
         }
        
         res.tools.setJson(success,  "success",  {token} )
       }else{
        res.tools.setJson(fail,"失败")
       }
      

    }
    //注册
    async signup(req, res, next) {
        if (!req.body.name || !req.body.passport) {
            res.send({ code: fail, message: '请输入您的账号密码.' })
        } else {
            //查找用户名称1
            const admin = await this.getUserByName(req.body.name);
            //如果名字存在，就不能注册,不存在才能注册
            if (admin) {
                res.send({ code: fail, message: '已存在用户，请更换名称' })
            } else {

                const newUser = { name: req.body.name, passport: req.body.passport };

                try {
                    //await this.create(newUser);

                    var user = await userModel.insert(newUser);
                    console.log("user", user)
                    var token = await jwt.setToken(user.ops[0]._id)
                    res.send({ code: success, message: '注册成功', token: token })
                } catch (err) {
                    console.log(err)
                }
            }
        }
    }
    //设置关注
    async setArrtent(req, res, next) {
        // 校验参数
        var params = req.params;
        try {
            if (!params.userId.length) {
                throw new Error('请填写userID')
            }
        } catch (e) {
            res.send({ code: fail, message: e.message, })
        }

        const admin = req.body._id;

        const otherID = params.userId;
        if (admin && otherID) {
            try {
                await UserAttent.insert({ userId: admin, otherID });
                res.send({ code: success, message: '关注成功' })
            } catch (e) {
                res.send({ code: fail, message: e.message, })
            }

        } else {
            res.send({ code: Invalid, message: 'token无效' })
        }

    }
    //获取所关注人的信息
    async getArrtentList(req, res, next) {
        const admin = req.body._id;
        console.log("admin1", admin)
        var list = [];
        try {
            list = await UserAttent.find({ userId: admin }).select({ otherID: 1, _id: 0 }).populate({ path: "otherID", select: { name: 1 }, model: "User" });
            res.send({ code: success, message: "成功", data: list })
        } catch (e) {
            res.send({ code: fail, message: e.message, })
        }


    }
    create(user) {
        //console.log("userModel",userModel)
        //return userModel.bcryptPassword().insert(user).exec()
        return userModel.insert(user).bcryptPassword().exec()
    }
    //根据token获取用户信息
    tokenToUser(token) {
        return userModel.findOne({ token })
    }
    update(_id, data) {
        return userModel.update({ _id }, { $set: data }).exec()
    }
    async getUserByName(name) {
        return userModel.findOne({ name }).addCreatedAt().exec()
    }
    getUserById(id) {
        return userModel.findOne({ _id: id })
    }
    getUserByOtherUserId(otherUserId) {
        return userModel.findOne({ otherUserId }).addCreatedAt().exec()
    }
    setUserInfo(author, userInfo) {
        return userModel.update({ _id: author }, { $set: userInfo }).exec()
    }

}

module.exports = { UserModel: new User() }