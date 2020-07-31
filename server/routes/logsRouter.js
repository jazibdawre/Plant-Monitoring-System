const express = require('express');
const Logs = require('../models/logs');

const logsRouter = express.Router();

logsRouter.route('/')
.get((req,res,next) => {
    Logs.find({})
    .then((logs) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(logs[0]);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.all((req,res,next) => {
    res.statusCode = 403;
    res.end('Method not supported on /logs');
});

module.exports = logsRouter;