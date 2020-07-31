const express = require('express');
const bodyParser = require('body-parser');

const Latest = require('../models/latest');
const Logs = require('../models/logs');
const Status = require('../models/status');

const espRouter = express.Router();
espRouter.use(bodyParser.json());

espRouter.route('/latest')
.post((req,res,next) => {
    Latest.find({})
    .then((latest) => {
        if (latest != undefined) {
            Latest.findByIdAndUpdate(latest[0]._id, {
                $set: req.body
            }, {
                new: true
            })
            .then((latest) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(latest);
            }, (err) => next(err))
            .catch((err) => next(err));
        } else {
            Latest.create(req.body)
            .then((latest) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(latest);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.all((req, res, next) => {
  res.statusCode = 403;
  res.setHeader('Content-Type','text/plain');
  res.end('Method not supported on /actions');
});

espRouter.route('/status')
.post((req,res,next) => {
    Status.find({})
    .then((status) => {
        if (status != undefined) {
            Status.findByIdAndUpdate(status[0]._id, {
                $set: req.body
            }, {
                new: true
            })
            .then((status) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(status);
            }, (err) => next(err))
            .catch((err) => next(err));
        } else {
            Status.create(req.body)
            .then((status) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(status);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.all((req, res, next) => {
  res.statusCode = 403;
  res.setHeader('Content-Type','text/plain');
  res.end('Method not supported on /actions');
});

espRouter.route('/logs')
.post((req,res,next) => {
    Logs.find({})
    .then((logs) => {
        if (logs != undefined) {
            Logs.findByIdAndUpdate(logs[0]._id, {
                $push: req.body
            }, {
                new: true
            })
            .then((logs) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(logs);
            }, (err) => next(err))
            .catch((err) => next(err));
        } else {
            Logs.create(req.body)
            .then((logs) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(logs);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.all((req, res, next) => {
  res.statusCode = 403;
  res.setHeader('Content-Type','text/plain');
  res.end('Method not supported on /actions');
});

module.exports = espRouter;