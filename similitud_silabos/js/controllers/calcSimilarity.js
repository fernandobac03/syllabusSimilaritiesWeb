
similitudControllers.controller('calcSimilarity', ['$translate', '$routeParams', '$scope', 'temporalData', 'globalData', 'sparqlQuery', 'searchData', '$route', '$window',
    function ($translate, $routeParams, $scope, temporalData, globalData, sparqlQuery, searchData, $route, $window) {
        $translate.use($routeParams.lang);
        $scope.ifClick = function ()
        {
            if (temporalData.selectedSyllabusA == null)
            {
                alert("Seleccione el Silabo A")
            } else
            if (temporalData.selectedSyllabusB == null)
            {
                alert("Seleccione el Silabo B")
            } else
            {
                similitudPrealmacenada(temporalData.selectedSyllabusA, temporalData.selectedSyllabusB);
                $('html,body').animate({
                    scrollTop: $("#scrollToHere").offset().top
                }, "slow");
            }
        };

        function similitudPrealmacenada(silaboA, silaboB) {
            waitingDialog.show("Calculando Similitud");
            var querySimilitud = globalData.PREFIX

                    + ' CONSTRUCT {?temporalResource <http://ies.linkeddata.ec/vocabulary#value>  ?value }'
                    + ' WHERE {'
                    //+ '     SELECT DISTINCT ?o  (str(?o) as ?label)'
                    + '     SELECT DISTINCT ?temporalResource ?value  '
                    + '         WHERE {'
                    + '             <' + silaboA + '> <http://ies.linkeddata.ec/vocabulary#has_similarity> ?temporalResource. '
                    + '             ?temporalResource <http://ies.linkeddata.ec/vocabulary#has_similar_resource> <' + silaboB + '>. '
                    + '             ?temporalResource <http://ies.linkeddata.ec/vocabulary#value> ?value '
                    + '         } '
                    + ' }';
            $scope.similitud = [];
            sparqlQuery.querySrv({query: querySimilitud}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted && compacted["ies:value"])
                    {
                        var model = {};
                        model["id"] = compacted["@id"];
                        model["value"] = compacted["ies:value"]["@value"];
                        $scope.similitud.push({similitudID: model["id"], similitudValue: model["value"]});

                        applyvaluesSimilitud();
                        waitingDialog.hide();
                    } else
                    {
                        alert("No se ha recuperado información, consulte al administrador")
                         waitingDialog.hide();
                    }
                });
            });
        }
        ;

        function applyvaluesSimilitud() {
            $scope.$apply(function () {
                $scope.similitudFinal = $scope.similitud;
            });
        }
        ;



    }]); //end groupTagsController 
