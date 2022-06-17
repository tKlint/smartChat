const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    service: 'qq',
    secure: true,
    auth: {
        user: '309227217@qq.com',
        pass: 'uuhkyezfgbukbjeg'
    }
})

/**
 * 
 * @param {string} to 接收邮箱
 * @param { { from?: string, subject?: string, text: string } } options 配置
 */
const sendMail = (to, options) => {
    const { from = 'klint', subject = '邮件通知', text } = options;
    const mailOptions = {
        // from: {
        //     name: 'klint',
        //     address: '309227217@qq.com'
        // },
        from: '"klint" <309227217@qq.com>',
        to,
        subject,
        text,
        /**
        html,
        attachments: []
         */
    }
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        })
    })
}

module.exports = {
    sendMail
}