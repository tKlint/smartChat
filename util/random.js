/**
 * 生产随机数字字符
 * @param {number} len 长度
 * @param {string} padStr 补偿字符
 * @returns 
 */
const creatRandom = (len, padStr) => {
    const randomNum = Math.floor(Math.random() * Math.pow(10, len));
    return randomNum.toString().padStart(len, padStr);
}

module.exports = {
    creatRandom
}