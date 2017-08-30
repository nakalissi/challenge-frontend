(function() {

  'use strict';

  describe('routeEasyApp UserController Unit Test', function(){

    // import the routeEasyApp module
    beforeEach(module('routeEasyApp'));

    var controller, service, scope, http, httpBackend;

    beforeEach(inject(function($rootScope, $controller, $injector, $httpBackend, $http) {
      scope = $rootScope.$new();
      service = $injector.get('MainService');
        controller = $controller('UserController', {
        $scope: scope
      });
      http = $http;
      httpBackend = $httpBackend;
    }));

    it('variables should be defined', function() {

      expect(scope.message).toBe(false);

      scope.sortBy = function(order){
        expect(order).toBe('stars');
        expect(scope.reverse).toBe(true);
      }

    });

    afterEach(function () {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it('should load the github api', function(){

      var data = {
        login: 'nakalissi'
      }
      // code under test
      http.get('https://api.github.com/users/nakalissi')
      .success(function(response){
        scope.user = response;
      });
      // end code

      httpBackend.whenGET('https://api.github.com/users/nakalissi')
      .respond(200, data);

      httpBackend.flush();

      expect(scope.user).toEqual({ login: 'nakalissi' });

    });

  });

})();
