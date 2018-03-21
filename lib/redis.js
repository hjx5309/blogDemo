const redis = require("redis");
//获取配置项的内容
const  redis_config= require('config-lite')(__dirname).redis;
console.log("redis",redis_config)
const redisClient = redis.createClient(redis_config);
redisClient
	.on('error', err => console.log('------ Redis connection failed ------' + err))
    .on('connect', () => console.log('------ Redis connection succeed ------'));

module.exports={redis,
    redisClient
}