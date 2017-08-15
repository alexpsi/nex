const qs = require('querystring');
const crypto = require('crypto');
const md5 = require('md5');

const sign_v2 = (url, date, data, secret) => {
  const content_md5 = md5(data);
  const msg = ['POST', url, date, content_md5].join('\n');
  const hmac = crypto.createHmac('sha256', secret);
  return hmac.update(msg).digest().toString('base64');
};

module.exports = options => (req, res, next) => {
  if (req.url.split('?').shift() !== options.path) next();
  var body = '';
  const sig_v2 = req.headers['x-tx-signature-v2'];
  req.on('data', function(data) {
    body += data;
    if (body.length > 1e6) { req.connection.destroy(); }
  });
  req.on('end', function() {
    const data = Object.keys(qs.parse(body))[0];
    if (sig_v2 && sign_v2(
      req.headers['x-tx-url'],
      req.headers['date'],
      data,
      options.secret
    ) == sig_v2) {
      options.cb(data);
      return res.send({'status': 'OK'});
    } else {
      next('Invalid signature');
    }
    next();
  });
};
