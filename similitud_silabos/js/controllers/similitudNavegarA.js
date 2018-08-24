
similitudControllers.controller('similitudNavegarA', ['$translate', '$routeParams', '$scope', 'temporalData', 'globalData', 'sparqlQuery', 'searchData', '$route', '$window',
    function ($translate, $routeParams, $scope, temporalData, globalData, sparqlQuery, searchData, $route, $window) {

        $translate.use($routeParams.lang);
        $scope.if_B = function ()
        {
            $('#seleccionandoB').css('display', '');
            $('#otrosilabo').css('display', 'none');
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
        $scope.$watch('selectedInstitutionA', function () {//Funcion para cuando se selecciona la Research Area
            loadDependenciasA($scope.selectedInstitutionA); //query and load resource related with selected theme
        });

        $scope.$watch('selectedInstitutionB', function () {//Funcion para cuando se selecciona la Research Area
            loadDependenciasB($scope.selectedInstitutionB); //query and load resource related with selected theme
        });


        //Para saber cuando el usuario seleccione la dependencia.
        $scope.$watch('selectedDependenciaA', function () {
            loadSilabosA($scope.selectedInstitutionA, $scope.selectedDependenciaA)
            temporalData.selectedDependenciaA = $scope.selectedDependenciaA;
        });

        //Para saber cuando el usuario seleccione la dependencia.
        $scope.$watch('selectedDependenciaB', function () {
            loadSilabosB($scope.selectedInstitutionB, $scope.selectedDependenciaB)
            temporalData.selectedDependenciaB = $scope.selectedDependenciaB;
        });

        $scope.$watch('selectedSilaboA', function () {

            temporalData.selectedSyllabusA = $scope.selectedSilaboA;
            if (typeof temporalData.selectedSyllabusA === 'undefined')
            {
            } else
            {
                $('#contenidoNavegarA').css('display', '');
                $('#otrosilabo').css('display', '');
                mostrarFullSilaboA(temporalData.selectedSyllabusA);
            }
        });
        $scope.$watch('selectedSilaboB', function () {

            temporalData.selectedSyllabusB = $scope.selectedSilaboB;
            if (typeof temporalData.selectedSyllabusB === 'undefined')
            {
            } else
            {
                $('#contenidoNavegarB').css('display', '');
                mostrarFullSilaboB(temporalData.selectedSyllabusB);
                similitudPrealmacenada(temporalData.selectedSyllabusA, temporalData.selectedSyllabusB);

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
                $scope.dependenciasFinalA = dependencias;
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
                $scope.silabosFinalA = listadoSilabos;
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

        function mostrarFullSilaboA(silaboID)
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
                        applyFullSilaboA(fullSilabo);
                        waitingDialog.hide();
                    } else//no retrieve data
                    {
                        //alert("No se han recuperado datos de las dependencias");
                        waitingDialog.hide();
                    }
                }); //end jsonld.compact
            }); //end sparqlService
        }
        ;//Fin mostrarFullSilaboA

        function mostrarFullSilaboB(silaboID)
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
                        applyFullSilaboB(fullSilabo);
                        waitingDialog.hide();
                    } else//no retrieve data
                    {
                        //alert("No se han recuperado datos de las dependencias");
                        waitingDialog.hide();
                    }
                }); //end jsonld.compact
            }); //end sparqlService
        }
        ;//Fin mostrarFullSilaboB


        function applyFullSilaboA(fullSilabo)
        {
            $scope.$apply(function () {
                $scope.showSilaboA = fullSilabo[0];
            });
        }
        ;

        function applyFullSilaboB(fullSilabo)
        {
            $scope.$apply(function () {
                $scope.showSilaboB = fullSilabo[0];
            });
        }
        ;

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
            var similitud = [];
            sparqlQuery.querySrv({query: querySimilitud}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted && compacted["ies:value"])
                    {
                        var model = {};
                        model["id"] = compacted["@id"];
                        model["value"] = compacted["ies:value"]["@value"];
                        similitud.push({similitudID: model["id"], similitudValue: model["value"]});

                        applyvaluesSimilitud(similitud);

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

        function applyvaluesSimilitud(similitud) {
            $("#scrollToValue").css('display', '');
            $('html,body').animate({
                scrollTop: $("#scrollToValue").offset().top}, "slow")
            $scope.$apply(function () {
                $scope.similitudFinal = similitud;
            });
        }
        ;


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
