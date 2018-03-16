"use strict";
const userModel = require("../models/user").User;
const config = require('../config/default');
const jwt = require('jsonwebtoken');
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
        this.setArrtent = this.setArrtent.bind(this)
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
                    var token = jwt.sign({ name: admin.name }, config.secretKey, {
                        expiresIn: 10080
                    });
                    try {
                        await this.update(admin._id, { token });
                        res.send({ code: success, message: '登录成功', token })
                    } catch (e) {
                        res.send({ code: fail, message: e })
                    }
                } else {
                    res.send({ code: fail, message: '账户与密码不匹配' })
                }

                // bcrypt.compare(req.body.passport, admin.password, (err, res) => {
                //     if (err) {
                //         console.log("bcrypt对比失败",err)
                //         res.send({ code: fail, message: '已存在用户，请更换名称' })
                //     }
                //     // res == true 输入的密码与保存的密码一致
                //     if (res) {
                //         var token = jwt.sign({name: user.name}, config.secret,{
                //             expiresIn: 10080
                //           });
                //         admin.token = token;

                //        // await update(admin)
                //         res.send({ code: success, message: '登录成功' })
                //     } else {
                //         res.send({ code: fail, message: '已存在用户，请更换名称' })

                //     }
                // });

                res.send({ code: fail, message: '已存在用户，请更换名称' })

            } else {
                res.send({ code: fail, message: '用户不存在，请检查用户名' })

            }


        }
    }
    //注册
    async signup(req, res, next) {
        console.log(this)
        if (!req.body.name || !req.body.passport) {
            res.send({ code: fail, message: '请输入您的账号密码.' })
        } else {
            //查找用户名称
            const admin = await this.getUserByName(req.body.name);
            //如果名字存在，就不能注册,不存在才能注册
            if (admin) {
                res.send({ code: fail, message: '已存在用户，请更换名称' })
            } else {
                var token = jwt.sign({ name: req.body.name }, config.secretKey, {
                    expiresIn: 10080
                });
                const newUser = { name: req.body.name, passport: req.body.passport, token: token,attention:[] };

                try {
                    //await this.create(newUser);
                    await userModel.insert(newUser);
                    console.log(await userModel.findOne().addCreatedAt())
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
        if(admin){
            try{
                await userModel.update({ _id: admin._id }, { $addToSet: { attention:params.userId } });
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
               list = await userModel.findOne({ token },{name:1});
               res.send({ code: success, message: "成功",data:list })
            }catch(e){
                res.send({ code: fail, message: e.message, })
            }
           
        
    }
    //获取用户信息
    async getUserInfo(req, res, next) {

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