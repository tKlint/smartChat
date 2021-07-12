const express = require('express');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const Upload = require('../controller/upload');
const upload = require('../controller/upload');


/**
 * 中间件
 */
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now());
  next();
});


router.get('/', function (req, res) {
  res.send('Birds home page');
});

router.get('/about', function (req, res) {
  res.send('About birds');
});

router.post('/upload', upload.uploadFile)

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