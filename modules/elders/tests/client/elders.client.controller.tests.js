'use strict';

(function () {
  // Elders Controller Spec
  describe('Elders Controller Tests', function () {
    // Initialize global variables
    var EldersController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Elders,
      mockElder;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Elders_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Elders = _Elders_;

      // create mock elder
      mockElder = new Elders({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Elder about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Elders controller.
      EldersController = $controller('EldersController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one elder object fetched from XHR', inject(function (Elders) {
      // Create a sample elders array that includes the new elder
      var sampleElders = [mockElder];

      // Set GET response
      $httpBackend.expectGET('api/elders').respond(sampleElders);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.elders).toEqualData(sampleElders);
    }));

    it('$scope.findOne() should create an array with one elder object fetched from XHR using a elderId URL parameter', inject(function (Elders) {
      // Set the URL parameter
      $stateParams.elderId = mockElder._id;

      // Set GET response
      $httpBackend.expectGET(/api\/elders\/([0-9a-fA-F]{24})$/).respond(mockElder);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.elder).toEqualData(mockElder);
    }));

    describe('$scope.create()', function () {
      var sampleElderPostData;

      beforeEach(function () {
        // Create a sample elder object
        sampleElderPostData = new Elders({
          title: 'An Elder about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An Elder about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (Elders) {
        // Set POST response
        $httpBackend.expectPOST('api/elders', sampleElderPostData).respond(mockElder);

        // Run controller functionality
        scope.create(true);
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the elder was created
        expect($location.path.calls.mostRecent().args[0]).toBe('elders/' + mockElder._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/elders', sampleElderPostData).respond(400, {
          message: errorMessage
        });

        scope.create(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock elder in scope
        scope.elder = mockElder;
      });

      it('should update a valid elder', inject(function (Elders) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/elders\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/elders/' + mockElder._id);
      }));

      it('should set scope.error to error response message', inject(function (Elders) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/elders\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(elder)', function () {
      beforeEach(function () {
        // Create new elders array and include the elder
        scope.elders = [mockElder, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/elders\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockElder);
      });

      it('should send a DELETE request with a valid elderId and remove the elder from the scope', inject(function (Elders) {
        expect(scope.elders.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.elder = mockElder;

        $httpBackend.expectDELETE(/api\/elders\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to elders', function () {
        expect($location.path).toHaveBeenCalledWith('elders');
      });
    });
  });
}());
