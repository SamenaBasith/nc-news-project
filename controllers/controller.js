const {selectTopics, selectArticles} = require("../models/model.js");
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