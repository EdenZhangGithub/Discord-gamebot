import dotenv from "dotenv"
import mysql from "mysql"

dotenv.config();

const connection = mysql.createPool({
	host     :  process.env.MYSQL_HOST,
	user     : 'root',
	password : 'secret',
	database : 'botdb'
});

export default connection;