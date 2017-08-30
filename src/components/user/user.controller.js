(function() {
  'use strict';

  angular
    .module('routeEasyApp')
    .controller('UserController', MainController);

  /** @ngInject */
  function MainController($scope, $timeout, MainService, $routeParams) {

    $scope.message = false;
    var userId = $routeParams.user;

    $scope.order = 'stars';
    $scope.reverse = true;

    $scope.end = '-23.6178442,-46.6426532';

    $scope.sortBy = function(order){
      $scope.reverse = ($scope.order === order) ? !$scope.reverse : false;
      $scope.order = order;
    }

    // Get current browser geolocation
    $scope.geolocation = function(){
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
          // Get latitude and longitude
          $scope.start = position.coords.latitude + ',' + position.coords.longitude;
          loadMap(position);
        });
      }
    }

    // Search coordinates with params
    // @info object
    var loadMap = function(info) {

      var coords = {lat: info.coords.latitude, lng: info.coords.longitude};

      var directionsService = new google.maps.DirectionsService;
      var directionsDisplay = new google.maps.DirectionsRenderer;

      var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: coords,
        scrollwheel: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      directionsDisplay.setMap(map);

      calculateAndDisplayRoute(directionsService, directionsDisplay);

    }

    function calculateAndDisplayRoute(directionsService, directionsDisplay) {

      directionsService.route({
        origin: $scope.start,
        destination: $scope.end,
        travelMode: 'DRIVING'
      }, function(response, status) {
        if (status === 'OK') {
          directionsDisplay.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    }

    // Load the github user
    // @user string
    var loadGitUser = function(userId) {
      if (userId) {
        MainService.getGitUser(userId)
        .success(function(response){
          $scope.user = angular.copy(response);
          setTimeout(function(){
            loadGitFollowers($scope.user.followers_url);
            loadGitRepos(userId);
          },100);
        })
        .error(function(err){
          $scope.message = {
            content: err,
            status: true
          }
        });
      }
    }

    // Load user followers
    // @url string
    var loadGitFollowers = function(url){
      if (url) {
        MainService.getGitFollowers(url)
        .success(function(response){
          $scope.followers = response;
        })
        .error(function(err) {
          $scope.message = {
            content: err,
            status: true
          }
        })
      }
    }

    // Load user repos
    // @user string
    var loadGitRepos = function(user){
      if (user) {
        MainService.getGitUserRepos(user)
        .success(function(response){
          $scope.repos = angular.copy(response);
        })
        .error(function(err){
          $scope.message = {
            content: err,
            status: true
          }
        })
      }
    }

    $scope.$on('$viewContentLoaded', function() {
      loadGitUser(userId);
    });

};

})();
