
const RESPONSE_STATUS_CODE = {
    NO_ACCESS: 401,
    MISS_PARAMS: 406,
    INVALID_PARAMS: 407,
    RESULT_FAILED: 403,
    RESULT_SUCCESS: 200
}
const REDIS_CONFIG = {
    EXPIRE_TIME_SECOND: 1 * 60 * 60 * 24 * 7
}

module.exports = {
    RESPONSE_STATUS_CODE,
    REDIS_CONFIG
}