const { getTopics, getApi } = require("./controllers/controller.js");
const express = require("express");
const app = express();

app.get("/api", getApi);
app.get("/api/topics", getTopics);




//error handling
//404
app.all("*", (req, res) => {
    res.status(404).send({ msg: 'invalid path' });
  });

  module.exports= app;