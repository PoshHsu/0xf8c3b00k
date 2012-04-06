var fs = require('fs');
var path = require('path');

var HOME = function() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};

var app_cfg = {
  // Path name that can be opened by browser.
  'fb_authclient_pathname' : '/authclient',

  // Server side path to the file that contains html data to request a fb
  // token.
  'fb_authclient_servpath' : './oauth_page.html',

  // Facebook app id.
  'fb_client_id' : '370477596318204',

  'fb_auth_scope' : [
    'user_photos',
    'publish_stream',
    'friends_photos'
  ],

  // Default configure file name
  'default_config_file' : HOME() + '/.0xfb',

  // Available program options
  // 'option name' : (true if it has a value)
  // Ex: 
  // If you expect user to type "-p 60"
  // you should set 
  //   '-p' : true
  'program_options' : {
    '--website' : true,  // Example
    '--silence' : false
  }

};

var user_cfg_name;

var user_cfg;

var loadUserConfig = function(filename) {

  // As configure file is small, we use readfileSync()
  user_cfg_name = path.normalize(filename || app_cfg['default_config_file']);

  // Write back config to file when process is going to exit.
  process.on('exit', function() {
    var raw_data = JSON.stringify(user_cfg);

    // Touch file.
    fs.closeSync(fs.openSync(user_cfg_name, 'w'));

    // Write file.
    fs.writeFileSync(user_cfg_name, raw_data);
  });

  // Read file.
  try {
    var raw_data = fs.readFileSync(user_cfg_name);
    return JSON.parse(raw_data);
  } catch (e) {
    // Fail to open configure file(may be file not exists or fail to
    // parse the file. Return empty data.
    return {};
  }
}

exports.app_config = function() {
  return app_cfg;
}

exports.user_config = function(filename) {
  user_cfg = user_cfg || loadUserConfig(filename);
  return user_cfg;
}