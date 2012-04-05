var https = require('https');
var http = require('http');
var crypto = require('crypto');
var USERCONFIG = require('./config.js').user_config();

var fieldMapper = {
  'message' : 'message'
};

// Make a multipart boundary.
var makeBoundary = function() {
  var hash = crypto.createHash('sha1');
  hash.update(Date.now() + '');
  return '----' + hash.digest('base64');
}

var makePostData = function(cfg) {
  var kvp = [];
  if (cfg.hasOwnProperty('message')) {
    kvp.push('message='+encodeURIComponent(cfg['message']));
  }
  return kvp.join('&');
}

var uploadStdin = function(config) {

  var uploadPath = !config.hasOwnProperty('albumId') ?
    '/me/photos' : '/' + config['albumId'] + '/photos';

  var multipartBoundary = makeBoundary();

  var options = {
    host: 'graph.facebook.com',
    port: 443,
    path: uploadPath + '?access_token=' + USERCONFIG['fb_auth_token'],
    headers: {
      'Content-Type' : 'multipart/form-data; boundary=' + multipartBoundary
    },
    method: 'POST'
  };

  // Build request and handle response.
  var req = https.request(options, function(resp) {
    var success = false;
    if (resp.statusCode == 200) {
      console.log('Photo uploaded successfully');
      success = true;
    } else {
      console.log('Fail to upload photo, status code = ' + resp.statusCode);
      success = false;
    }

    // Print response data. Then end the process.
    resp.on('data', function(d) {
      if (success) {
        var j = JSON.parse(d.toString('ascii'));
        console.log('Photo ID: ' + j.id);
        console.log('Post ID: ' + j.post_id);
      } else {
        // Handle error.
        console.log(d.toString('ascii'));
      }
    });

    resp.on('end', function() {
      process.exit(0);
    });
  });

  // Send data section.
  Object.keys(config).forEach(function(v) {
    if (fieldMapper.hasOwnProperty(v)) {
      req.write('--' + multipartBoundary + '\r\n');
      req.write('Content-Disposition: form-data; name="' + fieldMapper[v] + '"\r\n');
      req.write('\r\n');
      req.write(config[v]);
      req.write('\r\n');
    }
  });

  // Here we start to redirect data to server.
  req.write('--' + multipartBoundary + '\r\n');
  req.write('Content-Disposition: form-data; name="image"; filename="1.jpg"\r\n');
  req.write('Content-Type: image/jpeg\r\n');
  req.write('\r\n');

  // Read from stdin until reach end.
  process.stdin.resume();
  process.stdin.on('data', function(d) {
    req.write(d);
  });
  process.stdin.on('end', function() {
    req.write('\r\n--' + multipartBoundary + '--\r\n');
    req.end();
  });
};

exports.run = function(progOpt, cmdArgs) {
  var expecting = 'key';
  var key = ''
  var parsed = {};
  for (var i = 0; i < cmdArgs.length; ++i) {
    if (expecting == 'key') {
      expecting = 'value';
      key = cmdArgs[i];
    } else {
      // If this key expects value.
      if ((key == '--albumId')
          || (key == '--msg')
          || (key == '-m')) {
        parsed[key] = cmdArgs[i];
        expecting = 'key';
      } else {
        parsed[key] = '';
        key = cmdArgs[i];
      }
    }
  }

  var cfg = {};
  Object.keys(parsed).forEach(function(v) {
    if (v == '--album') {
      cfg['albumId'] = parsed[v];
    } else if (v == '--msg' || v == '-m') {
      cfg['message'] = parsed[v];
    }
  });

  uploadStdin(cfg);
}