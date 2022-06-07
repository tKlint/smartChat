const { RESPONSE_STATUS_CODE } = require("../config")

function parserResult (data, message = '', code = RESPONSE_STATUS_CODE.RESULT_SUCCESS, subMessage = '', subCode = 0) {
    return {
        code,
        message,
        subMessage,
        subCode,
        data
    }
}
module.exports = {
    parserResult
}