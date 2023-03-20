/** Database setup for BizTime. */
const {Client} = require('pg');

let DB_URI;

(process.env.NODE_ENV === "test") 
? DB_URI = "postgresql:///users_test" 
: DB_URI = "postgresql:///users";

let db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = db;