const db = require("./db/connection.js");


exports.checkTopicExists = (topic) => {
    let querySQL = `SELECT * FROM topics
    WHERE slug = $1;`
    let queryValues = [topic]

    if(topic === undefined){
        return Promise.resolve("success")
    }

return db.query(querySQL, queryValues)
.then ((result) => {
   
   
    if (!result.rowCount){
        return Promise.reject({status:404, msg: "not found"})
    }
    return result.rows
    })
    
}



    