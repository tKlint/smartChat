const BaseController = require('../libs/BaseController');
const uuid = require('uuid');

const { getKey, setValue } = require('../redis/index');
const { parserResult } = require('../util/responseParser');
const { RESPONSE_STATUS_CODE } = require('../config');
class User extends BaseController {

    mockUser = [
        {
            id: 0,
            uuid: '3ac2dad3dawx2289d',
            account: '123456',
            password: '123456',
            active_status: 0,
            nick_name: '大咩',
            avatar_url: '',
        }, {
            id: 1,
            uuid: '3ac2dad3dawx2289d',
            account: '654321',
            password: '654321',
            active_status: 0,
            nick_name: 'bigine',
            avatar_url: '',
        }
    ];

    /**
     * 登录
     * @param {Request} request 
     * @param {Response} response 
     */
    async login(request, response) {
        const { loginType, password, account, email, captcha } = request.body;
        if (loginType === 'account') {
            if (!account || !password) {
                return response.send(parserResult([], '缺少必要参数', RESPONSE_STATUS_CODE.MISS_PARAMS));
            }
            /** SELECT id FROM USER WHERE account = ? AND password = ? LIMIT 0, 1 */
            const currentUser = this.mockUser.find(item => item.account === account && item.password === password);
            if (!currentUser) {
                return response.send(parserResult([], '账号或密码错误', RESPONSE_STATUS_CODE.RESULT_FAILED));
            }
            const accessToken = uuid.v1();
            setValue(accessToken, currentUser);
            response.send(parserResult({
                accessToken,
            }, '登录成功'));
        } else if (loginType === 'email') {
            if (!email || !captcha) {
                return response.send(parserResult([], '缺少必要参数', RESPONSE_STATUS_CODE.MISS_PARAMS));
            }

            if (captcha !== await getKey(`${email}-captcha`)) {
                return response.send(parserResult([], '验证码输入错误', RESPONSE_STATUS_CODE.RESULT_FAILED));
            }

            /** SELECT id FROM USER WHERE account = ? AND password = ? LIMIT 0, 1 */
            const currentUser = this.mockUser.find(item => item.email === email);
            if (!currentUser) {
                return response.send(parserResult([], '邮箱不存在', RESPONSE_STATUS_CODE.RESULT_FAILED));
            }
            const accessToken = uuid.v1();
            setValue(accessToken, currentUser);
            return response.send(parserResult({
                accessToken,
            }, '登录成功'));
        }
        return response.send(parserResult([], '参数错误', RESPONSE_STATUS_CODE.INVALID_PARAMS, '不被允许的登录方式'));
    }
    async register() {

    }
}


module.exports = new User().resolve();