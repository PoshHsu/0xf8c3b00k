var util = require("util");
var http = require("http");
var url = require("url");

var CONFIG = {
  'fb_app_id'     : '370477596318204',
  'fb_app_secret' : '',
  'fb_auth_scope' : '',
  'fb_oauth_server_port' : 40680
};

function handle_root(request, response) {
  // https://www.facebook.com/dialog/oauth?
  //     client_id=YOUR_APP_ID
  //    &redirect_uri=YOUR_REDIRECT_URI
  //    &scope=COMMA_SEPARATED_LIST_OF_PERMISSION_NAMES
  //    &state=SOME_ARBITRARY_BUT_UNIQUE_STRING
  var req_info = url.parse(request.url, true); // Get user query
  var q = req_info.query;
  if (q.hasOwnProperty('code')) {
    // We got user's auth code, we can use this code to acquire token.
    var taken = request_token(q['code']);

    response.statusCode = 200;
    response.write('Code: ' + q.code);
    response.end();
  } else {
    // We haven't yet get the code, so redirect user to facebook's page.
    response.statusCode = 301;
    response.setHeader('Location',
                       'https://www.facebook.com/dialog/oauth'
                       + '?client_id=' + CONFIG.fb_app_id
                       + '&redirect_uri=http://' + request.headers.host + '/'
                       + '&scope=' + CONFIG.fb_auth_scope);
    response.end();
  }
}

http.createServer(function(request, response) {
  var req_info = url.parse(request.url);
  if (req_info.pathname != '/') {
    // Redirect to root
    response.statusCode = 301;
    response.setHeader("Location", "/");
    response.end();
  } else {
    console.log(request.headers.host);
    handle_root(request, response);
  }
}).listen(CONFIG.fb_oauth_server_port);

