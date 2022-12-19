const db = require("./db/connection.js");



exports.checkTopicExists = (topic) => {

    let querySQL = 
    `SELECT * FROM topics
    WHERE slug = $1;`

    let queryValues = [topic]

    if (topic === undefined) 
    return Promise.resolve(true)
    else {
        return db.query(querySQL, queryValues)
        .then(({rowCount}) => {
            if (rowCount === 0) {
                return Promise.reject(
                    {status:404, msg: "not found"})
            } else {
                return true
            }
        })
    }
}