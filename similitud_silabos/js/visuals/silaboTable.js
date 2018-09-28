'use strict';

var silTable = angular.module('silTable', []);
//	D3	Factory
silTable.factory('d3', function () {
    return	d3;
});
silTable.directive('silTable', ["$translate", "$routeParams", 'globalData', 'sparqlQuery',
    function ($translate, $routeParams, globalData, sparqlQuery) {

        function dataFromObjet(li, items)
        {
            _.map(items, function (item) {
                if (item["@value"])
                {
                    li.append("li").text(" - " +  item["@value"]);
                } else
                if (typeof (item) == "string")
                {
                    li.append("li").text(" - " +  item);
                } else if (typeof (item) == "object")
                {
                    dataFromObjet(li, item);
         }
            });
        };
        function crearTabla(rootElement, data) {
            rootElement.html('');
            var table = rootElement.append("table");
            table.attr("class", "table table-striped contenido")
            //   var thead = table.append("thead");
            var tbody = table.append("tbody");
            var datos = data["data"];
            var campos = data["schema"]["fields"];
            _.map(campos, function (campo) { //recorriendo los nombres de los campos para crear cada fila
                var fila = tbody.append("tr");
                fila.append("td").text($translate.instant(campo));
                if (typeof (datos[campo]) == "object")
                {
                    dataFromObjet(fila.append("td").append("ul"), datos[campo]);
                } else if (typeof (datos[campo]) == "string")
                {
                    fila.append("td").text(datos[campo]);
                }
            });
        };

        function draw(elementoRaiz, data, widthEl, heightEl, scopeEl, attrsEl) {
            crearTabla(elementoRaiz, data);
        };

        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            compile: function (element, attrs, transclude) {
                var elementoRaiz = d3.select(element[0]);
                return	function (scope, element, attrs) {
                    scope.$watch('data', function (newVal, oldVal, scope) {
                        var data = scope.data;
                        if (data) {
                            draw(elementoRaiz, data, scope, attrs);
//                            var jsonld = data.data;
//                            var schema = data.schema;
//                            var fields = schema.fields;
//                            var mappedData = [];
//                            _.each(jsonld['@graph'], function (keyword, idx) {
//                                mappedData.push({label: keyword[fields[0]], value: keyword[fields[1]]["@value"]});
//                            });
//                            draw(svg, data, width, height, scope, attrs);
                        }
                    }, true);
                };
            }
        };
    }]);

