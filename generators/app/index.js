var generators = require("yeoman-generator");
var aspnet = require("generator-aspnet");
module.export = generators.Base.extend({
	init: function() {
		console.log('this is a test');
	}
});