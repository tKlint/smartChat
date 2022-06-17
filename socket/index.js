const WebSocket = require('ws');
const { setValue } = require('../redis');

const { deCodeFormUrl } =  require('../util');

const wss = new WebSocket.Server({ 
    port: 3002
 });

/**
 * online people
 */
let online = 0;

/**
 * connect event
 */
wss.on('connection', (ws, request) => {
    // 在线人数
    online ++;
    // 请求的完整url
    const { url, uuid } = request;

    // 获取请求的参数
    const requestParms = deCodeFormUrl(url);
    // 存放socket
    if (!ws.clintId) {
        ws.clintId = requestParms.clintId;
    }
    setValue(`${uuid}-clint-id`, ws.clintId);

    /**
     * incomeing message event
     */
    ws.on('message', function (message) {
        const { clintId, data, to, type } = JSON.parse(message);
        const messageStringify = JSON.stringify({
            from: ws.clintId,
            data,
            type,
        })
        ws.send(messageStringify);
        wss.clients.forEach(socket => {
            socket.send(messageStringify);
            // if (socket.clintId === to && socket.readyState === 1) {
            //     socket.send(messageStringify);
            // }
        });
    });
    /**
     * disconnect event
     */
    ws.on('close', (code, res) => {
        console.log('some one disconnect');
        online --;
    })
});


module.exports = wss;