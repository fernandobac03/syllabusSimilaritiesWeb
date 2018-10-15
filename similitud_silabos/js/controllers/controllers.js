//'use strict';

/* Controllers */

var similitudControllers = angular.module('similitudControllers', ['silTable', 'snapscroll', 'ui.bootstrap.pagination']);

similitudControllers.controller('ExploreController', ['$scope', '$window',
    function ($scope, $window) {
        console.log($scope.text);
    }]);





