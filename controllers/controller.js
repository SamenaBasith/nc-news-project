const {removeComment, selectUsers, selectPatchedArticle, addComment, selectComments, selectTopics, selectArticles, selectArticlesById} = require("../models/model.js");
const app = require('../app.js')
const { checkTopicExists } = require("../checkTopicExistFunc.js");

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
    const { sort_by, order_by, topic } = req.query;
    
    const promises = [checkTopicExists(topic),
        selectArticles(topic, sort_by, order_by)]

    Promise.all(promises)
    .then(([topic_exists, articles]) => {
        res.status(200).send({articles})
    })
    .catch((err) => {
        next(err)
    })

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
        .then((newComment) => {
          res.status(201).send({ newComment });
        })
        .catch((err) => {
          next(err);
        });
    };

    exports.patchArticle = (req, res, next) => {
  
    
      const {article_id} = req.params;
      const { inc_votes } = req.body;
  
    selectPatchedArticle(article_id, inc_votes)
        .then((updatedArticle) => {
          res.status(202).send({ updatedArticle });
        })

      
        .catch((err) => {
          next(err);
        });
    };

    exports.getUsers = (req, res) => {

      selectUsers()
      .then((users) => {
        res.status(200).send({ users });
        })
      
    };
    
    
       
    exports.deleteComment = (req, res, next) => {
      const { comment_id } = req.params;

      removeComment(comment_id)
        .then(() => {
          res.status(204).send();
        })
        .catch((err) => {
          next(err);
        });
    };