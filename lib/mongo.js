//获取配置项的内容
const config = require('config-lite')(__dirname)
//获取连接mongodb的内容
const Mongolass = require('mongolass')
//时间戳的格式化
const moment = require('moment')
//加密密码
const bcrypt = require('bcrypt');
//把objectid转化为时间戳
const objectIdToTimestamp = require('objectid-to-timestamp')

const mongolass = new Mongolass()
//连接数据库
mongolass.connect(config.mongodb)
mongolass.plugin('addAt', {
    beforeInsert: function (format) {
      console.log('beforeInsert', this._op, this._args, format)
      // beforeInsert insert [ { firstname: 'san', lastname: 'zhang' } ] YYYY-MM-DD
      this._args[0].addCreatedAt = moment().format(format)
    }
  })
//添加时间的插件，这样在取出数据时，就可以拿出查出时间
mongolass.plugin('addCreatedAt', {
    afterFind(results) {
        results.forEach((item) => {
            item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm')
        })
        return results
    },
    afterFindOne(result) {
        if (result) {
            result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm')
        }
        return result
    }
})
  mongolass.plugin('comparePassword', {
    afterFind(results) {
        results.forEach((item) => {
            item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm')
        })
        return results
    },
    afterFindOne(result) {
        if (result) {
            result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm')
        }
        return result
    }
}) 
module.exports={mongolass} ;
