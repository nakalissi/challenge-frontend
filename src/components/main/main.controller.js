(function() {
  'use strict';

  angular
    .module('routeEasyApp')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $location) {

    $scope.message = false;

    $scope.searchUser = function(user) {
      if (user) {
        $location.path('/v1/users/' + user);
      }
    };

}

})();
