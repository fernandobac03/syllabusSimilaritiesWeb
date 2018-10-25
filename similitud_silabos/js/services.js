'use strict';

/* Services */

var similitudServices = angular.module('similitudServices', ['ngResource']);

//parliament
//similitudServices.serverInstance = 'http://localhost:8089/parliament/sparql';
//marmotta
//similitudServices.serverInstance = 'http://localhost:8080/marmotta/sparql/select';
//allegro graph
//no soporta ld+json
//graphdb free-version
//similitudServices.serverInstance = 'http://localhost:8080/repositories/silabosEC';


//similitudServices.similarityService = 'http://201.159.223.25:5000/ucuenca/syllabus/similarity/service/fulldetected';


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
                'http://' + $window.location.hostname + ':8080/repositories/silabosEC' 
        return $resource(serverInstance , {}, {
            querySrv: {method: 'POST', isArray: true, transformRequest: transform, headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}}
        });
    }]);


similitudServices.factory('similarityQuery', ['$resource', '$http', '$window',
    function ($resource, $http, $window) {
        var serverInstance = similitudServices.similarityService ? similitudServices.similarityService :
               'http://' + $window.location.hostname + ':5000/ucuenca/syllabus/similarity/service/fulldetected';
        return $resource(serverInstance, {}, {
            query: {method: 'POST', isArray: false, headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}}
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


