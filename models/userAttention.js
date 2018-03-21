const mongolass = require("../lib/mongo").mongolass; 
const Mongolass = require('mongolass');
const UserAttent = mongolass.model('UserAttent', {
    userId: {
        type: Mongolass.Types.ObjectId 
    },
    otherID: {
        type: Mongolass.Types.ObjectId 
    }    
});
exports.UserAttent=UserAttent;
exports.UserAttent.index({userId: 1}).exec()