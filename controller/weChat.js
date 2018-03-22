const {request}=require("../public/js/util");
const {appId,appsecret}=require("../config/default")
class weChat{
    constructor(){
        this.codeOpenId = this.codeOpenId.bind(this); 
    }
    //使用code换取openId
   async codeOpenId(code){
      var url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appsecret}&js_code=${code}&grant_type=authorization_code`;
       var qq=  await request(url);
       return qq
    }

}
module.exports={wx:new weChat()}