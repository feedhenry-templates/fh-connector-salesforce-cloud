var connect = require('fh-connect'),
util = require('util'),
$fh = require('fh-api'),
authentication = require('../common/authenticate'),
cors = require('../common/cors'),
paramsUtils = require('./params'),
headersUtils = require('../common/headers'),
plaintextUtils = require('./plaintext'),
feedhenryReporting = require('./fh-reports'),
mainjs;
module.exports = function(main){
  if (!main){
    throw new Error("Error : no main.js file specified when initialising cloud route");
  }
  mainjs = main;
  return cloud.router;
};

// Attempt to treat text/plain as json
connect.bodyParser.parse["text/plain"] = plaintextUtils;


var cloud = {
  router : connect().use(connect.bodyParser()).use(
    connect.router(function (app) {
      // For CORS Requests - responds with the headers a browser likes to see so that CORs can function.
      app.options('/:func', cors.optionsResponse);

      // Process GETs, POSTs, and everything else inbetween!
      // Do clever jsonp stuff, and make one unified params object
      app.all('/:func', function (req, res) {
        var params = {};
        params = paramsUtils.normalise(params, req);

        return cloud.callFunction(params, req, res);
      });



      // Handle unspecified functions
      app.all('/', function(req, res){
        res.statusCode = 404;
        res.end(JSON.stringify({error:"Error: no function specified"}));
      });



    })
   ).use(connect.errorHandler({dumpExceptions:true, showMessage:true})), // end router
  /*
   Reaches out to Main.js, and calls the relevant function if it exists.
   Common path for all connect requests, be they POST, GET
   */
  callFunction : function (params, req, res) {
    var self = this,
    funct = req.params.func,
    responseTime = 0,
    totalTime = 0,
    requestTime = new Date().getTime();
    params._headers = req.headers;
    params._files = req.files;
    var msgParams = params;
    msgParams.ipAddress = this.getIPofClient(req);
    msgParams.agent = (req.headers && req.headers['user-agent']) ? req.headers['user-agent'] : '-';
    msgParams.funct = funct;

    cors.addCorsHeaders(req, res);

    if (mainjs.hasOwnProperty(funct)) {
      //authentication happens here
      authentication(req,res,params).authenticate(funct, function (err, ok){
        //we only care about err
        if(err){
          res.writeHead(err.code, {"Cache-Control":"no-cache","Content-Type":"application/json"});
          res.end(JSON.stringify(err));
          return;
        }
        try {
          mainjs[funct](params, function (err, data, userHeaders) {
            if (err) {
              self.handleError(err, funct, res);
            } else {
              var contentType = 'application/json';

              if (typeof data === 'string'){
                contentType = 'text/plain';
              }

              if (data instanceof Buffer) {
                contentType = 'application/octet-stream';
              } else if (typeof(data) !== "string") {
                data = JSON.stringify(data);
              }

              if (params && params._callback != undefined) {
                contentType = 'text/javascript';
                data = params._callback + '(' + data + ');';
              }

              var headers = headersUtils(userHeaders, contentType);
              res.writeHead(200, headers);
              res.end(data);

              responseTime = new Date().getTime();
              msgParams.status = 200;
              msgParams.time = totalTime = (responseTime - requestTime); //milisecs;
              msgParams.start = requestTime;
              msgParams.end = responseTime;
              if (data) {
                msgParams.bytes = (data instanceof Buffer)?data.length:Buffer.byteLength(data);
              }
              else{
                msgParams.bytes = 0;
              }

              //schedule report for next tick
              try {
                feedhenryReporting.sendReport({func:funct, fullparams:msgParams, topic:'fhact'});
              } catch (e) {
              }
              // also log live stat
              $fh.stats.timing(funct + '_request_times', msgParams['time'], true);
              $fh.stats.timing('__fh_all_request_times', msgParams['time'], true);
            }
          });
        } catch (x) {
          self.handleError(x, funct, res);
        }
      });

    } else {
      msgParams.status = 404;
      responseTime = new Date().getTime();
      msgParams.time = totalTime = (responseTime - requestTime);
      msgParams.bytes = 0;
      try {
        feedhenryReporting.sendReport({func:funct, fullparams:msgParams, topic:'fhact'});
      } catch (e) {
      } //doing nothing with exceptions as rather the messaging fail silently than cause probs for app
      res.writeHead(404, headersUtils({'Content-Type' : 'application/json'}));
      res.end(JSON.stringify({error:"Error: no such function: " + funct}));

    }
  },
  /*

   */
  getIPofClient : function (req) {
    var ret =  "nonset"; // default value

    if (req.headers && req.headers['x-forwarded-for']) {
      ret = req.headers['x-forwarded-for'];  // this may be a comma seperated list of addresses added by proxies and load balancers
    } else if (req.connection && req.connection.remoteAddress) {
      ret = req.connection.remoteAddress;
    }

    return ret;
  },
  /*
    Fires if the 'err' condition of the main.js exported function is populated
   */
  handleError : function(err, funct, res) {
    res.statusCode = 500;

    console.error("Internal error in " + funct + ": " + util.inspect(err));
    if (err && err.stack){
      console.error(util.inspect(err.stack));
    }

    var error = {
      msg:"Internal error in " + funct + ": " + err,
      error:JSON.stringify(err)
    };
    res.end(JSON.stringify(error));
  }
};