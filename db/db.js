const pg = require('pg');
const fs = require('fs');
const client = new pg.Client({
    connectionString: process.env.DB_URI,
    port: 5432,
    ssl:true
    
})
const setupDBScript = fs.readFileSync('db/database.sql', { encoding: 'utf8' });

client.connect().then((x) => {
    console.log("connected to psql")
    setupDB()   
}).catch((err) => {
    console.log("err:", err)
})


module.exports = {
    client
}

setupDB = async function () {
    try {
        let result = await client.query(
            setupDBScript
        )
        console.log("succesfully ran script for creating table for comments")
        return result
    } catch (err) {
        console.log(err)
    }
}

