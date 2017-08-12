module.exports = Logger => err => {
  if (typeof (err) == 'string') return Logger.error(err);
  if (err.code) return Logger.error(err.code);
  if (err.data) return Logger.error(err.data);
  if (err.response && err.response.data) {
    return Logger.error(err.response.data);
  }
};
