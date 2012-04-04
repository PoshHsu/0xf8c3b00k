var https = require('https');
var http = require('http');
var crypto = require('crypto');
var USERCONFIG = require('./config.js').user_config();

// Make a multipart boundary.
var makeBoundary = function() {
  var hash = crypto.createHash('sha1');
  hash.update(Date.now() + '');
  return '----' + hash.digest('base64');
}

var uploadStdin = function(albumId) {

  var uploadPath = (albumId === undefined) ? '/me/photos' : '/'+albumId+'/photos';

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

  // Here we start to redirect data to server.
  req.write('--' + multipartBoundary + '\r\n');
  req.write('Content-Disposition: form-data; name="picture"; filename="1.jpg"\r\n');
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
  uploadStdin();
}