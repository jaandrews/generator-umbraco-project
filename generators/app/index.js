var generators = require('yeoman-generator');
var aspnet = require('generator-aspnet');
var yosay = require('yosay');
var ghauth = require('ghauth');
var GitHubApi = require('github');
var github = new GitHubApi({
	version: '3.0.0',
	protocal: 'https',
	host: 'api.github.com',
	headers: {
		'user-agent': 'umbraco-project-generator'
	}
})

module.exports = generators.Base.extend({
	init: function() {
		this.log(yosay('Welcome to the Umbraco Generator.'));
		this.data = {};
		var done = this.async();
		this.prompt({
			type: 'input',
			name: 'projectName',
			message: 'What is the name of your new project?'
		}, function(answers) {
			this.data.project = {
				name: answers.projectName
			};
			done();
		}.bind(this));
	},
	azure: function() {
		
	},
	github: function() {
		var done = this.async();
		this.prompt([
			{
				type: 'confirm',
				name: 'isOrganization',
				message: 'Is this repository for an organization?',
				default: false
			},
			{
				type: 'input',
				name: 'organizationName',
				message: 'What is the name of the organization?',
				when: function(answers) {
					return answers.isOrganization;
				},
				store: true
			},
			{
				type: 'confirm',
				name: 'isPrivate',
				message: 'Will it be a private repository?',
				default: false
			}
		], function(answers) {
			this.data.github = answers;
			ghauth({
				configName: 'umbraco-project-generator',
				scopes: ['repo']
			}, function(err, auth) {
				github.authenticate({
					type: 'oauth',
					token: auth.token
				});
				var method = answers.isOrganization ? 'createFromOrg' : 'create';
				var data = {
					name: this.data.project.name,
					private: answers.isPrivate
				};
				if (answers.isOrganization)
					data.org = answers.organizationName;
				github.repos[method](data, function(err, response) {
					if (err) throw err;
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this))
	}
	// gitHubType: function() {
	// 	var done = this.async();
	// 	this.prompt({
	// 		type: 'confirm',
	// 		name: 'isOrganizationRepo',
	// 		message: 'Is this repository for an organization?',
	// 		default: false
	// 	}, function(isOrganization) {
	// 		this.data.github = {
	// 			isOrganization: isOrganization
	// 		};
	// 		console.log(isOrganization);
	// 		done();
	// 	}.bind(this));
	// },
	// gitHubOrganization: function() {
	// 	var done = this.async();
	// 	this.prompt({
	// 		type: 'confirm',
	// 		name: 'isOrganizationRepo',
	// 		message: 'Is this repository for an organization?',
	// 		default: false
	// 	}, function(isOrganization) {
	// 		this.data.github = {
	// 			isOrganization: isOrganization
	// 		};
	// 		console.log(isOrganization);
	// 		done();
	// 	}.bind(this));
	// },
	// gitHubAccess: function() {
	// 	var done = this.async();
	// 	this.prompt({
	// 		type: 'confirm',
	// 		name: 'githubAccess',
	// 		message: 'Will it be a private repository?',
	// 		default: false
	// 	}, function(githubAccess) {
	// 		this.data.github.isPrivate = githubAccess;
	// 		done();
	// 	}.bind(this));
	// },
});