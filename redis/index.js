var redis = require('redis');
console.log('redis ')
const client = redis.createClient({
    port: 6379,
    host: '127.0.0.1'
});

/**
 * 读取redis
 * @param {string} key key
 * @param {string} group 组
 * @returns Promise<string>
 */
function getKey(key, group) {
    return new Promise((resolve, reject) => {
        client.get(key, (err, res) => {
          if (err) {
            reject(err)
          }else{
            resolve(res)
          }
        })
    })
}

// 存储值
const setValue = (key, value) => {
    if (typeof value === 'string') {
      client.set(key, value)
    } else if (typeof value === 'object') {
      for (let item in value) {
        client.hmset(key, item, value[item],redis.print)
      }
    }
  }

module.exports = {
    getKey,
    setValue
};