var connect = require('fh-connect'),
headersUtils = require('./common/headers.js'),
cors = require('./common/cors.js'),
mainjs = {};

/*
  Handles everything under /sys
  Internal piping & monitoring
 */
var sys = connect(
  connect.router(function (app) {
    // For CORS Requests - responds with the headers a browser likes to see so that CORs can function.
    app.options('/*', cors.optionsResponse);
    // Used by monitoring tools to verify the application is running OK
    app.get('/info/ping', function (req, res) {
      res.writeHead(200, headersUtils({ 'content-type' : 'text/plain' }));
      res.end(JSON.stringify("OK"));
    });
    app.get('/info/memory', function (req, res) {
      res.writeHead(200, headersUtils());
      res.end(JSON.stringify(process.memoryUsage()));
    });
    // Lists the endpoints available in main.js for consumption
    app.get('/info/endpoints', function (req, res) {
      var ret = {endpoints:[]};
      for(var p in mainjs){
        if(mainjs.hasOwnProperty(p) && 'function' === typeof  mainjs[p]){
          ret["endpoints"].push(p);
        }
      }
      res.writeHead(200, headersUtils());
      res.end(JSON.stringify(ret));
    });
    app.get('/info/version', function (req, res) {
      var headers = headersUtils({ 'content-type' : 'text/plain' });
      res.writeHead(200, headers);
      res.end(headers['X-FH-Api-Version']);
    });
  })
);

/*
  Sys is init'd with a reference to main.js
  Allows sys/endpoints to be listed
 */
module.exports = function(main){
  mainjs = main;
  return sys;
};