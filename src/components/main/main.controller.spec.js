(function() {

  'use strict';

  describe('routeEasyApp MainController Unit Test', function(){

    // import the routeEasyApp module
    beforeEach(angular.mock.module('routeEasyApp'));

    var controller, scope;

    beforeEach(inject(function($rootScope, $controller, $injector) {
      scope = $rootScope.$new();
      controller = $controller('MainController', {
        $scope: scope
      });
    }));

    it('should be defined', function() {

      expect(scope.message).toBe(false);

      scope.searchUser = function(user) {
        expect(user).toBeDefined();
      }

    });

  });

})();
