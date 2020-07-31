const express = require('express');
const Latest = require('../models/latest');

const latestRouter = express.Router();

latestRouter.route('/')
.get((req,res,next) => {
    Latest.find({})
    .then((latest) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(latest[0]);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.all((req,res,next) => {
    res.statusCode = 403;
    res.end('Method not supported on /latest');
});

module.exports = latestRouter;