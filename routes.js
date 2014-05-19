var Config = require('./config.js');

module.exports = function (app) {

  app.get('/', index);
  app.get('/partials/:name', partials);

  /**
   * @param (Object) req
   * @param (Object) res
   */
  function index(req, res) {
    res.render('index', {name: Config.web.name});
  }

  /**
   * @param (Object) req
   * @param (Object) res
   */
  function partials(req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
  }

};
