var http = require('http');
var url = require('url');
var CONFIG = require('./config.js').app_config();

var success_cb;
var failure_cb;

var httpServer = http.createServer(
  function(request, response) {
    var req_info = url.parse(request.url, true);
    var query = req_info.query;

    if (req_info.pathname == CONFIG['fb_authclient_pathname']) {
      // First connention, write client page to user's browser.
      require('fs').readFile(
        CONFIG['fb_authclient_servpath'],
        function(err, data) {
          response.statusCode = 200;
          response.write(data);
          response.end();
        }
      );
    } else if (query.hasOwnProperty('access_token')
               && query.hasOwnProperty('expires_in')) {
      // Client returns data to us.
      // *** HERE WE GOT ACCESS TOKEN ***
      response.end();
      httpServer.close();

      success_cb(query['access_token'], query['expires_in']);
    } else if (req_info.pathname == "/") {
      // Root, redirect to auth_page.
      response.statusCode = 301;
      response.setHeader('Location',
                         CONFIG['fb_authclient_pathname']
                         + "#client_id=" + CONFIG['fb_client_id']
                         + "&scope=" + CONFIG['fb_auth_scope'].join(','));
      response.end();
    } else {
      // Error, return 404
      response.statusCode = 404;
      response.end();
    }
  }
);

var getTokenWithUsersHelp = function(success_callback,
                                     failure_callback) {
  success_cb = success_callback;
  failure_cb = failure_callback;

  httpServer.listen(40680);

  // Inform user to open browser.
  console.log("Use browser to open: ");
  console.log("  http://localhost:40680/");
}

exports.getAuthToken = function(success_callback,
                                failure_callback) {
  var USER_CONFIG = require('./config.js').user_config();

  if (USER_CONFIG.hasOwnProperty('fb_auth_token')
      && USER_CONFIG['fb_auth_token_expire'] > Date.now()/1000) {
    // Success callback
    success_callback(USER_CONFIG['fb_auth_token'],
                     USER_CONFIG['fb_auth_token_expire']);
  } else {
    getTokenWithUsersHelp(
      function(access_token, expires_in) { // When success.

        // Record to user config.
        USER_CONFIG['fb_auth_token'] = access_token;
        USER_CONFIG['fb_auth_token_expire'] = 
          parseInt(Date.now()/1000) + parseInt(expires_in);

        // Success callback
        success_callback(USER_CONFIG['fb_auth_token'],
                         USER_CONFIG['fb_auth_token_expire']);
      },
      failure_callback);
  }
};