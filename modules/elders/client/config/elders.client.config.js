'use strict';

// Configuring the Elders module
angular.module('elders').run(['Menus',
  function (Menus) {
    // Add the elders dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Elders',
      state: 'elders',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'elders', {
      title: 'List Elders',
      state: 'elders.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'elders', {
      title: 'Create Elders',
      state: 'elders.create',
      roles: ['user']
    });
  }
]);
