'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  _ = require('lodash'),
  q = require('q'),
  mongoose = require('mongoose'),
  Elder = mongoose.model('Elder'),
  Place = mongoose.model('Place'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

function createOrUpdateResidence(residence) {
  var handleResidence = q.defer();
  if (residence && residence.address) {
    Place.findOneAndUpdate({ address: residence.address }, residence, { new: true, upsert: true }, 
    function (err, place) {
      if (err) {
        console.warn(err);
        console.warn('Can not create/update Place:' + errorHandler.getErrorMessage(err));
        handleResidence.resolve(null);
      }
      else {
        handleResidence.resolve(place);
      }
    });
  }
  else {
    handleResidence.resolve(null);
  }
  return handleResidence.promise;  
}
/**
 * Create a elder
 */
exports.create = function (req, res) {
  createOrUpdateResidence(req.body._residence)
  .then(function (residence) {
    var elder = new Elder(req.body);
    elder._creator = req.user;
    elder._residence = residence;

    elder.save(function (err) {
      if (err) {
        console.error(err);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(elder);
      }
    });  
  });
};

/**
 * Show the current elder
 */
exports.read = function (req, res) {
  res.json(req.elder);
};

/**
 * Update a elder
 */
exports.update = function (req, res) {
  createOrUpdateResidence(req.body._residence)
  .then(function (residence) {
    var elder = req.elder;

    // elder.title = req.body.title;
    // elder.content = req.body.content;
    _.merge(elder, req.body);
    if (residence) {
      elder._residence = residence;
    }

    elder.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(elder);
      }
    });
  });
};

/**
 * Delete an elder
 */
exports.delete = function (req, res) {
  var elder = req.elder;

  elder.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(elder);
    }
  });
};

/**
 * List of Elders
 */
exports.list = function (req, res) {
  Elder.find().sort('-created').populate(['_creator', '_residence'])
  .exec(function (err, elders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(elders);
    }
  });
};

/**
 * Elder middleware
 */
exports.elderByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Elder is invalid'
    });
  }

  Elder.findById(id).populate(['_creator', '_residence'])
  .exec(function (err, elder) {
    if (err) {
      return next(err);
    } else if (!elder) {
      return res.status(404).send({
        message: 'No elder with that identifier has been found'
      });
    }
    // console.log('============= elderByID ===============');
    // console.log(elder);
    // console.log('============= elderByID ===============');
    req.elder = elder;
    next();
  });
};
