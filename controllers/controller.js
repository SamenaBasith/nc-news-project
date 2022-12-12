const {selectTopics} = require("../models/model.js");
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