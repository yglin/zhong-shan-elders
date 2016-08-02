'use strict';

//Elders service used for communicating with the elders REST endpoints
angular.module('elders').factory('Elders', ['$resource',
  function ($resource) {
    return $resource('api/elders/:elderId', {
      elderId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
