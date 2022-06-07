const express = require('express');
const path = require("path");
const fs = require('fs');
const http = require('http');
const wss = require('./socket');
const router = require("./routes");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * 服务端口
 */
const port = 3001;
/**
 * 定义http服务
 */
const server = http.createServer(app);
/**
 * 允许访问的静态资源
 */
app.use('/static', express.static(path.join(__dirname, 'public')));
/**
 * 允许访问的临时资源
 */
app.use('/temp', express.static(path.join(__dirname, 'temp')));

/**
 * 访问根目录
 * 响应welcome.html
 */
app.all('/', async (req, res) => {
    const welcomePage = await fs.readFileSync(`${__dirname}/public/welcome.html`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(welcomePage);
});
/**
 * 挂载router
 */
app.use('/api', router);
/**
 * 404
 */
app.use(async (req, res) => {
    const notFoundPage = await fs.readFileSync(`${__dirname}/public/404.html`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
	res.status(404).send(notFoundPage);
});


/**
 * 监听upgrade事件
 * 分配socket服务
 */
server.on('upgrade', function upgrade(request, socket, head) {
    const charAt = request.url.indexOf('?');
    // 模拟子路由
    const pathname = request.url.substring(0, charAt);
    if (pathname === '/chatting') {
        wss.handleUpgrade(request, socket, head, function done(conn) {
            wss.emit('connection', conn, request);
        });
    } else {
        console.log("no this socket server");
        socket.destroy();
    }
});


server.listen(port, () => {
    console.log(`App runing on http://127.0.0.1:${port}`);
});