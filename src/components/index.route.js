(function() {
  'use strict';

  angular
    .module('routeEasyApp')
    .config(routeConfig);

  function routeConfig($routeProvider) {
    $routeProvider
      .when('/v1', {
        templateUrl: 'components/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      .when('/v1/users/:user', {
        templateUrl: 'components/user/user.html',
        controller: 'UserController',
        controllerAs: 'user'
      })
      .otherwise({
        redirectTo: '/v1'
      });
  }

})();
