var redis = require('redis');
const { REDIS_CONFIG } = require('../config');
console.log('redis ')
const client = redis.createClient({
	port: 6379,
	host: '127.0.0.1'
});

// client.on_connect

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
			} else {
				resolve(res)
			}
		})
	})
}

// 存储值
const setValue = (key, value, expire) => {
	if (typeof value === 'string') {
		client.set(key, value);
	} else if (typeof value === 'object') {
		for (let item in value) {
			client.hmset(key, item, value[item], redis.print)
		}
	}
	if (expire) {
		client.expire(key, REDIS_CONFIG.EXPIRE_TIME_SECOND)
	}
}

/**
 * 删除key		
 * @param {string} key redis key
 */
const delKey = (key) => {
	client.del(`${key}`)
}

module.exports = {
	getKey,
	setValue,
	delKey
};