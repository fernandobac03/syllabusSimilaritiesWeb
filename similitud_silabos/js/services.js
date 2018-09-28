'use strict';

/* Services */

var similitudServices = angular.module('similitudServices', ['ngResource']);

//For testing purposes
//wkhomeServices.serverInstance = 'http://190.15.141.85:8080/marmottatest';
//wkhomeServices.serverInstance = 'http://190.15.141.85:80';
//wkhomeServices.serverInstance = 'http://localhost:8080/marmotta';
//for parliament triplestore test
similitudServices.serverInstance = 'http://172.17.0.3:8089/parliament';
similitudServices.similarityService = 'http://172.17.0.5:5000/ucuenca/syllabus/full_similarity_detected';


/* Sample of a RESTful client Service */
similitudServices.factory('Phone', ['$resource',
    function ($resource) {
        return $resource('phones/:phoneId.json', {}, {
            query: {method: 'GET', params: {phoneId: 'phones'}, isArray: true}
        });
    }]);



/* RESTful client Service */
similitudServices.factory('authorRestQuery', ['$resource', '$http', '$window',
    function ($resource, $http, $window) {
        $http.defaults.headers.common['content-type'] = 'application/x-www-form-urlencoded';
        $http.defaults.headers.common['Accept'] = 'application/ld+json';
        var transform = function (data) {
            return $.param(data);
            //return data;
        };
        var serverInstance = similitudServices.serverInstance ? similitudServices.serverInstance :
                //'http://' + $window.location.hostname + ($window.location.port ? ':8080' : '') + '/marmotta';
                'http://' + $window.location.hostname + ($window.location.port ? ':8080' : '') + '';
        return $resource(serverInstance + '/pubman/pubsearch', {}, {
            query: {method: 'POST', isArray: true, transformRequest: transform, headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        });
    }]);


similitudServices.factory('sparqlQuery', ['$resource', '$http', '$window',
    function ($resource, $http, $window) {
        $http.defaults.headers.common['content-type'] = 'application/x-www-form-urlencoded';
        $http.defaults.headers.common['Accept'] = 'application/ld+json';
        var transform = function (data) {
            return $.param(data);
        }
        var serverInstance = similitudServices.serverInstance ? similitudServices.serverInstance :
                //'http://' + $window.location.hostname + ($window.location.port ? ':8080' : '') + '/marmotta';
                'http://' + $window.location.hostname + ($window.location.port ? ':8080' : '') + '';
        return $resource(serverInstance + '/sparql', {}, {
            querySrv: {method: 'POST', isArray: true, transformRequest: transform, headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        });
    }]);

similitudServices.factory('d3JSON', ['$resource',
    function ($resource) {
        return $resource('d3/:geoId.json', {}, {
            query: {method: 'GET', params: {geoId: 'world-50m'}, isArray: true}
        });
    }]);

similitudServices.factory('clustersQuery', ['$resource', '$http', '$window',
    function ($resource, $http, $window) {
        return $http.get('resources/datos_clustering.json')
                .success(function (data) {
                    return data;
                })
                .error(function (data) {
                    return data;
                });
    }]);

//$scope.postRequest = function () {
//      $http.post("http://urlforapi.com/", data)
//          .then(function successCallback(response){
//             console.log("Successfully POST-ed data");
//          }, function errorCallback(response){
//              console.log("POST-ing of data failed");
//          });
//  };

similitudServices.factory('similarityQuery', ['$resource', '$http', '$window',
    function ($resource, $http, $window) {
        var serverInstance = similitudServices.similarityService + '/service';
        return $resource(serverInstance, {}, {
            query: {method: 'POST', isArray: false, headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}
        });
    }]);

similitudServices.factory('similarityGetQuery', ['$resource', '$http', '$window', 'globalData',
    function ($resource, $http, $window, globalData) {
        var serverInstance = similitudServices.similarityService + '/direct';
        return $resource(serverInstance, {}, {
            query: {method: 'GET', params: {geoId: 'world-50m'}, isArray: false}
        });    
    }]);

similitudServices.factory('translateService', ['$resource', '$http', '$window', 'globalData',
    function ($resource, $http, $window, globalData) {
        return $resource('resources/:data.json', {}, {
            query: {method: 'GET', params: {data: globalData.language}, isArray: false}
        });

    }]);

similitudServices.factory('reportService', ['$resource', '$http', '$window',
    function ($resource, $http, $window) {
        $http.defaults.headers.common['content-type'] = 'application/x-www-form-urlencoded';
        $http.defaults.headers.common['Accept'] = 'application/ld+json';
        var transform = function (data) {
            data.hostname = similitudServices.serverInstance ? similitudServices.serverInstance : ('http://' + $window.location.hostname
                    + ($window.location.port ? ':8080' : '') + '');
            return $.param(data);
        };
        var serverInstance = 'http://' + $window.location.hostname
                + ($window.location.port ? ':8080' : '') + '';
        return $resource(
                serverInstance + '/pubman/report', {}, {
            querySrv: {method: 'POST', isArray: false, transformRequest: transform, headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        });
    }]);


