const WebSocket = require('ws');
const { setValue, getKey } = require('../redis');

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
    console.log(requestParms, 'requestParms')
    // 存放socket
    if (!ws.clintId) {
        ws.clintId = `${requestParms.uuid}-clint-id`;
    }
    setValue(`${requestParms.uuid}-clint-id`, ws.clintId);

    /**
     * incomeing message event
     */
    ws.on('message', function (message) {
        console.log(message,    'message')
        try {
            const { clintId, data, to, type } = JSON.parse(message);
        
            const messageStringify = JSON.stringify({
                from: ws.clintId,
                formUUID: requestParms.uuid,
                data,
                type,
            })
            // ws.send(messageStringify);
            const targetClintId = `${to}-clint-id`;
            wss.clients.forEach(socket => {
                // socket.send(messageStringify);
                console.log(socket.clintId, '-->', targetClintId)
                if (socket.clintId === targetClintId && socket.readyState === 1) {
                    console.log('找到对方')
                    socket.send(messageStringify);
                }
            });
        } catch (error) {
            
        }
        
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