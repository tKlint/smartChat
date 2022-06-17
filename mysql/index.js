const mysql = require("mysql")

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '309227217',
    database: "klint",
    port: '3306',
    useConnectionPooling: true,
});

connection.connect();

// function DbQuery(options, values) {
//     let result;
//     let err;
//     connection.query()
// }

module.exports = {
    connection
}


