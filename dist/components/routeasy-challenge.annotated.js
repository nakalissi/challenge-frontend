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

}
MainController.$inject = ["$scope", "$timeout", "MainService", "$routeParams"];;

})();

(function(){

  'use strict';

  angular.module('routeEasyApp').service('MainService', ["$http", "api", function($http, api){
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
  }]);

})();

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
MainController.$inject = ["$scope", "$location"];

})();

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
  routeConfig.$inject = ["$routeProvider"];

})();

(function(module) {
try {
  module = angular.module('routeasy-challenge');
} catch (e) {
  module = angular.module('routeasy-challenge', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/routeasy-challenge/components/main/main.html',
    '<div class="container-fluid"><div class="row jumbotron"><div class="col-sm-12"><div class="logo text-center"><img ng-src="http://app.routeasy.com.br/lib/landing/img/routeasy-horizontal_180.png" alt=""></div><h2 class="text-center">Digite o usuário do Github.</h2><form name="search" ng-submit="searchUser(inputuser)"><div class="input-group text-center"><input name="field" placeholder="Buscar Usuário" class="form-control input-lg" ng-model="inputuser" required><div class="input-group-btn"><button type="submit" name="submit" class="btn btn-primary btn-lg" ng-disabled="search.$invalid">Buscar</button></div></div><div class="alert alert-danger" ng-show="search.field.$error.required && !search.field.$pristine"><i class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></i> Campo obrigatório!</div><div class="alert alert-danger" ng-show="message.status"><i class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></i> {{message.content}}</div></form></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('routeasy-challenge');
} catch (e) {
  module = angular.module('routeasy-challenge', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/routeasy-challenge/components/user/user.html',
    '<nav class="navbar navbar-default" role="navigation" ng-controller="MainController"><div class="container-fluid"><div class="navbar-header"><button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1"><span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span></button> <a class="navbar-brand" href="#"><img ng-src="http://app.routeasy.com.br/lib/landing/img/routeasy-horizontal_180.png" alt=""></a></div><div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1"><ul class="nav navbar-nav"></ul><form name="search" class="navbar-form navbar-right" role="search" ng-submit="searchUser(inputuser)"><div class="input-group"><input class="form-control" ng-required="true" ng-model="inputuser" placeholder="Buscar Usuário"> <span class="input-group-btn"><button type="submit" class="btn btn-info" ng-disabled="search.$invalid">Enviar</button></span></div></form></div></div></nav><div class="container"><div class="alert alert-danger" ng-if="message.status"><i class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></i> {{message.content.message}}</div><div class="row" ng-if="!message.status"><div class="col-sm-3 col-xs-12"><h3>Seja bem vindo, {{::user.name}}</h3><div class="user picture"><img ng-src="{{::user.avatar_url}}" alt="{{user.fullname}}" class="img-responsive"></div><div class="user"><div class="badge">Segue {{::user.following}}</div><div class="badge">Seguidores {{::user.followers}}</div><div class="description"><p ng-if="user.email"><i class="glyphicon glyphicon-envelope"></i> {{::user.email}}</p><p ng-if="user.blog"><a href="{{::user.blog}}" target="_blank"><i class="glyphicon glyphicon-bold"></i> {{::user.blog}}</a></p><p ng-if="user.bio"><i class="glyphicon glyphicon-road"></i> {{::user.bio}}</p><p ng-if="user.location"><i class="glyphicon glyphicon-map-marker"></i> {{::user.location}}</p></div></div></div><div class="col-sm-9 col-xs-12 tabs"><uib-tabset active="active"><uib-tab index="0" heading="Repositórios"><div class="row"><div class="col-sm-12"><h3><div class="dropdown pull-right"><button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown">Order By {{order}} <span class="caret"></span></button><ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1"><li role="presentation"><a role="menuitem" tabindex="-1" ng-click="sortBy(\'stars\')">Stars</a></li><li role="presentation"><a role="menuitem" tabindex="-1" ng-click="sortBy(\'name\')">Nome</a></li></ul></div>&nbsp;</h3><div class="list-group"><a href="{{::repo.html_url}}" target="_blank" class="list-group-item" ng-repeat="repo in repos | orderBy: order : reverse"><span class="pull-right"><i class="badge">{{::repo.language}}</i> <i class="badge badge-info">{{::repo.stargazers_count}} <i class="glyphicon glyphicon-star"></i></i></span><h4 class="list-group-item-heading"> {{::repo.name}}</h4><p class="list-group-item-text">{{::repo.description}}</p></a></div></div></div></uib-tab><uib-tab index="2" heading="Seguidores"><div class="row followers" ng-if="!message.status"><div class="col-sm-12"><div class="col-xs-6 col-sm-3" ng-repeat="f in followers | orderBy : \'id\'"><div class="media"><a class="pull-left" href="{{::f.html_url}}" target="_blank"><img class="media-object" lazyload ng-src="{{::f.avatar_url}}" alt="{{::f.id}}"></a><div class="media-body"><h4 class="media-heading">{{f.login}}</h4></div></div></div></div></div></uib-tab><uib-tab index="3" heading="RoutEasy" ng-click="geolocation()"><div class="map-canvas" id="map"></div></uib-tab></uib-tabset></div></div></div><footer class="text-center"><span ng-if="user.login">@{{user.login}}</span></footer>');
}]);
})();
