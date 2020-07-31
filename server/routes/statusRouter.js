const express = require('express');
const Status = require('../models/status');

const statusRouter = express.Router();

statusRouter.route('/')
.get((req,res,next) => {
    Status.find({})
    .then((status) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(status[0]);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.all((req,res,next) => {
    res.statusCode = 403;
    res.end('Method not supported on /status');
});

module.exports = statusRouter;