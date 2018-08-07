
similitudControllers.controller('loadSyllabusB', ['$translate', '$routeParams', '$scope', 'globalData', 'sparqlQuery', 'searchData', '$route', '$window',
    function ($translate, $routeParams, $scope, temporalData, globalData, sparqlQuery, searchData, $route, $window) {
        $translate.use($routeParams.lang);
        var selected = null;
        $scope.ifClick = function (value)
        {
            //selected = value; //searchData.genericData = value;
            $scope.todos = [];
            var model = {};
            _.map(value, function (pub) {

                model["id"] = pub["@id"];
                model["title"] = pub["dct:title"];
                model["abstract"] = pub["bibo:abstract"] ? pub["bibo:abstract"] : "";
                model["uri"] = pub["bibo:uri"] ? pub["bibo:uri"]["@id"] : "";
                model["keywords"] = pub["bibo:Quote"] ? pub["bibo:Quote"] : "";

                $scope.todos.push({id: model["id"], title: model["title"], abstract: model["abstract"], uri: model["uri"], keywords: model["keywords"]});

            });
            $scope.data = {schema: {"context": globalData.CONTEXT, fields: ["rdfs:label", "uc:total"]}, data: value};
            $scope.loadData();
            if ($scope.todos[0]) {
                $scope.searchAuthor($scope.todos[0]);
            }
            //$window.location.hash = '/' + $routeParams.lang + "/w/publication";
            $('html,body').animate({
                scrollTop: $("#scrollToHere").offset().top
            }, "slow");
        };

        $('html,body').animate({
            scrollTop: $("#scrollToTop").offset().top
        }, "slow");
        $scope.$watch('searchData.areaSearch', function (newValue, oldValue, scope) {

            if (searchData.areaSearch) {
                var areaSearch = searchData.areaSearch["@graph"];
                if (areaSearch) {
                    //    if (authorSearch.length > 1) {
                    var candidates = _.map(areaSearch, function (area) {
                        var model = {};
                        //var keys = Object.keys(author);
                        model["id"] = area["@id"];
                        model["label"] = area["rdfs:label"];
                        return model;
                    });
                    $scope.candidates = candidates;
                    $scope.selectedAuthor = function ($event, label) {
                        $('#searchResults').modal('hide');
                        searchData.researchArea = label;
                        $scope.selectedItem = label;
                    };
                    waitingDialog.hide();
                    $('#searchResults').modal('show');
                }//End if(authorSearch)
                else
                {
                    alert("Information not found");
                    $window.location.hash = "/";
                    waitingDialog.hide();
                }

            }

        }, true);
        if (!searchData.allInstitutions)
        {
            $scope.themes = [];
            $scope.institutions = [];
            //waitingDialog.show();
            executeLoadInstitutions();
            function executeLoadInstitutions() {

                //Esta Query no funciona si solo se tiene una institución en el repositorio,
                // es por eso que por el momento se le colocará manualmente el ID y LABEL de la unica institución existente
                var queryInstitutions = globalData.PREFIX

                        + ' CONSTRUCT {?o rdfs:label  "Universidad de Cuenca" }'
                        + ' WHERE {'
                        //+ '     SELECT DISTINCT ?o  (str(?o) as ?label)'
                        + '     SELECT DISTINCT ?o  '
                        + '         WHERE {'
                        //+ '             ?s <http://ies.linkeddata.ec/vocabulary#has_similarity> ?o'
                        + '             ?s <http://ies.linkeddata.ec/vocabulary#is_faculty_of> ?o'
                        + '         } '
                        + ' }';

                sparqlQuery.querySrv({query: queryInstitutions}, function (rdf) {
                    //   waitingDialog.show();
                    jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                        if (compacted["@graph"])
                        {
                            _.map(compacted["@graph"], function (pub) {
                                var model = {};
                                model["id"] = pub["@id"];
                                model["name"] = pub["rdfs:label"];
                                $scope.institutions.push({instID: model["id"], instNAME: model["name"]});
                            });
                            applyvalues();
                            waitingDialog.hide();
                        } else
                        {
                            var model = {};
                            model["id"] = "http://ies.linkeddata.ec/institution/institution_Universidad%20de%20Cuenca";
                            model["name"] = "Universidad de Cuenca";
                            $scope.institutions.push({instID: model["id"], instNAME: model["name"]});
                            applyvaluesInstitutions();
                            //alert("No se han recuperado Instituciones");
                            waitingDialog.hide();
                        }
                    });
                });
            }

            function applyvaluesInstitutions() {
                $scope.$apply(function () {
                    $scope.institutionsFinal = $scope.institutions;
                    $scope.selectedItem = searchData.researchArea; // Selected Research Area Filter Default
                    searchData.allkeywords = $scope.institutions;
                });
            }
            ;
        } else
        {
            $scope.relatedthemes = searchData.allkeywords;
            $scope.selectedItem = searchData.researchArea;
        } //  end  if (!searchData.allkeywords)



        //Cuando el usuario selecciona la institución
        $scope.$watch('selectedInstitution', function () {//Funcion para cuando se selecciona la Research Area
            loadDependencias($scope.selectedInstitution); //query and load resource related with selected theme
        });
        
        //Para saber cuando el usuario seleccione la dependencia.
        $scope.$watch('selectedDependencia', function () {
            loadSilabos($scope.selectedInstitution, $scope.selectedDependencia)
        });
        
        
   
        function loadDependencias(institution)
        {
            var queryDependencias = globalData.PREFIX
                    + 'CONSTRUCT { ?dependencias rdfs:label  ?label }'
                    + ' WHERE { '
                    + '    SELECT DISTINCT ?dependencias  (str(?dependencias) as ?label)'
                    + '    WHERE { '
                    + '       ?dependencias <http://ies.linkeddata.ec/vocabulary#is_faculty_of> <' + institution + '>'
                    + '      }'
                    + ' } ';
            $scope.listadodependencias = [];
            sparqlQuery.querySrv({query: queryDependencias}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted["@graph"])
                    {
                        _.map(compacted["@graph"], function (pub) {
                            var model = {};
                            //model["Publication"] = pub["foaf:publications"]["@id"];
                            model["dependencia"] = pub["@id"];
                            model["name"] = pub["rdfs:label"];                       
                            $scope.listadodependencias.push({depenID: model["dependencia"], depenNAME: model["name"]});
                        });
                        applyvaluesDependencias();
                        waitingDialog.hide();
                    } else//no retrieve data
                    {
                        //alert("No se han recuperado datos de las dependencias");
                        waitingDialog.hide();
                    }
                }); //end jsonld.compact
            }); //end sparqlService
        }//end loadDependencias
        
        function applyvaluesDependencias() {
                $scope.$apply(function () {
                    $scope.dependenciasFinal = $scope.listadodependencias;
                 });
        }
            
        function loadSilabos(institucion, dependencia){
            var queryDependencias = globalData.PREFIX
                    + 'CONSTRUCT { ?silabo rdfs:label ?title }'
                    + ' WHERE { '
                    + '     SELECT DISTINCT ?silabo ?title WHERE {  '
                    + '         ?silabo 	<http://ies.linkeddata.ec/vocabulary#belonging_to> <'+dependencia+'>.  '
                    + '         <'+dependencia+'> <http://ies.linkeddata.ec/vocabulary#is_faculty_of> <'+institucion+'>. '
                    + '         ?silabo <http://ies.linkeddata.ec/vocabulary#abarca> ?subject. '
                    + '         ?subject a <http://purl.org/vocab/aiiso/schema#Subject>. '
                    + '         ?subject <http://ies.linkeddata.ec/vocabulary#name> ?title '
                    + '     } '
                    + ' } ';
            $scope.listadoSilabos = [];
            sparqlQuery.querySrv({query: queryDependencias}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted["@graph"])
                    {
                        _.map(compacted["@graph"], function (pub) {
                            var model = {};
                            //model["Publication"] = pub["foaf:publications"]["@id"];
                            model["silabo"] = pub["@id"];
                            model["name"] = pub["rdfs:label"]["@value"];                       
                            $scope.listadoSilabos.push({silaboID: model["silabo"], silaboNAME: model["name"]});
                        });
                        applyvaluesSilabos();
                        waitingDialog.hide();
                    } else//no retrieve data
                    {
                        //alert("No se han recuperado datos de las dependencias");
                        waitingDialog.hide();
                    }
                }); //end jsonld.compact
            }); //end sparqlService
       }// end loadSilabos
       function applyvaluesSilabos() {
                $scope.$apply(function () {
                    $scope.silabosFinal = $scope.listadoSilabos;
                 });
        }
        
        $scope.$watch('selectedSyllabus', function () {//Funcion para cuando selecciona el filtro para agrupar
            temporalData.selectedSyllabusB = selectedSyllabus;
        });
         
       
    }]); //end groupTagsController 
