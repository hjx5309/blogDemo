const {Tools} = require("../lib/tools")
module.exports={
    tools:function(req,res,next){
        res.tools = new Tools(req,res);
        next()
    }
}