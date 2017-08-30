(function() {
  'use strict';

  angular
    .module('routeEasyApp', ['ngRoute', 'angular-loading-bar', 'ui.bootstrap'])
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider){
        cfpLoadingBarProvider.includeSpinner = false;
      }
    ])
    .constant('api', {
      url: 'https://api.github.com/'
    });

})();
