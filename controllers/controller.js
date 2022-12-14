const {addComment, selectComments, selectTopics, selectArticles, selectArticlesById} = require("../models/model.js");
const app = require('../app.js')

exports.getApi = (req, res) => {
    res.status(200).send({ msg: "success" });
  };

  exports.getTopics = (req, res, next) => {
    selectTopics()
    .then((topics) => {
        res.status(200).send({ topics });
    })
  }

  exports.getArticles = (req, res, next) => {
    const { sort_by, order, topic } = req.query;
    selectArticles(sort_by, order, topic )
    .then((articles) => {
        res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err)
    });
  }

  exports.getArticlesById = (req, res, next) => {
    const { article_id } = req.params;
    selectArticlesById(article_id)
      .then((article) => {
        res.status(200).send({ article });
      })
      .catch((err) => {
        next(err);
      });
    }


    exports.getComments = (req, res, next) => {
      const { article_id } = req.params;
      const promises = [selectComments(article_id), selectArticlesById(article_id)];

      Promise.all(promises)
        .then((results) => {
          res.status(200).send({ comments: results[0]});
        })
        .catch((err) => {
          next(err);
        });
    };

    exports.postComment = (req,res,next)=>{
      const {article_id} = req.params;
      const {username, body} = req.body;
 

      addComment(article_id, username,body)
        .then((newComment)=>{
          res.status(201).send({newComment});
        })
        .catch((err)=>{
          next(err);
        });
    };


    