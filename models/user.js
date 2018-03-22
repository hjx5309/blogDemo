//const mongolass = require('');
//加密密码
const bcrypt = require('bcrypt');
const mongolass = require("../lib/mongo").mongolass; 
const Mongolass = require('mongolass')
const User = mongolass.model('User', {
    name: {
        type: 'string'
    },
    passport: {
        type: 'string'
    },
    openId:{
        type: 'string'
    },
    avatarUrl:{
        type: 'string'
    },
    addCreatedAt:{
        type: 'string'
    }
});
User.plugin('bcryptPassword', {
    beforeInsert: async function() {
            var that = this;
            // await (function(){
            //     that._args[0].passport ="5555"
            // })()
            bcrypt.genSalt(10, function (err, salt) {
                if (err) {
                    throw  err;
                    return 
                }
                  bcrypt.hash(that._args[0].passport, salt, function (err, hash) {
                    if (err) {
                        throw  err;
                        return 
                    }
       
                      that._args[0].passport = hash;
                });
            });
          
      
    },
  })
  exports.User=User
//名称创成索引
exports.User.index({name: 1}, {unique: true}).exec()

