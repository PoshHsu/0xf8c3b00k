var https = require('https');

var USERCONFIG = require('./config.js').user_config();

var error = function(data) {
  console.log(JSON.stringify(data));
};

var listAlbum = function(data) {
  if (data.hasOwnProperty('data')) {
    var d = data['data'];
    d.forEach(function(v) {
      console.log('%d - %s', v.id, v.name);
    });
  } else if (data.hasOwnProperty('error')) {
    // Print error message
    console.log('Error!');
    console.log('Message: %s', data.error.message);
  } else {
    console.log('error');
  }
  process.exit(0);
};

var getUserAlbum = exports.getUserAlbum = function(success_callback,
                                                   failure_callback) {
  var url = "https://graph.facebook.com/me/albums?access_token="
    + USERCONFIG['fb_auth_token'];

  var opt = {
    host: 'graph.facebook.com',
    path: '/me/albums?access_token=' + USERCONFIG['fb_auth_token']
  };

  https.get(opt, function(resp) {
    var jsonData = '';
    var cb;
    if (resp.statusCode == 200) {
      cb = success_callback;
    } else {
      cb = failure_callback;
    }
    resp.on('data', function(d) {
      jsonData = jsonData + d.toString('utf8');
    });
    resp.on('end', function() {
      cb(JSON.parse(jsonData));
    });
  });
};

exports.run = function(progOpt, cmdArg) {
  if (cmdArg.length == 0) {
    getUserAlbum(listAlbum, error);
  }
};