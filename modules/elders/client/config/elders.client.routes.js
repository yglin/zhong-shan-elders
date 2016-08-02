'use strict';

// Setting up route
angular.module('elders').config(['$stateProvider',
  function ($stateProvider) {
    // Elders state routing
    $stateProvider
      .state('elders', {
        abstract: true,
        url: '/elders',
        template: '<ui-view/>'
      })
      .state('elders.list', {
        url: '',
        templateUrl: 'modules/elders/client/views/list-elders.client.view.html'
      })
      .state('elders.create', {
        url: '/create',
        templateUrl: 'modules/elders/client/views/create-elder.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('elders.view', {
        url: '/:elderId',
        templateUrl: 'modules/elders/client/views/view-elder.client.view.html'
      })
      .state('elders.edit', {
        url: '/:elderId/edit',
        templateUrl: 'modules/elders/client/views/edit-elder.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
