const db = require("../db/connection.js");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics;`).then((result) => {
    return result.rows;
  });
};

exports.selectArticles = (topic, sort_by = "created_at", order_by = "DESC") => {
  const validOrder = ["desc", "asc", "DESC", "ASC"];
  const validColumns = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "comment_count"
  ];

  let querySQL = `SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes,
COUNT(comments.article_id) 
AS comment_count
  FROM articles
  LEFT JOIN comments
  ON articles.article_id = comments.article_id `;

  let queryValues = [];

  if (!validOrder.includes(order_by)) {
    return Promise.reject(
      { status: 400, msg: "Bad Request" });
  }

  if (!validColumns.includes(sort_by)) {
    return Promise.reject(
      { status: 400, msg: "Bad Request" });
  }

  if (topic !== undefined) {
    querySQL += `WHERE topic = $1 `;
    queryValues.push(topic);
  }
  querySQL += `GROUP BY articles.article_id
  ORDER BY ${sort_by} ${order_by};`;

  return db.query(querySQL, queryValues)
  .then((result) => {
    return result.rows;
  });
};

exports.selectArticlesById = (article_id) => {
  let querySQL = `SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, articles.body,
COUNT(comments.comment_id)
AS comment_count
FROM articles
LEFT JOIN
comments
USING(article_id)
WHERE article_id = $1
GROUP BY articles.article_id`;

  return db.query(querySQL, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "not found" });
    } else {
      return rows[0];
    }
  });
};

exports.selectComments = (article_id) => {
  let querySQL = `SELECT * FROM comments 
    WHERE article_id=$1 
    ORDER BY created_at DESC;`;

  return db.query(querySQL, [article_id]).then(({ rows }) => {
    return rows;
  });
};

exports.addComment = (article_id, username, body) => {
  const input = [article_id, body, username];
  const querySQL = `INSERT INTO comments 
            (article_id, body, author)
             VALUES ($1, $2, $3)
             RETURNING *;`;

  return db.query(querySQL, input).then((result) => {
    return result.rows[0];
  });
};

exports.selectPatchedArticle = (article_id, inc_votes) => {
  const updatedVote = [inc_votes, article_id];
  const querySQL = `
              UPDATE articles 
              SET votes = votes + $1 
              WHERE article_id = $2 
              RETURNING *;`;

  return db.query(querySQL, updatedVote).then((result) => {
    if (result.rowCount === 0) {
      return Promise.reject({ status: 404, msg: "not found" });
    }
    return result.rows[0];
  });
};

exports.selectUsers = () => {
  return db.query(`SELECT * FROM users;`).then((result) => {
    return result.rows;
  });
};

exports.removeComment = (comment_id) => {
  querySQL = `DELETE FROM comments 
        WHERE comment_id = $1 
        RETURNING *;`;

  const queryValue = [comment_id];

  return db.query(querySQL, queryValue).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "not found" });
    }
    return rows;
  });
};
