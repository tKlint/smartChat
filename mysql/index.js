const mysql = require("mysql")

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '309227217',
    database: "klint",
    port: '3306',
    useConnectionPooling: true,
});
try {
    connection.connect();
} catch (error) {
    console.log('⚠️⚠️⚠️: MYSQL链接失败,确保服务已启动🔗');
    console.log(error.msg);
}

// function DbQuery(options, values) {
//     let result;
//     let err;
//     connection.query()
// }

module.exports = {
    connection
}


