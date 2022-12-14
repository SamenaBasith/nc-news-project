const { patchArticle, postComment,getComments,getArticlesById,getArticles,getTopics, getApi } = require("./controllers/controller.js");
const express = require("express");
const app = express();


//endpoints
app.get("/api", getApi);
app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles)
app.get("/api/articles/:article_id", getArticlesById);
app.get("/api/articles/:article_id/comments", getComments);

app.use(express.json());
app.post("/api/articles/:article_id/comments", postComment)
app.patch("/api/articles/:article_id", patchArticle);

//error handling 404
app.all("*", (req, res) => {
    res.status(404).send({ msg: "not found" });
  });


//error handling middleware chain starts here:
  app.use((err,req,res,next) => {
    if (err.code === '22P02') {
        res.status(400).send({msg: "Bad Request: invalid input"})
    } else if (err.code === '23503') {
            res.status(404).send({msg:"not found"})
    } else if (err.code === '23502') {
        res.status(400).send({msg: "Bad request: no input"})
    } else {
        next(err)
    }
})

  app.use((err, req, res, next) => {
    if (err.msg && err.status) {
      res.status(err.status).send({ msg: err.msg });
    } else {
      next(err);
    }
  });
  
  app.use((err, req, res, next) => {
    console.log(err, "error");
    res.status(500).send({ msg: "internal servor error" });
  });

  module.exports = app;