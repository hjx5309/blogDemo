"use strict";
const userModel = require("../models/user").User;
const UserAttent = require("../models/userAttention").UserAttent
const config = require('../config/default');
//const jwt = require('jsonwebtoken');
const jwt = require("../middlewares/jwt").jwt
//const passport = require('passport');
const { success, fail ,Invalid} = require('../public/js/code');
const bcrypt = require('bcrypt');

class User {
    constructor() {
        this.signin = this.signin.bind(this);
        this.signup = this.signup.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
        this.getUserByName = this.getUserByName.bind(this);
        this.create = this.create.bind(this);
        this.setArrtent = this.setArrtent.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this)
    }
    //登录  
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
                        var token = jwt.setToken(admin._id)
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
    async aaa(req, res, next){
        //res.send({code:2});
            var Id =  "5ab2121b1436603fc4d4b5ce"
       console.log("id",req.body._id)
       try{
        var user = await this.getUserById(Id).select({"name": 1, "_id": 0});
        res.send({code:success,message:"success",data:user})
       }catch(e){
        res.send({ code: fail, message: e.message })
       } 
    }
    //获取个人信息
    async getUserInfo(req,res,next){
     
       var Id = req.body._id;
       try{
        var user = await this.getUserById(Id).select({"name": 1, "_id": 0});
        res.send({code:success,message:"success",data:user})
       }catch(e){
        res.send({ code: fail, message: e.message })
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
                 
                   var user =  await userModel.insert(newUser);
                   console.log("user",user)
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
        var token = req.headers['token'];
        try {
            if (!params.userId.length) {
                throw new Error('请填写userID')
            }           
        } catch (e) {
            res.send({ code: fail, message: e.message, })
        }

        const admin = await this.tokenToUser(token);
        const otherID = await this.getUserById(params.userId);
        if(admin&&otherId){
            try{
                await UserAttent.update({ userId: admin._id,otherID });
                res.send({ code: success, message: '关注成功' })
            }catch(e){
                res.send({ code: fail, message: e.message, })
            }
           
        }else{
            res.send({ code: Invalid, message: 'token无效' })
        }
       
    }
    //获取所关注人的信息
    async getArrtentList(req, res, next){
        var token = req.headers['token'];
            var list = [];
            try{
               list = await userModel.findOne({ token }).populate({path:"_id"},{name: 1, _id: 0},"User");
               res.send({ code: success, message: "成功",data:list })
            }catch(e){
                res.send({ code: fail, message: e.message, })
            }
           
        
    }
    create(user) {
        //console.log("userModel",userModel)
        //return userModel.bcryptPassword().insert(user).exec()
        return userModel.insert(user).bcryptPassword().exec()
    }
    //根据token获取用户信息
    tokenToUser(token){
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