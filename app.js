const { patchArticle, postComment,getComments,getArticlesById,getArticles,getTopics, getApi } = require("./controllers/controller.js");
const express = require("express");
const { PSQLErrorHandler, errorHandler404, customErrorHandler, errorHandler500} = require("./controllers/errors.controllers.js");
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
app.all("*", errorHandler404)

//error handling middleware chain starts here:
  app.use(PSQLErrorHandler)

  app.use(customErrorHandler)
  
  app.use(errorHandler500)

  module.exports = app;