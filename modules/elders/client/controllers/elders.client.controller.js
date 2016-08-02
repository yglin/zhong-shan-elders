'use strict';

// Elders controller
angular.module('elders').controller('EldersController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Elders',
  function ($scope, $http, $stateParams, $location, Authentication, Elders) {
    $scope.authentication = Authentication;
    $scope.elder = {};

    // Create new Elder
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'elderForm');

        return false;
      }

      // Create new Elder object
      var elder = new Elders($scope.elder);

      // Redirect after save
      elder.$save(function (response) {
        $location.path('elders/' + response._id);

        // Clear form fields
        $scope.elder = { residence: {} };
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Elder
    $scope.remove = function (elder) {
      if (elder) {
        elder.$remove();

        for (var i in $scope.elders) {
          if ($scope.elders[i] === elder) {
            $scope.elders.splice(i, 1);
          }
        }
      } else {
        $scope.elder.$remove(function () {
          $location.path('elders');
        });
      }
    };

    // Update existing Elder
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'elderForm');

        return false;
      }

      var elder = $scope.elder;

      elder.$update(function () {
        $location.path('elders/' + elder._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Elders
    $scope.find = function () {
      $scope.elders = Elders.query();
    };

    // Find existing Elder
    $scope.findOne = function () {
      $scope.elder = Elders.get({
        elderId: $stateParams.elderId
      });
    };

    // Set elder._residence.location to next location
    $scope.nextLocation = function() {
      $scope.geocodeResultsIndex = typeof $scope.geocodeResultsIndex === 'undefined' ? 0 : (($scope.geocodeResultsIndex + 1) % $scope.geocodeResults.length);
      var loc = $scope.geocodeResults[$scope.geocodeResultsIndex].geometry.location;
      $scope.elder._residence.location = [loc.lng, loc.lat];
    };

    // Clear geocode results and reset _residence.location
    $scope.clearGeocode = function () {
      $scope.geocodeResults = [];
      $scope.geocodeResultsIndex = 0;
      delete $scope.elder._residence.location;      
    };

    // Geocode address
    $scope.geocode = function (address) {
      $scope.clearGeocode();
      var googleGeocodeURL = 'https://maps.googleapis.com/maps/api/geocode/json';
      var parameters = {
        address: address,
        key: 'AIzaSyA30fcSyu3i8rz3gOQeFA6Y1fsRDx7gFCY'
      };
      var queryString = [];
      for (var key in parameters) {
        queryString.push(key + '=' + parameters[key]);
      } 
      googleGeocodeURL = googleGeocodeURL + '?' + queryString.join('&');
      $http({
        method: 'GET',
        url: googleGeocodeURL
      })
      .then(function (response) {
        if (response.data.status === 'OK') {
          $scope.geocodeResults = response.data.results;
          $scope.nextLocation();
        }
      });
    };
  }
]);
