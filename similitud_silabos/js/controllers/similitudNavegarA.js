
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

                    + ' CONSTRUCT {?institucion aiiso:name  ?nameinstitucion }'
                    + ' WHERE {'
                    + '     SELECT DISTINCT ?institucion ?nameinstitucion  '
                    + '         WHERE {'
                    + '             ?institucion a aiiso:Institution .'
                    + '             ?institucion aiiso:name ?nameinstitucion'
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
                            model["name"] = silb["aiiso:name"]["@value"];
                            $scope.institutions.push({instID: model["id"], instNAME: model["name"]});
                        });
                        applyvalues();
                        waitingDialog.hide();
                    } else
                    { //unicamente si no existe ninguna institucion en el repositorio, no debería pasar
                        var model = {};
                        model["id"] = compacted["@id"];
                        model["name"] = compacted["aiiso:name"]["@value"];
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

        function loadDependenciasMapping(compacted)
        {
            var listadodependencias = [];
            _.map(compacted["@graph"], function (silb) {
                var model = {};
                //model["Publication"] = pub["foaf:publications"]["@id"];
                model["dependencia"] = silb["@id"];
                model["name"] = silb["aiiso:name"]["@value"];
                listadodependencias.push({depenID: model["dependencia"], depenNAME: model["name"]});
            });
            return listadodependencias;

        }
        function loadDependenciasA(institution)
        {
            var queryDependencias = String.format(globalData.queryDependencias, institution);
            var listadodependencias = [];
            sparqlQuery.querySrv({query: queryDependencias}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted["@graph"])
                    {
                        listadodependencias = loadDependenciasMapping(compacted)
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
            var queryDependencias = String.format(globalData.queryDependencias, institution);
            var listadodependencias = [];
            sparqlQuery.querySrv({query: queryDependencias}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted["@graph"])
                    {
                        listadodependencias = loadDependenciasMapping(compacted)
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

        function loadSilabosMapping(compacted)
        {
            var listadoSilabos = [];
            _.map(compacted["@graph"], function (silb) {
                var model = {};
                //model["Publication"] = pub["foaf:publications"]["@id"];
                model["silabo"] = silb["@id"];
                model["name"] = silb["aiiso:name"]["@value"];
                model["creation"] = silb["ies:date_creation"].substring(0, 10);
                listadoSilabos.push({silaboID: model["silabo"], silaboNAME: model["name"], silaboCREATION: model["creation"]});
            });
            return listadoSilabos;
        }

        function loadSilabosA(institucion, dependencia) {
            var querysilabos = String.format(globalData.queryLoadSilabos, dependencia, institucion);
            var listadoSilabos = [];
            sparqlQuery.querySrv({query: querysilabos}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted["@graph"])
                    {
                        listadoSilabos = loadSilabosMapping(compacted);
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
            var querysilabos = String.format(globalData.queryLoadSilabos, dependencia, institucion);
            var listadoSilabos = [];
            sparqlQuery.querySrv({query: querysilabos}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted["@graph"])
                    {
                        listadoSilabos = loadSilabosMapping(compacted);
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
        ; //end buscarSilabo
        function applyvaluesSearchSilabos() {
            $scope.$apply(function () {
                $scope.silabos = $scope.silabosList;
            });
        }


        function mostrarFullSilaboMapping(compacted, silaboID)
        {
            var fullSilabo = {};
            if (compacted["@graph"])
            {
                var contenido = [];
                var model = {};
                _.map(compacted["@graph"], function (silabo) {
                    if (silabo["@id"] == silaboID)
                    {
                        model["silabo"] = silabo["@id"];
                        model["name"] = silabo["aiiso:name"]["@value"];
                        model["description"] = silabo["aiiso:description"]["@value"];
                        model["dependenciaID"] = silabo["ies:is_taught_by"]["@id"];
                        model["dependencia"] = silabo["ies:name_academic_unit"]["@value"];
                        model["institucionID"] = silabo["ies:has_institution"]["@id"];
                        model["institucion"] = silabo["ies:name_institution"]["@value"];
                        model["creacion"] = silabo["ies:date_creation"].substring(0, 10);
                        model["creditos"] = silabo["ies:credits"];
                        model["institucion"] = silabo["ies:name_institution"]["@value"];
                        model["objective"] = silabo["ies:objective"]
                        var objetivos = [];
                        objetivos.push(silabo["ies:objective"]);
                        model["objective"] = silabo["ies:objective"].length > 1 ? silabo["ies:objective"] : objetivos;
                        model["chapter"] = silabo["ies:chapter"];
                    } else
                    {
                        var capitulo = [];
                        capitulo.push(silabo["ies:chapter"]["@value"]);
                        for (var i = 0; i < silabo["ies:subchapter"].length; i++)
                        {
                            capitulo.push(silabo["ies:subchapter"][i]["@value"]);
                        }
                        //}
                        contenido.push(capitulo);
                    }
                    model["chapter"] = contenido;
                });
                fullSilabo = {silaboID: model["silabo"], silaboCREACION: model["creacion"], silaboCREDITOS: model["creditos"], silaboCHAPTER: model["chapter"], silaboOBJETIVO: model["objective"], silaboDESCRIPCION: model["description"], silaboNAME: model["name"], silaboDEPENDENCIA: model["dependencia"], silaboDEPENDENCIAID: model["dependenciaID"], silaboINSTITUCION: model["institucion"], silaboINSTITUCIONID: model["institucionID"]};
            } else
            {
                var model = {};
                var contenido = [];
                model["silabo"] = compacted["@id"];
                model["name"] = compacted["aiiso:name"]["@value"];
                model["description"] = compacted["aiiso:description"]["@value"];
                model["dependenciaID"] = compacted["ies:is_taught_by"]["@id"];
                model["dependencia"] = compacted["ies:name_academic_unit"]["@value"];
                model["institucionID"] = compacted["ies:has_institution"]["@id"];
                model["institucion"] = compacted["ies:name_institution"]["@value"];
                model["creacion"] = compacted["ies:date_creation"].substring(0, 10);
                model["creditos"] = compacted["ies:credits"];
                model["objective"] = compacted["ies:objective"]
                var objetivos = [];
                objetivos.push(compacted["ies:objective"]);
                model["objective"] = compacted["ies:objective"].length > 1 ? compacted["ies:objective"] : objetivos;
                var capitulo = [];
                capitulo.push("No se encontró contenido académico")
                contenido.push(capitulo)
                model["chapter"] = contenido;
                fullSilabo = {silaboID: model["silabo"], silaboCREACION: model["creacion"], silaboCREDITOS: model["creditos"], silaboCHAPTER: model["chapter"], silaboOBJETIVO: model["objective"], silaboDESCRIPCION: model["description"], silaboNAME: model["name"], silaboDEPENDENCIA: model["dependencia"], silaboDEPENDENCIAID: model["dependenciaID"], silaboINSTITUCION: model["institucion"], silaboINSTITUCIONID: model["institucionID"]};

            }
            return  {schema: {fields: [ "silaboNAME", "silaboDESCRIPCION", "silaboOBJETIVO", "silaboCHAPTER", "silaboDEPENDENCIA", "silaboINSTITUCION", "silaboCREACION", "silaboCREDITOS"]}, data: fullSilabo};
        }
        function mostrarFullSilaboA(silaboID)
        {
            var query = String.format(globalData.queryFullSilabos, silaboID);
            var fullSilaboData = [];
            sparqlQuery.querySrv({query: query}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted)
                    {
                        fullSilaboData = mostrarFullSilaboMapping(compacted, silaboID);
                        applyFullSilaboA(fullSilaboData);
                        waitingDialog.hide();
                    } else//no retrieve data
                    {
                        //alert("No se han recuperado datos de las dependencias");
                        waitingDialog.hide();
                    }
                }); //end jsonld.compact
            }); //end sparqlService
        }
        ; //Fin mostrarFullSilaboA

        function mostrarFullSilaboB(silaboID)
        {
            var query = String.format(globalData.queryFullSilabos, silaboID);
            var fullSilaboData = [];
            sparqlQuery.querySrv({query: query}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted)
                    {
                        fullSilaboData = mostrarFullSilaboMapping(compacted, silaboID);
                        applyFullSilaboB(fullSilaboData);
                        waitingDialog.hide();
                    } else//no retrieve data
                    {
                        //alert("No se han recuperado datos de las dependencias");
                        waitingDialog.hide();
                    }
                }); //end jsonld.compact
            }); //end sparqlService
        }
        ; //Fin mostrarFullSilaboB


        function applyFullSilaboA(fullSilaboData)
        {
            $scope.$apply(function () {
                // $scope.showSilaboA = fullSilabo[0];
                $scope.dataA = fullSilaboData;
            });
        }
        ;
        function applyFullSilaboB(fullSilaboData)
        {
            $scope.$apply(function () {
                // $scope.showSilaboB = fullSilabo;
                $scope.dataB = fullSilaboData;
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
