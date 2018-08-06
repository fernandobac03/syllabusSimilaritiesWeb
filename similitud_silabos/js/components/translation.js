/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


(function(){
var myApp = angular.module("similitudApp");
myApp.config(["$translateProvider", function ($translateProvider) {
$translateProvider.translations("en", myApp.labels_en);
$translateProvider.translations("es", myApp.labels_es);
$translateProvider.preferredLanguage("en");
//$translateProvider.useSanitizeValueStrategy('sanitize');
}]);
}());