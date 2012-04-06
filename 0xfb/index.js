#! /usr/bin/env node

// Command format:
// ./0xfb [Program option] <Command> [Command argument]


var CONFIG = require('./config.js').app_config();

// prog_command:
// Map command to module that run the command.
// Each module must has run() function. And the first argument of this
// function would be program option, while the second one would be
// command argument. Move to ./config.js ?
var progCommand = {
  // Update photo
  'uploadphoto' : './upload_photo.js',
  'album' : './album.js'
};

// It is a chance for program to make global setting before and command
// is issued. Command will be executed right after this step.
var handleSetting = function(progOpt, command, cmdArg) {
  // So far it's empty XD.
}

// Parse command line, collect program option, command, command argrment.
var initRun = function() {

  var program_option = [];
  var command = '';
  var command_argument = [];

  // [TODO Patrick] Here I assume there is no program options, so we just
  // use that first argument as command

  command = process.argv[2];
  command_argument = process.argv.slice(3);

  if (!progCommand.hasOwnProperty(command)) {
    // Invalid command.
    process.exit(1);
  }

  handleSetting(program_option, command, command_argument);

  // Go
  require(progCommand[command]).run(program_option, command_argument);
}

// *** Start with fetching access token ***
var fbOauthClient = require('./fb_oauth_client.js');
fbOauthClient.getAuthToken(function(access_token, expires) {
// console.log(" Access token: %s", access_token);
// console.log(" Expire Time: %d, now: %d", expires, parseInt(Date.now()/1000));

  initRun();
});