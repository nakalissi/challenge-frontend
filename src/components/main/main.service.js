(function(){

  'use strict';

  angular.module('routeEasyApp').service('MainService', function($http, api){
    // Get github details
    this.getGitUser = function(user){
      return $http.get(api.url + 'users/' + user);
    },
    this.getGitFollowers = function(url) {
      return $http.get(url);
    },
    // Get github user repositories
    this.getGitUserRepos = function(user){
      return $http.get(api.url + 'users/' + user + '/repos');
    },
    // Get github repositories details
    this.getGitUserRepoDetails = function(params) {
        return $http.get(api.url + 'repos/' + params);
    };
  });

})();
