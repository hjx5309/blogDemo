module.exports = {
    port: 9999,
    session: {
        secret: 'blog',
        key: 'blog',
        maxAge: 2592000000,
    },
    redis: {  
        "host": "127.0.0.1",  
        "port": 6379  
    },
    secretKey:"aaaaaaaaaaaaaaaaaaa",
    mongodb: 'mongodb://localhost:27017/xxxx',
    'client_id': 'e6659c401d71d105072e',
    'client_secret': 'e85a5e6bf359d6ec05d693056d8fa58279c05d25',
    'scope': ['user'],
    homeUrl: 'http://localhost:9090'
}