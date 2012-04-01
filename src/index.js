var fbOauthClient = require('./fb_oauth_client.js');

fbOauthClient.getAuthToken(function(access_token, expires_in) {
  console.log("We got token:");
  console.log("  access_token: %s", access_token);
  console.log("  expires_in: %s", expires_in);
  process.exit(0);
});