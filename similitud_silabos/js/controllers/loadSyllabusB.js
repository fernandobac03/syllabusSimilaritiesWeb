
similitudControllers.controller('loadSyllabusB', ['$translate', '$routeParams', '$scope', 'temporalData', 'globalData', 'sparqlQuery', 'searchData', '$route', '$window',
    function ($translate, $routeParams, $scope, temporalData, globalData, sparqlQuery, searchData, $route, $window) {
        $translate.use($routeParams.lang);


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



        //Cuando el usuario selecciona la institución
        $scope.$watch('selectedInstitution', function () {//Funcion para cuando se selecciona la Research Area
            loadDependencias($scope.selectedInstitution); //query and load resource related with selected theme
        });

        //Para saber cuando el usuario seleccione la dependencia.
        $scope.$watch('selectedDependencia', function () {
            loadSilabos($scope.selectedInstitution, $scope.selectedDependencia)
        });

        $scope.$watch('selectedSilabo', function () {//Funcion para cuando selecciona el filtro para agrupar
            temporalData.selectedSyllabusB = $scope.selectedSilabo;
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

        function loadSilabos(institucion, dependencia) {
            var queryDependencias = globalData.PREFIX
                    + 'CONSTRUCT { ?silabo rdfs:label ?title }'
                    + ' WHERE { '
                    + '     SELECT DISTINCT ?silabo ?title WHERE {  '
                    + '         ?silabo 	<http://ies.linkeddata.ec/vocabulary#belonging_to> <' + dependencia + '>.  '
                    + '         <' + dependencia + '> <http://ies.linkeddata.ec/vocabulary#is_faculty_of> <' + institucion + '>. '
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


        $scope.$watch('selectedSilabo', function () {
            temporalData.selectedSyllabusB = $scope.selectedSilabo;
        });

        $scope.buscandoSilabo = function ($event, texto) {
            buscarSilabo(texto);

        }
        function buscarSilabo(texto) {
            var querysearchSilabos = globalData.PREFIX
                    + 'CONSTRUCT { ?silabo rdfs:label ?title. ?silabo ies:belonging_to ?dependencia. ?silabo ies:faculty ?labeldependencia. ?silabo ies:has_institution ?institucion.  ?silabo ies:institution ?labelinstitucion . }'
                    + ' WHERE { '
                    + '     SELECT DISTINCT ?silabo ?title ?dependencia ?institucion (str(?dependencia) as ?labeldependencia) (str(?institucion) as ?labelinstitucion) WHERE {   '
                    + '         ?silabo      ies:belonging_to   ?dependencia. '
                    + '         ?dependencia ies:is_faculty_of  ?institucion. '
                    + '         ?silabo      ies:abarca         ?subject. '
                    + '         ?subject     a                  aiiso:Subject.  '
                    + '         ?subject     ies:name           ?title . '
                    + '         FILTER REGEX(?title, "' + texto + '", "i") '
                    + '     } '
                    + ' } ';
            $scope.silabosList = [];
            sparqlQuery.querySrv({query: querysearchSilabos}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted["@graph"])
                    {
                        _.map(compacted["@graph"], function (silb) {
                            var model = {};
                            //model["Publication"] = pub["foaf:publications"]["@id"];
                            model["silabo"] = silb["@id"];
                            model["name"] = silb["rdfs:label"]["@value"];
                            model["dependenciaID"] = silb["ies:belonging_to"]["@id"];
                            model["dependencia"] = silb["ies:faculty"];
                            model["institucionID"] = silb["ies:has_institution"]["@id"];
                            model["institucion"] = silb["ies:institution"];
                            $scope.silabosList.push({silaboID: model["silabo"], silaboNAME: model["name"], silaboDEPENDENCIA: model["dependencia"], silaboDEPENDENCIAID: model["dependenciaID"], silaboINSTITUCION: model["institucion"], silaboINSTITUCIONID: model["institucionID"]});
                        });
                        applyvaluesSearchSilabos();
                        waitingDialog.hide();
                    } else//no retrieve data
                    {
                        //alert("No se han recuperado datos de las dependencias");
                        waitingDialog.hide();
                    }
                }); //end jsonld.compact
            }); //end sparqlService
        }
        ;//end buscarSilabo
        function applyvaluesSearchSilabos() {
            //$scope.$apply(function () {
            $scope.silabos = $scope.silabosList;
            //});
        }

        $scope.setSelectedSilabo = function ($event, searchSelectedSilabo, searchSelectedDependencia, searchSelectedInstitucion)
        {
            $('#searchDialog2').modal('hide');
            $scope.tituloB = searchSelectedSilabo["silaboNAME"];
            $scope.institucionB = searchSelectedSilabo["silaboINSTITUCION"];
            $scope.dependenciaB = searchSelectedSilabo["silaboDEPENDENCIA"];
            temporalData.selectedSyllabusB = searchSelectedSilabo["silaboID"];
        };
        $scope.searchDialog = function () {
            $('#searchDialog2').modal('show');
        };


        $scope.safeApply = function (fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof (fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };



    }]); //end groupTagsController 