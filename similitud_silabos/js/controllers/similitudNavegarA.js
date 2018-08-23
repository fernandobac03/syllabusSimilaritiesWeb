
similitudControllers.controller('similitudNavegarA', ['$translate', '$routeParams', '$scope', 'temporalData', 'globalData', 'sparqlQuery', 'searchData', '$route', '$window',
    function ($translate, $routeParams, $scope, temporalData, globalData, sparqlQuery, searchData, $route, $window) {

        $translate.use($routeParams.lang);
        $scope.if_B = function ()
        {
              $('#seleccionandoB').css('display', '');
        };


        $scope.themes = [];
        $scope.institutions = [];
        //waitingDialog.show();
        loadInstitutions();
        function loadInstitutions() {

            //Esta Query no funciona si solo se tiene una institución en el repositorio,
            // es por eso que por el momento se le colocará manualmente el ID y LABEL de la unica institución existente
            var queryInstitutions = globalData.PREFIX

                    + ' CONSTRUCT {?institucion rdfs:label  ?nameinstitucion }'
                    + ' WHERE {'
                    + '     SELECT DISTINCT ?institucion ?nameinstitucion  '
                    + '         WHERE {'
                    + '             ?institucion a <http://purl.org/vocab/aiiso/schema#Institution> .'
                    + '             ?institucion rdfs:label ?nameinstitucion'
                    + '         } '
                    + ' }';


            sparqlQuery.querySrv({query: queryInstitutions}, function (rdf) {
                //   waitingDialog.show();
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted["@graph"])
                    {
                        _.map(compacted["@graph"], function (silb) {
                            var model = {};
                            model["id"] = silb["@id"];
                            model["name"] = silb["rdfs:label"];
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
            });
        }
        ;

        //Cuando el usuario selecciona la institución
        $scope.$watch('selectedInstitution', function () {//Funcion para cuando se selecciona la Research Area
            loadDependenciasA($scope.selectedInstitution); //query and load resource related with selected theme
        });

        $scope.$watch('selectedInstitutionB', function () {//Funcion para cuando se selecciona la Research Area
            loadDependenciasB($scope.selectedInstitutionB); //query and load resource related with selected theme
        });


        //Para saber cuando el usuario seleccione la dependencia.
        $scope.$watch('selectedDependencia', function () {
            loadSilabosA($scope.selectedInstitution, $scope.selectedDependencia)
            temporalData.selectedDependenciaA = $scope.selectedDependencia;
        });

        //Para saber cuando el usuario seleccione la dependencia.
        $scope.$watch('selectedDependenciaB', function () {
            loadSilabosB($scope.selectedInstitution, $scope.selectedDependenciaB)
            temporalData.selectedDependenciaB = $scope.selectedDependenciaB;
        });

        $scope.$watch('selectedSilabo', function () {

            temporalData.selectedSyllabusA = $scope.selectedSilabo;
            if (typeof temporalData.selectedSyllabusA === 'undefined')
            {
            } else
            {
                mostrarFullSilabo(temporalData.selectedSyllabusA);
                $('#contenidoNavegarA').css('display', '');
            }
        });


        function loadDependenciasA(institution)
        {
            var queryDependencias = globalData.PREFIX
                    + 'CONSTRUCT { ?dependencias rdfs:label  ?nameDependencias }'
                    + ' WHERE { '
                    + '    SELECT DISTINCT ?dependencias  ?nameDependencias'
                    + '    WHERE { '
                    + '         ?dependencias <http://ies.linkeddata.ec/vocabulary#is_faculty_of> <' + institution + '> .'
                    + '         ?dependencias rdfs:label ?nameDependencias'
                    + '      }'
                    + ' } ';
            var listadodependencias = [];
            sparqlQuery.querySrv({query: queryDependencias}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted["@graph"])
                    {
                        _.map(compacted["@graph"], function (silb) {
                            var model = {};
                            //model["Publication"] = pub["foaf:publications"]["@id"];
                            model["dependencia"] = silb["@id"];
                            model["name"] = silb["rdfs:label"]["@value"];
                            listadodependencias.push({depenID: model["dependencia"], depenNAME: model["name"]});
                        });
                        applyvaluesDependenciasA(listadodependencias);
                        waitingDialog.hide();
                    } else//no retrieve data
                    {
                        //alert("No se han recuperado datos de las dependencias");
                        waitingDialog.hide();
                    }
                }); //end jsonld.compact
            }); //end sparqlService

        }//end loadDependenciasA


        function loadDependenciasB(institution)
        {
            var queryDependencias = globalData.PREFIX
                    + 'CONSTRUCT { ?dependencias rdfs:label  ?nameDependencias }'
                    + ' WHERE { '
                    + '    SELECT DISTINCT ?dependencias  ?nameDependencias'
                    + '    WHERE { '
                    + '         ?dependencias <http://ies.linkeddata.ec/vocabulary#is_faculty_of> <' + institution + '> .'
                    + '         ?dependencias rdfs:label ?nameDependencias'
                    + '      }'
                    + ' } ';
            var listadodependencias = [];
            sparqlQuery.querySrv({query: queryDependencias}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted["@graph"])
                    {
                        _.map(compacted["@graph"], function (silb) {
                            var model = {};
                            //model["Publication"] = pub["foaf:publications"]["@id"];
                            model["dependencia"] = silb["@id"];
                            model["name"] = silb["rdfs:label"]["@value"];
                            listadodependencias.push({depenID: model["dependencia"], depenNAME: model["name"]});
                        });
                        applyvaluesDependenciasB(listadodependencias);
                        waitingDialog.hide();
                    } else//no retrieve data
                    {
                        //alert("No se han recuperado datos de las dependencias");
                        waitingDialog.hide();
                    }
                }); //end jsonld.compact
            }); //end sparqlService

        }//end loadDependenciasB


        function applyvaluesDependenciasA(dependencias) {
            $scope.$apply(function () {
                $scope.dependenciasFinal = dependencias;
            });
        }

        function applyvaluesDependenciasB(dependencias) {
            $scope.$apply(function () {
                $scope.dependenciasFinalB = dependencias;
            });
        }

        function loadSilabosA(institucion, dependencia) {
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
            var listadoSilabos = [];
            sparqlQuery.querySrv({query: queryDependencias}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted["@graph"])
                    {
                        _.map(compacted["@graph"], function (silb) {
                            var model = {};
                            //model["Publication"] = pub["foaf:publications"]["@id"];
                            model["silabo"] = silb["@id"];
                            model["name"] = silb["rdfs:label"]["@value"];
                            listadoSilabos.push({silaboID: model["silabo"], silaboNAME: model["name"]});
                        });
                        applyvaluesSilabosA(listadoSilabos);
                        waitingDialog.hide();
                    } else//no retrieve data
                    {
                        //alert("No se han recuperado datos de las dependencias");
                        waitingDialog.hide();
                    }
                }); //end jsonld.compact
            }); //end sparqlService
        }// end loadSilabos

        function loadSilabosB(institucion, dependencia) {
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
            var listadoSilabos = [];
            sparqlQuery.querySrv({query: queryDependencias}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted["@graph"])
                    {
                        _.map(compacted["@graph"], function (silb) {
                            var model = {};
                            //model["Publication"] = pub["foaf:publications"]["@id"];
                            model["silabo"] = silb["@id"];
                            model["name"] = silb["rdfs:label"]["@value"];
                            listadoSilabos.push({silaboID: model["silabo"], silaboNAME: model["name"]});
                        });
                        applyvaluesSilabosB(listadoSilabos);
                        waitingDialog.hide();
                    } else//no retrieve data
                    {
                        //alert("No se han recuperado datos de las dependencias");
                        waitingDialog.hide();
                    }
                }); //end jsonld.compact
            }); //end sparqlService
        }// end loadSilabos


        function applyvaluesSilabosA(listadoSilabos) {
            $scope.$apply(function () {
                $scope.silabosFinal = listadoSilabos;
            });
        }
        function applyvaluesSilabosB(listadoSilabos) {
            $scope.$apply(function () {
                $scope.silabosFinalB = listadoSilabos;
            });
        }




        //Para saber cuando el usuario seleccione la dependencia.
        //$scope.$watch('searchText', function () {
        //   buscarSilabo($scope.searchText);
        //})

        $scope.buscandoSilabo = function ($event, texto) {
            //$scope.$watch('searchText', function () {


            var institucionFilter = temporalData.selectedInstitucion ? temporalData.selectedInstitucion : "";
            var dependenciaFilter = temporalData.selectedDependencia ? temporalData.selectedDependencia : "";
            //var buildquery = String.format(query, $scope.searchText);

            var query = String.format(globalData.querySilabos, texto);
            $scope.silabosList = [];
            sparqlQuery.querySrv({query: query}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted["@graph"])
                    {
                        _.map(compacted["@graph"], function (silb) {
                            var model = {};
                            //model["Publication"] = pub["foaf:publications"]["@id"];
                            model["silabo"] = silb["@id"];
                            model["name"] = silb["rdfs:label"]["@value"];
                            model["dependenciaID"] = silb["ies:belonging_to"]["@id"];
                            model["dependencia"] = silb["ies:faculty"]["@value"];
                            model["institucionID"] = silb["ies:has_institution"]["@id"];
                            model["institucion"] = silb["ies:institution"]["@value"];
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
        //)
        ;//end buscarSilabo
        function applyvaluesSearchSilabos() {
            $scope.$apply(function () {
                $scope.silabos = $scope.silabosList;
            });
        }

        function mostrarFullSilabo(silaboID)
        {
            var query = String.format(globalData.queryFullSilabos, silaboID);
            var fullSilabo = [];
            sparqlQuery.querySrv({query: query}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted)
                    {
                        var model = {};
                        //model["Publication"] = pub["foaf:publications"]["@id"];
                        model["silabo"] = compacted["@id"];
                        model["name"] = compacted["rdfs:label"]["@value"];
                        model["description"] = compacted["aiiso:description"]["@value"];
                        model["objective"] = compacted["ies:objective"]
                        model["dependenciaID"] = compacted["ies:belonging_to"]["@id"];
                        model["dependencia"] = compacted["ies:faculty"]["@value"];
                        model["institucionID"] = compacted["ies:has_institution"]["@id"];
                        model["institucion"] = compacted["ies:institution"]["@value"];
                        var objetivos = [];
                        objetivos.push(compacted["ies:objective"]);
                        model["objective"] = compacted["ies:objective"].length > 1 ? compacted["ies:objective"] : objetivos;
                        model["chapter"] = compacted["ies:has_chapter"];
                        fullSilabo.push({silaboID: model["silabo"], silaboCHAPTER: model["chapter"], silaboOBJETIVO: model["objective"], silaboDESCRIPCION: model["description"], silaboNAME: model["name"], silaboDEPENDENCIA: model["dependencia"], silaboDEPENDENCIAID: model["dependenciaID"], silaboINSTITUCION: model["institucion"], silaboINSTITUCIONID: model["institucionID"]});
                        applyFullSilabo(fullSilabo);
                        waitingDialog.hide();
                    } else//no retrieve data
                    {
                        //alert("No se han recuperado datos de las dependencias");
                        waitingDialog.hide();
                    }
                }); //end jsonld.compact
            }); //end sparqlService
        }
        ;
        function applyFullSilabo(fullSilabo)
        {
            $scope.$apply(function () {
                $scope.silabotoShow = fullSilabo[0];
            });
        }
        $scope.searchDialog = function () {
            $('#searchDialog').modal('show');
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



        String.format = function () {
            // The string containing the format items (e.g. "{0}")
            // will and always has to be the first argument.
            var theString = arguments[0];
            // start with the second argument (i = 1)
            for (var i = 1; i < arguments.length; i++) {
                // "gm" = RegEx options for Global search (more than one instance)
                // and for Multiline search
                var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
                theString = theString.replace(regEx, arguments[i]);
            }
            return theString;
        };

    }]); //end groupTagsController 
