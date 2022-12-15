exports.errorHandler404 = (req, res) => {
    res.status(404).send({ msg: "not found" });
  };


  exports.customErrorHandler = (err, req, res, next) => {
    if (err.msg && err.status) {
      res.status(err.status).send({ msg: err.msg });
    } else {
      next(err);
    }
  };


exports.PSQLErrorHandler = ((err,req,res,next) => {
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

exports.errorHandler500 = (err, req, res, next) => {
    console.log(err, "error");
    res.status(500).send({ msg: "internal servor error" });
  };