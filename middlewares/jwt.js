const {redis,redisClient} = require("../lib/redis")
const {fail } =require("../public/js/code");
const jwt = require('jsonwebtoken');
const config = require('../config/default');
class setRedis {
    constructor(){
        this.redisClient = redisClient;
        //过期时间
        this.TOKEN_EXPIRATION     = 60;
        this.TOKEN_EXPIRATION_SEC = this.TOKEN_EXPIRATION * 60 ;
        this.verifyToken = this.verifyToken.bind(this);
        this.setToken = this.setToken.bind(this)
    }
    /**
	 * Middleware for token verification  
     * 用来检查token是否有效     
	 */
    async verifyToken(req, res, next){
       const token = req.headers['token'];
       console.log("token",token)
       try{
        await jwt.verify(token,config.secretKey);
        this.redisClient.get(token,function(err,repy){
            if(repy){
                console.log("repy",repy)
                Object.assign(req.body, {
					_id     : repy, 					 
                });     
                next();
            }else{
               res.send({code:fail,message:"token过期"})
            }
        });
     
       }catch(e){
        res.send({code:fail,message:e.message})
       }
    }
    /**
     * 将token设置到redis里面，并且设置过期时间
     */
    async setToken(_id){
        var _id =_id.toString();
        console.log(_id)
        const token =  jwt.sign({ _id:_id }, config.secretKey); 
       await this.redisClient.set(token,_id);
       await this.redisClient.expire(token,this.TOKEN_EXPIRATION_SEC);
        return token;
    }
}
module.exports={ jwt:new setRedis()}