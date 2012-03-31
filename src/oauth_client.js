var http = require('http');
var url = require('url');

var CONFIG = {

  // Path name that can be opened by browser.
  'fb_authclient_pathname' : '/authclient',

  // Server side path to the file that contains html data to request a fb
  // token.
  'fb_authclient_servpath' : './oauth_page.html',

  // Facebook app id.
  'fb_client_id'           : '370477596318204',
};

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
      console.log('access_token: ' + query['access_token']);
      console.log('expires_in: ' + query['expires_in']);
      response.end();
      httpServer.close();
    } else {
      // Wrong case, redirect to login path.
      response.statusCode = 301;
      response.setHeader('Location', CONFIG['fb_authclient_servpath']);
      response.end();
    }
  }
);

httpServer.listen(40680);

console.log("Link to: ");
console.log("http://localhost:40680" + CONFIG.fb_authclient_pathname
            + "#client_id=" + CONFIG.fb_client_id);