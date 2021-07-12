
/**
 * 解码x-www-form-urlencoded
 */
const deCodeFormUrl = (url) => {
    const chatAtIdx = url.indexOf('?');
    const queryString = url.substring(chatAtIdx + 1);
    const queryGroup = queryString.split('&');
    const formUrlObject = {};
    queryGroup.forEach(item => {
        const keyToValues = item.split("=");
        formUrlObject[keyToValues[0]] = keyToValues[1];
    });
    return formUrlObject;
}

module.exports = { deCodeFormUrl }
