const express = require('express');
const bodyParser = require('body-parser');
var request = require('request');
var config = require('../config');

const Settings = require('../models/settings');

const settingsRouter = express.Router();
settingsRouter.use(bodyParser.json());

settingsRouter.route('/')
.get((req,res,next) => {
    Settings.find({})
    .then((settings) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(settings[0]);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    request.post(config.espUrl+'settings', { json: req.body }, function (error, response, body) {
		if (error || response.statusCode != 200) {
			console.log(response.statusCode, error, body);
			res.statusCode = response.statusCode;
			res.setHeader('Content-Type','text/plain');
			res.end(error);
		} else {
			Settings.find({})
			.then((settings) => {
				if (settings != undefined) {
					Settings.findByIdAndUpdate(settings[0]._id, {
						$set: req.body
					}, {
						new: true
					})
					.then((setting) => {
						res.statusCode = 200;
						res.setHeader('Content-Type','application/json');
						res.json(setting);
					}, (err) => next(err))
					.catch((err) => next(err));
				} else {
					Settings.create(req.body)
					.then((setting) => {
						res.statusCode = 200;
						res.setHeader('Content-Type','application/json');
						res.json(setting);
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
	res.end('Method not supported on /settings');
});

module.exports = settingsRouter;