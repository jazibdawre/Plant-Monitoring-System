const express = require('express');
const bodyParser = require('body-parser');
var request = require('request');
var config = require('../config');

const Limits = require('../models/limits');

const limitsRouter = express.Router();
limitsRouter.use(bodyParser.json());

limitsRouter.route('/')
.get((req,res,next) => {
    Limits.find({})
    .then((limits) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(limits[0]);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    request.post(config.espUrl+'limits', { json: req.body }, function (error, response, body) {
		if (error || response.statusCode != 200) {
			console.log(response.statusCode, error, body);
			res.statusCode = response.statusCode;
			res.setHeader('Content-Type','text/plain');
			res.end(error);
		} else {
			Limits.find({})
			.then((limits) =>{
				if (limits != undefined) {
					Limits.findByIdAndUpdate(limits[0]._id, {
						$set: req.body
					}, {
						new: true
					})
					.then((limits) => {
						res.statusCode = 200;
						res.setHeader('Content-Type','application/json');
						res.json(limits);
					}, (err) => next(err))
					.catch((err) => next(err));
				} else {
					Limits.create(req.body)
					.then((limits) => {
						res.statusCode = 200;
						res.setHeader('Content-Type','application/json');
						res.json(limits);
					}, (err) => next(err))
					.catch((err) => next(err));
				}
			}, (err) => next(err))
			.catch((err) => next(err));
    	}
    });
})
.all((req,res,next) => {
	res.statusCode = 403;
	res.setHeader('Content-Type','text/plain');
	res.end('Method not supported on /limits');
});

module.exports = limitsRouter;