const db = require("../db/connection.js");

exports.selectTopics = () => {
  return db
  .query(`SELECT * FROM topics;`)
  .then((result) => {
    return result.rows;
  });
};

exports.selectArticles = (sort_by = "created_at",
order = "DESC", topic) => {
let querySQL = 
`SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes,
COUNT(comments.article_id) 
AS comment_count
  FROM articles
  LEFT JOIN comments
  ON articles.article_id = comments.article_id
  GROUP BY articles.article_id`

  const validColumns = [  
  "article_id",
  "title",
  "topic",
  "author",
  "created_at",
  "votes"]

  const validOrder=["asc", "ASC", "desc", "DESC"]

  const queryValues = []


  if (topic !== undefined) {
    querySQL += ` WHERE topic = $1`;
    queryValues.push(topic);
  } 

  if (validColumns.includes(sort_by)) {
    querySQL += ` ORDER BY ${sort_by}`;
    } else {
    return Promise.reject({
        status: 400,
        msg: "Bad Request",
      });
    }

      if (validOrder.includes(order)) {
        querySQL += ` ${order};`;
      } else {
      return Promise.reject({
        status: 400,
        msg: "Bad Request",
      });
    }
  return db
  .query(querySQL, queryValues)
  .then((result) => {
    return result.rows;
  });
}


exports.selectArticlesById = (article_id) => {

let querySQL = 
`SELECT * FROM articles 
WHERE article_id = $1;`

    return db.query(
        querySQL,[article_id])
   .then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject(
                {status: 404, msg: "not found"})
        } else { 
            return rows[0];
        }
   })
}

exports.selectComments = (article_id) => {

    let querySQL = `SELECT * FROM comments 
    WHERE article_id=$1 
    ORDER BY created_at DESC;`

    return db.query( querySQL,[article_id])
    .then(({rows}) => {
         return rows;
        });
      };


exports.addComment = (article_id, username, body) => {


    const input = [article_id, body, username]
        const querySQL = 
            `INSERT INTO comments 
            (article_id, body, author)
             VALUES ($1, $2, $3)
             RETURNING *;`;


        return db
        .query(querySQL, input)
        .then((result) => {
          return result.rows[0];
        });
      };
    
    


