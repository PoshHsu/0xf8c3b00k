var http = require('http');
var url = require('url');
var CONFIG = require('./config.js');

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
    } else {
      // Wrong case, redirect to login path.
      response.statusCode = 301;
      response.setHeader('Location', CONFIG['fb_authclient_servpath']);
      response.end();
    }
  }
);

exports.getTokenWithUsersHelp = function(success_callback,
                                         failure_callback) {
  success_cb = success_callback;
  failure_cb = failure_callback;

  httpServer.listen(40680);

  // Inform user to open browser.
  console.log("Use browser to open: ");
  console.log("  http://localhost:40680" + CONFIG.fb_authclient_pathname
              + "#client_id=" + CONFIG.fb_client_id);
}