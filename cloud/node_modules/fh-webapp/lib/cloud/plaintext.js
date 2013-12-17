/*
  Connect doesn't give us JSON back when dealing with plaintext
  If the body contains JSON, parse it - otherwise, pass on the string
 */
module.exports = function (req, options, fn) {
  var buf = "";
  req.setEncoding("utf8");
  req.on("data", function (chunk) {
    buf += chunk;
  });

  req.on("end", function () {
    var parsedBuf;
    try {
      parsedBuf = JSON.parse(buf);
    }catch (ex) {
      // Note: ok if this fails, may not be JSON being passed
      // console.error("Error parsing: " + buf + " - " + ex);
    }

    try {
      req.body = parsedBuf ? parsedBuf : buf;
      fn();
    } catch (err) {
      fn(err);
    }
  });
};