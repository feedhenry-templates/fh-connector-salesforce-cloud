var connect = require('fh-connect'),
  paramsUtils = require('./cloud/params'),
  authentication = require('./common/authenticate'),
  headersUtils = require('./common/headers'),
  cors = require('./common/cors'),
  $fh = require('fh-api');
var async = require('async');

var mBaaS = {
  db: $fh.db
};

module.exports = connect().use(connect.bodyParser()).use(
  connect.router(function (app) {
    // For CORS Requests - responds with the headers a browser likes to see so that CORs can function.
    app.options('/:func', cors.optionsResponse);
    app.post('/:func', function (req, res) {

      var params = {},
        api = req.params.func;
      params = paramsUtils.normalise(params, req);

      params.authConfig = {
        overrides: {
          '*': { security: 'appapikey' }
        }
      };

      //this method is called after the auth and authorise functions in an async series.
      function endResponseCallback(err, ok) {
        var headers = headersUtils({"Cache-Control": "no-cache", "Content-Type": "application/json"});
        if (err) {
          res.writeHead(err.code || 500, headers);
          res.end(JSON.stringify(err));
        } else if (ok) {
            res.writeHead(200, headers);
            return res.end(JSON.stringify(ok));
        }else{
          res.writeHead(200, headers);
          return res.end("");
        }
      }

      async.series([
        function (callback) {
          authentication(req, res, params).authenticate(api, callback);
        },
        function (callback) {
          if ("db" === api) {
            authentication(req, res, params).authorise("AppCloudDB", callback);
          } else {
            callback();
          }
        },function(callback){
          if (mBaaS.hasOwnProperty(api)) {
            mBaaS[api](params, callback);
          }else{
            callback({code:404,"message":"endpoint not found"});
          }

        }
      ], function (err, datas){
          if(err){
            endResponseCallback(err);
          }else{
            //async return the results in the same order they are executed
            if(datas && datas[2]){
              endResponseCallback(undefined,datas[2]);
            }else{
              endResponseCallback();
            }
          }
      });


    }); // end app.post
    app.all('/*', function (req, res) {
      res.end("Only POST to supported mBaaS APIs are supported. See http://docs.feedhenry.com for more")
    });
  })).use(connect.errorHandler({dumpExceptions: true, showMessage: true}));
