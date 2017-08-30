(function(){
  'use strict';
  var lazyLoad = function(){
    return{
      restrict: 'E',
      scope: true,
      link: function(scope, element, attrs){
        console.log(scope);
        console.log(element);
        console.log(attrs);
      }
    }
  };

  angular.module('app').directive('lazyLoad', lazyLoad);
})(angular);
