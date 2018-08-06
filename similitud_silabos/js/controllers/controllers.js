//'use strict';

/* Controllers */

var similitudControllers = angular.module('similitudControllers', ['barChart','mapView', 'cloudTag', 'pieChart', 'explorableTree', 'cloudGroup', 'cloudCluster', 'genericCloud', 'snapscroll', 'ui.bootstrap.pagination', 'keywClusters', 'clusterKeywCloud']);

similitudControllers.controller('ExploreController', ['$scope', '$window',
    function ($scope, $window) {
        console.log($scope.text);
    }]);





