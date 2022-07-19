const BaseController = require("../libs/BaseController");
const { parserResult } = require('../util/responseParser');
const { RESPONSE_STATUS_CODE } = require('../config');
const { connection } = require('../mysql');
const { getKey, setValue, delKey } = require('../redis/index');

class Contact extends BaseController {
    /**
     * 获取联系人
     * @param {Request} req 
     * @param {Response} res 
     */
    async getContacts(req, res) {
        const { keyword, current = 1, pageSize = 10 } = req.query;
        // if (!keyword) {
        //     return res.send(parserResult([], '缺少必要参数', RESPONSE_STATUS_CODE.MISS_PARAMS, req.query));
        // }
        connection.query(
            'SELECT `id` as id, `nick_name` as nickName, `avatar_url` as avatarUrl, `email`, `account` FROM `user_info` WHERE (`email` = ? OR `account` = ?) LIMIT ?, ?',
            [keyword, keyword, current - 1, current * pageSize],
            (err, results) => {
                if (err) {
                    res.send(parserResult([], '查询失败', RESPONSE_STATUS_CODE.RESULT_FAILED, err.message))
                } 
                if (results) {
                    res.send(parserResult(results, '查询成功'))
                }
            }
        )
    }
    /**
     * 获取联系人
     * @param {Request} req 
     * @param {Response} res 
     */
    async sendContactRequest(req, res) {
        const { targetUUID, verifyMessage = '' } = req.body;
        const accessToken = res.headers['access-token'];
        const currentUser = await getKey(accessToken);
        const { avatarUrl, nickName, uuid } = JSON.parse(currentUser);
        connection.query(
            'INSERT INTO friends_request_message(origin_uuid, origin_nick, origin_avatar, target_uuid, content, create_time, update_time) VALUES(?,?,?,?,?,now(),now())',
            [uuid, nickName, avatarUrl, targetUUID, verifyMessage],
            (err, results) => {
                if (err) {
                    response.send(parserResult([], '请求发送失败', RESPONSE_STATUS_CODE.RESULT_FAILED, err.message))
                } 
                if (results) {
                    response.send(parserResult(results, '请求发送成功'))
                }
            }
        );
    }
}

module.exports = new Contact().resolve();
