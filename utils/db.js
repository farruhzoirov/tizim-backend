import mysql from 'mysql2'

const pool = mysql.createPool({
    host: "localhost", // You can also use "127.0.0.1"
    user: "root", // Your MySQL username
    database: "learning-center", // Your database name
    password: "farruh0911" // Your MySQL password
});



export default pool.promise();