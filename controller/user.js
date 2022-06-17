const BaseController = require('../libs/BaseController');
const uuid = require('uuid');

const { getKey, setValue, delKey } = require('../redis/index');
const { parserResult } = require('../util/responseParser');
const { RESPONSE_STATUS_CODE } = require('../config');
const { sendMail } = require('../util/mail');
const { creatRandom } = require('../util/random');
const { matchEmial } = require('../util/regExp');
const moment = require('moment');
const { connection } = require('../mysql');

class User extends BaseController {

    mockUser = [
        {
            id: 0,
            uuid: '3ac2dad3dawx2289d',
            account: '123456',
            password: '123456',
            activeStatus: 0,
            nickName: '大咩',
            avatarUrl: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fgss0.baidu.com%2F-4o3dSag_xI4khGko9WTAnF6hhy%2Fzhidao%2Fpic%2Fitem%2F9f510fb30f2442a7f58b73ffd043ad4bd01302e6.jpg&refer=http%3A%2F%2Fgss0.baidu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1657704788&t=aed36925fd67af355e1896f87eddba1a',
        }, {
            id: 1,
            uuid: '3ac2dad3dawx2289d',
            account: '654321',
            password: '654321',
            activeStatus: 0,
            nickName: 'bigine',
            avatarUrl: '',
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
            let userSql = "SELECT `uuid`, `account`, `nick_name` as nickName, `avatar_url` as avatarUrl FROM `user_info` WHERE `account` = ? AND password = ? LIMIT 0, 1";
            if (account.endsWith('.com')) {
                userSql = "SELECT `uuid`, `account`, `nick_name` as nickName, `avatar_url` as avatarUrl FROM `user_info` WHERE `email` ='" + account +  "' AND password = '" + password + "' LIMIT 0, 1";
            }
            let userValue = [account, password];
            connection.query(userSql, [], function (error, results, fields) {
                if (results) {
                    const accessToken = uuid.v1();
                    setValue(accessToken, JSON.stringify(results[0]), 604800);
                    response.send(parserResult({accessToken}, '登陆成功', RESPONSE_STATUS_CODE.RESULT_SUCCESS, ));
                } else {
                    response.send(parserResult([], '账号或密码错误', RESPONSE_STATUS_CODE.RESULT_FAILED));
                }
            });
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
        } else {
            return response.send(parserResult([], '参数错误', RESPONSE_STATUS_CODE.INVALID_PARAMS, '不被允许的登录方式'));
        }
    }
    /**
     * 登录
     * @param {Request} request 
     * @param {Response} response 
     */
    async sendCapcha (request, response) {
        const { email } = request.body;
        const captcha = creatRandom(4, '0');
        if (!email) {
            return response.send(parserResult([], '缺少必要参数', RESPONSE_STATUS_CODE.MISS_PARAMS));
        }
        
        if(!matchEmial(email)) {
            return response.send(parserResult([], '邮箱格式不正确', RESPONSE_STATUS_CODE.INVALID_PARAMS));
        }
        

        sendMail(email, {
            subject: '邮箱验证, 60秒内有效',
            text: `您的验证码为: ${captcha}, 请勿透露给他人`
        })
            .then( async () => {
                setValue(`${email}-register-captcha`, captcha, 3000);
                const targetCaptcha = await getKey(`${email}-register-captcha`);

                response.send(parserResult([], `发生成功, 注意查收`, RESPONSE_STATUS_CODE.RESULT_SUCCESS));
            })
            .catch(err => {
                response.send(parserResult([], '发送失败', RESPONSE_STATUS_CODE.RESULT_FAILED, err.message));
            });
        
    }

     /**
     * 注册
     * @param {Request} request 
     * @param {Response} response 
     */
    async register(request, response) {
        const { password, nickName, email, captcha } = request.body;
        if (!password || !nickName || !email || !captcha) {
            return response.send(parserResult([], '缺少必要参数', RESPONSE_STATUS_CODE.MISS_PARAMS));
        }
        const targetCaptcha = await getKey(`${email}-register-captcha`);
        if (targetCaptcha !== captcha) {
            return response.send(parserResult([], '验证码输入错误, 或者已过期', RESPONSE_STATUS_CODE.RESULT_FAILED));
        }

        const isExistenceEmailSql = "SELECT `id` FROM user_info WHERE email = ? LIMIT 0, 1";
        const isExistenceEmailOptions = [email];
        // connection.query(isExistenceEmailSql, isExistenceEmailOptions, (err, result) => {
        //     if (err) {
        //         response.send(parserResult([], '未知的异常', RESPONSE_STATUS_CODE.RESULT_FAILED, '访问数据库失败'));
        //     }
        //     if (result && result.length > 0) {
        //         response.send(parserResult([], '邮箱已经存在', RESPONSE_STATUS_CODE.RESULT_FAILED, '不可重复创建账号'));
        //     }
        // });

        const emialArr = `${email}`.split('@');
        const account = emialArr[1] + '-' + emialArr[0];
        const uniId = uuid.v1();
        const defaultAvatar = "https://randomuser.me/api/portraits/women/53.jpg";
        const createUerSql = "INSERT INTO user_info(uuid, nick_name, avatar_url, account, email, creat_date, password) VALUES(?,?,?,?,?,?,?)";
        const nowDate  = moment().format('YYYY-MM-DD hh:mm:ss');
        const createUserptions = [uniId, nickName, defaultAvatar, account, email, nowDate, password];
        connection.query(createUerSql, createUserptions, (err, result) => {
            if (err) {
                response.send(parserResult([], '注册失败', RESPONSE_STATUS_CODE.RESULT_FAILED, err.message));
            } else {
                delKey(`${email}-register-captcha`);
                response.send(parserResult({ account, result }, '注册成功可使用账号/邮箱登陆'));
            }
        });
    }
     /**
     * 登录
     * @param {Request} request 
     * @param {Response} response 
     */
    async getUerInfo(request, response) {
        const accessToken = request.headers['access-token'];
        const currentUser = await getKey(accessToken);
        return response.send(parserResult([JSON.parse(currentUser)], '用户查询成功'));
    }
}


module.exports = new User().resolve();