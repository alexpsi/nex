module.exports = options => (req, res, next) => {
  if (req.url.split('?').shift() !== options.path) next();
  var body = '';
  req.on('data', function(data) {
    body += data;
    if (body.length > 1e6) { req.connection.destroy(); }
  });
  req.on('end', function() {
    const data = Object.keys(qs.parse(body))[0];
    if (req.headers['webhook-secret'] === options.secret) {
      options.cb(data);
      return res.send({'status': 'OK'});
    } else {
      next('Wrong secret');
    }
    next();
  });
};
