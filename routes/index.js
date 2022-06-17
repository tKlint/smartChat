const express = require('express');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const upload = require('../controller/upload');
const user = require('../controller/user');
const { getKey } = require('../redis/index');

const { RESPONSE_STATUS_CODE } = require('../config');
const { parserResult } = require('../util/responseParser');

const freeApis = ['/api/login', '/api/register', '/api/sendCapcha'];

/**
 * 中间件
 */
router.use( async function timeLog(req, res, next) {
	console.log('Time: ', Date.now());
	const accessToken = req.headers['access-token'];
	const apiName = req.originalUrl;
	if(freeApis.includes(apiName)) {
		console.log('fressAPis')
		return next();
	}
	console.log('next 了继续执行');
	if (!accessToken) {
		return res.send(parserResult([], '没有访问权限，请先登录', RESPONSE_STATUS_CODE.NO_ACCESS));
	}
	const userCache = await getKey(accessToken);
	if (!userCache) {
		return res.send(parserResult([], '授权过期重新登录', RESPONSE_STATUS_CODE.NO_ACCESS));
	}
	next();
});


router.get('/', function (req, res) {
	res.send('Birds home page');
});

router.post('/about', function (req, res) {
	res.send(req.body);
	// res.send('About birds');
});

router.post('/upload', upload.uploadFile);

router.post('/login', user.login);

router.get('/getUserInfo', user.getUerInfo);
router.post('/sendCapcha', user.sendCapcha);
router.post('/register', user.register);



/**
 * 404
 * invalid request
 */
router.use((req, res, next) => {
	const { originalUrl, headers } = req;
	res.setHeader('Content-Type', 'application/json');
	res.status(404).send({
		errCode: 20404,
		errMsg: `request: fail invalid url: ${headers.host}${originalUrl}`
	})
})

module.exports = router;

// 1 系统层
// 2 框架层
// 3 权限层
// 4 业务层