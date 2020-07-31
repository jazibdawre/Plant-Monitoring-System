const express = require('express');
const bodyParser = require('body-parser');
var request = require('request');
var config = require('../config');

const actionRouter = express.Router();
actionRouter.use(bodyParser.json());

actionRouter.route('/')
.post((req, res, next) => {
  request.post(config.espUrl+'action', { json: req.body }, function (error, response, body) {
    if (error || response.statusCode != 200) {
      console.log(error, body);
      res.statusCode = response.statusCode;
      res.send()
    }//Don't respond if ESP doesn't respond. This will cause the GUI to print request object in console for debugging
  });
})
.all((req, res, next) => {
  res.statusCode = 403;
  res.setHeader('Content-Type','text/plain');
  res.end('Method not supported on /actions');
});

module.exports = actionRouter;