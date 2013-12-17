var _ = require('underscore');
/*
 Normalises the params object from a few different request types,
 so the cloud code function is presented with one unified params object
 */

 module.exports = {
  normalise : function(params, req){

    if (typeof req.body !== "undefined"){
      if (typeof req.body === 'string'){
        try{
          req.body = JSON.parse(req.body);
        }catch(err){
          // Ignore errors - we'll treat it as string
        }

      }
      params = _.extend(params, req.body);
    }


    if (req.query != null) {
      if( req.query.params != null) {
        try {
          params = _.extend(params, JSON.parse(req.query.params));
          params._callback = req.query._callback;
        } catch (e) {
          // "params" parameter is not a JSON object - may be a coincidence that we got a
          // standard GET request with a parameter called "params". Just use the req.query
          // obect as the params
          params = _.extend(params, req.query);
        }
      }
      else {
        params = _.extend(params, req.query);
      }

      this.jsonp(params, req);
    }
    return params;
  },
  /*
   for js sdk, some jsonp requests will stringiy the request data and send as a query param called _jsonpdata
   if we see it, parse it as json and send to the request
   */
  jsonp : function(params, req){
    if(req.query._jsonpdata){
      var jsonpdata = null;
      try{
        jsonpdata = JSON.parse(decodeURIComponent(req.query._jsonpdata));
        params = _.extend(params, jsonpdata);
      } catch (e){
        params._jsonpdata = req.query._jsonpdata;
      }
    }
    return params;
  }
 };
