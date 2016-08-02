'use strict';

/**
 * Module dependencies.
 */
var eldersPolicy = require('../policies/elders.server.policy'),
  elders = require('../controllers/elders.server.controller');

module.exports = function (app) {
  // Elders collection routes
  app.route('/api/elders').all(eldersPolicy.isAllowed)
    .get(elders.list)
    .post(elders.create);

  // Single elder routes
  app.route('/api/elders/:elderId').all(eldersPolicy.isAllowed)
    .get(elders.read)
    .put(elders.update)
    .delete(elders.delete);

  // Finish by binding the elder middleware
  app.param('elderId', elders.elderByID);
};
