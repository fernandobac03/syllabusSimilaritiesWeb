
similitudControllers.controller('loadSyllabusA', ['$translate', '$routeParams', '$scope', 'temporalData', 'globalData', 'sparqlQuery', 'searchData', '$route', '$window',
    function ($translate, $routeParams, $scope, temporalData, globalData, sparqlQuery, searchData, $route, $window) {
        $translate.use($routeParams.lang);


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
                    //+ '     SELECT DISTINCT ?o  (str(?o) as ?label)'
                    + '     SELECT DISTINCT ?institucion ?nameinstitucion  '
                    + '         WHERE {'
                    //+ '             ?s <http://ies.linkeddata.ec/vocabulary#has_similarity> ?o'
                    + '             ?institucion a <http://purl.org/vocab/aiiso/schema#Institution> .'
                    + '             ?institucion rdfs:label ?nameinstitucion'
                    + '         } '
                    + ' }';

            //        + ' CONSTRUCT { ?keyword rdfs:label ?key } '
            //       + ' WHERE { '
            //      + '     SELECT  (count(?pubs) as ?total) ' //(SAMPLE(?keyword) as ?keywordp) (SAMPLE(?key) as ?keyp)  '
            //      + '     WHERE { '
            //      + '         graph <'+globalData.centralGraph+'> {'
            //      + '             ?subject foaf:publications ?pubs. '
            //      //+ '           ?subject dct:subject ?key. '
            //      + '             ?pubs bibo:Quote ?key. '
            //      + '             BIND(REPLACE(?key, " ", "_", "i") AS ?unickey). '
            //      + '             BIND(IRI(?unickey) as ?keyword) '
            //      + '         }'
            //      + '     } '
            //      + '     GROUP BY ?keyword  ?key '
            //+ '     GROUP BY ?subject'

            //       + '     HAVING(?total > 4) ' //si la keyword aparece en mas de 5 publicaciones
            //      + '}';




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
            loadDependencias($scope.selectedInstitution); //query and load resource related with selected theme
            //      var authorInfo = $('div.tree-node-author-info .authorsByClusters');
            //      authorInfo.html('');
            //      authorInfo = $('div.tree-node-author-info .authorsByPublications');
            //      authorInfo.html('');
            //      var title = $('div#scrollToHere.col-md-12 div.col-md-12.head-info');
            //      title.html('');
        });

        //Para saber cuando el usuario seleccione la dependencia.
        $scope.$watch('selectedDependencia', function () {
            loadSilabos($scope.selectedInstitution, $scope.selectedDependencia)
            temporalData.selectedDependencia = $scope.selectedDependencia;
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
                        _.map(compacted["@graph"], function (silb) {
                            var model = {};
                            //model["Publication"] = pub["foaf:publications"]["@id"];
                            model["dependencia"] = silb["@id"];
                            model["name"] = silb["rdfs:label"];
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
                        _.map(compacted["@graph"], function (silb) {
                            var model = {};
                            //model["Publication"] = pub["foaf:publications"]["@id"];
                            model["silabo"] = silb["@id"];
                            model["name"] = silb["rdfs:label"]["@value"];
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
            temporalData.selectedSyllabusA = $scope.selectedSilabo;
        });



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

        $scope.setSelectedSilabo = function ($event, setSelectedSilabo)
        {

            $('#searchDialog').modal('hide');
            $('#contenidoA').css('display', '');

            var query = String.format(globalData.queryFullSilabos, setSelectedSilabo["silaboID"]);
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
                        model["objective"] = compacted["ies:objective"].length > 1 ? compacted["ies:objective"]: objetivos;
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


            temporalData.selectedSyllabusA = setSelectedSilabo["silaboID"];


            // loadDependencias(searchSelectedInstitucion);
            //loadSilabos(searchSelectedInstitucion, searchSelectedDependencia);
            //$scope.selectedInstitucion = searchSelectedInstitucion;
            //document.getElementById('institutionA').options.selectedItem = searchSelectedInstitucion;
            //$scope.selectedDependencia = searchSelectedDependencia;
            //$scope.selectedSilabo = searchSelectedSilabo;

        };
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
