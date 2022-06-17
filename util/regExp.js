/**
 * 验证邮箱格式
 * @param {string} mail 邮件
 * @returns 
 */
function matchEmial(mail) {
    const mailPattern = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;
    return mailPattern.test(mail);
}

module.exports = {
    matchEmial
}