var http = require('http'),
sf = require('node-salesforce'),
request = require('request');

function injectLatLngAndServe(account, cb) {
  var url,
  data = '';

  var address = [
    account.BillingStreet,
    account.BillingCity,
    (account.BillingCountry || '')
  ].join(', ');

  address = address.replace(/ /g, '+');

  url = 'http://maps.googleapis.com/maps/api/geocode/json?address=' +
  address + '&sensor=false';

  http.get(url, function(res) {

    if (res.statusCode !== 200) {
      return cb(null, "0,0");
    }

    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end', function() {
      var jsonRes = JSON.parse(data);

      if (jsonRes.status === 'OK') {
        account.latlng = jsonRes.results[0].geometry.location.lat + ',' + jsonRes.results[0].geometry.location.lng;
        console.log(account);
        return cb(null, account);
      } else {
        return cb(null, '0,0');
      }
    });
  });
}

/**
 * Attempt to login to Salesforce through the SOAP mechanism given a username
 * and password.
 *
 * @param {Object} params Should contain username, password and url strings.
 * @param {Function} cb The act callback.
 */
exports.login = function(params, cb) {
  var username, password, url, conn;

  if (!params.username || !params.password) {
    return cb(new Error('You need to provide a username and password!'));
  }

  username = params.username;
  password = params.password;
  url = params.url || 'https://login.salesforce.com';

  conn = new sf.Connection({
    loginUrl: url
  });

  conn.login(username, password, function(err) {
    if (err) {
      return cb(err);
    }

    // Return the auth data to the client so we can start a new conn object
    // in future requests.
    return cb(null, {
      accessToken: conn.accessToken,
      instanceUrl: conn.instanceUrl
    });
  });
};

/**
 * Get the relevant details from accounts objects.
 *
 * @param {Object} auth The auth object for your session.
 * @param {Function} cb The act callback.
 */
exports.listAccounts = function(auth, cb) {
  var conn = new sf.Connection(auth),
  queryFields;

  queryFields = [
    'Id',
    'AccountNumber',
    'Industry',
    'Name',
    'Rating',
    'Website',
    'Type',
    'BillingStreet',
    'BillingCity',
    'BillingState',
    'BillingPostalCode',
    'BillingCountry',
    'Phone'
  ].join(', ')

  // Using query syntax. Possible feature for future consideration would be to
  // allow custom limit and/or sorting, to make more robust.
  conn.query("SELECT " + queryFields + " FROM Account ORDER BY Id DESC LIMIT 50",
  function(err, result) {

    if (!err) return cb(null, result);
    return cb(err, null);
  });
};

exports.listCases = function(auth, cb) {
  var conn = new sf.Connection(auth),
  queryFields;

  queryFields = [
    'CaseNumber',
    'IsClosed',
    'Origin',
    'Priority',
    'Reason',
    'Subject',
    'Type'
  ].join(', ')

  conn.query("SELECT " + queryFields + " FROM Case ORDER BY CaseNumber DESC LIMIT 50", function(err, result) {
    if(!err) return cb(null, result);
    return cb(err, null);
  });
};

exports.listCampaigns = function(auth, cb) {
  var conn = new sf.Connection(auth);

  conn.query("SELECT Name, Status, IsActive, BudgetedCost, ActualCost FROM Campaign ORDER BY LastActivityDate DESC LIMIT 50", function(err, result) {
    if(!err) return cb(null, result);
    return cb(err, null);
  });
};

/**
 * Retrieve full details of a specified account id.
 *
 * @param {Object} params Should contain the auth object and accountId string.
 * @param {Function} cb The callback given to the act call.
 */
exports.getAccountDetails = function(params, cb) {
  var conn = new sf.Connection(params.auth);

  // accountId can be either a string or array of strings; in which case the
  // returned account object will also be an array of accounts objects.
  conn.sobject('Account').retrieve(params.accountId, function(err, account) {
    if (!err) {

      injectLatLngAndServe(account, cb);

      // TODO: Do address lookup and inject the latlng coordinates into the account object.
    } else {
      return cb(err);
    }

  });
};

exports.getCaseDetails = function(params, cb) {
  var conn = new sf.Connection(params.auth);

  // accountId can be either a string or array of strings; in which case the
  // returned account object will also be an array of accounts objects.
  conn.sobject('Case').retrieve(params.caseId, function(err, caseDetails) {
    if (!err) {
      return cb(null, caseDetails.objectDescribe);

      // TODO: Do address lookup and inject the latlng coordinates into the account object.
    }
    return cb(err);
  });
};


var conn = new sf.Connection({
  loginUrl: 'https://login.salesforce.com'
});

// append Security Token to password if it exists
var pwordAndToken = process.env.SALESFORCE_PASSWORD + (process.env.SALESFORCE_SECURITYTOKEN || '');
conn.login(process.env.SALESFORCE_USERNAME, pwordAndToken, function(err) {
  if (err) {
    return console.log('Error connecting ');
  }
  console.log('Logged in as:', process.env.SALESFORCE_USERNAME);

  // subscribe to Account changes and send push notifications on changes
  conn.streaming.topic("AccountChanges2").subscribe(function(message) {
    console.log(JSON.stringify(message.sobject));

    var message = 'Salesforce Account ' + message.sobject.Name + ' has been updated';
    // send push notification to specific project
    pushUpdates(message);
    
  // TODO Uncomment once $fh.push is in place for client app
    function pushUpdates(message){
      // var push = $fh.push.getPushClient({
      //   widget: 'CLOUD_WIDGET_VALUE',
      //   instance: 'CLOUD_INSTANCE_VALUE',
      //   appapikey: 'CLOUD_APP_API_KEY_VALUE'
      // });

      // var msgObj = {
      //   alert: message
      // };
      // var options = {
      //   broadcast: true
      // };

      // push(message,options,function(err,res){
      //   if(err){
      //     console.error('Push Failed',err);
      //   } else {
      //     console.log('Push status:',res.status);
      //   }
      // })
    }


  });
});
