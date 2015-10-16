var generators = require('yeoman-generator');
var yosay = require('yosay');
var path = require('path');
var dir = require('node-dir');
var ghauth = require('ghauth');
var GitHubApi = require('github');
var github = new GitHubApi({
	version: '3.0.0',
	protocal: 'https',
	host: 'api.github.com',
	headers: {
		'user-agent': 'umbraco-project-generator'
	}
});

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
	},
	setProjectType: function() {
		var prompts = [{
			type: 'list',
			name: 'type',
			message: 'What type of application do you want to create?',
			choices: [{
				name: 'Empty Application',
				value: 'empty'
			}, {
				name: 'Umbraco Application',
				value: 'umbraco'
			}]
		}];
		var done = this.async();
		this.prompt(prompts, function(props) {
			this.data.type = props.type;
			done();
		}.bind(this));
	},
	initProject: function() {
		this.sourceRoot(path.join(__dirname, '../../templates/projects'));
		dir.files(this.sourceRoot() + '/shared', function(err, files) {
			for (var i=0; i<files.length; i++) {
			this.fs.copyTpl(files[i], this)
			}
		}.bind(this))
		switch(this.data.type) {
			case 'empty':
				break;
			case 'umbraco':
				break;
		}
	}
});