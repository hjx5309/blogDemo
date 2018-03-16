'use strict';

var addApiPrefix = require("../public/js/util").addApiPrefix 
var user = require('./user').router

module.exports = function(app){
	app.use('/user',require('./user'));
}
