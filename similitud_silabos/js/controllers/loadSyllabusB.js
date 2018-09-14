
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
            temporalData.selectedSyllabusID_B = $scope.selectedSilabo;
        });

        $scope.buscandoSilabo = function ($event, texto) {

            var institucionFilter = temporalData.selectedInstitucion ? temporalData.selectedInstitucion : "";
            var dependenciaFilter = temporalData.selectedDependencia ? temporalData.selectedDependencia : "";
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
        ;//end buscarSilabo
        function applyvaluesSearchSilabos() {
            $scope.$apply(function () {
                $scope.silabos = $scope.silabosList;
            });
        }

        $scope.setSelectedSilabo = function ($event, setSelectedSilabo)
        {
            $('#searchDialog2').modal('hide');
            $('#contenidoB').css('display', '');
            $('#scrollToValue').css('display', 'none');
            var query = String.format(globalData.queryFullSilabos, setSelectedSilabo["silaboID"]);
            var fullSilabo = [];
            sparqlQuery.querySrv({query: query}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted)
                    {
                        var model = {};
                        var contenido = [];

                        _.map(compacted["@graph"], function (silb) {

                            if (silb["@id"] == setSelectedSilabo["silaboID"])
                            {
                                //model["Publication"] = pub["foaf:publications"]["@id"];
                                model["silabo"] = silb["@id"];
                                model["name"] = silb["rdfs:label"]["@value"];
                                model["description"] = silb["aiiso:description"]["@value"];
                                model["objective"] = silb["ies:objective"]
                                model["dependenciaID"] = silb["ies:belonging_to"]["@id"];
                                model["dependencia"] = silb["ies:faculty"]["@value"];
                                model["institucionID"] = silb["ies:has_institution"]["@id"];
                                model["institucion"] = silb["ies:institution"]["@value"];
                                var objetivos = [];
                                objetivos.push(silb["ies:objective"]);
                                model["objective"] = silb["ies:objective"].length > 1 ? silb["ies:objective"] : objetivos;
                            } else
                            {
                                var capitulo = [];
                                capitulo.push(silb["ies:has_cap"]["@value"]);
                                for (var i = 0; i < silb["ies:has_sub"].length; i++)
                                {
                                    capitulo.push(silb["ies:has_sub"][i]);
                                }
                                contenido.push(capitulo);
                            }

                        });
                        model["chapter"] = contenido;
                        fullSilabo = {silaboID: model["silabo"], silaboCHAPTER: model["chapter"], silaboOBJETIVO: model["objective"], silaboDESCRIPCION: model["description"], silaboNAME: model["name"], silaboDEPENDENCIA: model["dependencia"], silaboDEPENDENCIAID: model["dependenciaID"], silaboINSTITUCION: model["institucion"], silaboINSTITUCIONID: model["institucionID"]};
                        temporalData.silaboAlmacenadoB = fullSilabo;
                        temporalData.selectedSyllabusID_B = setSelectedSilabo["silaboID"];
                        applyFullSilabo(fullSilabo);
                        waitingDialog.hide();
                    } else//no retrieve data
                    {
                        //alert("No se han recuperado datos de las dependencias");
                        waitingDialog.hide();
                    }
                }); //end jsonld.compact
            }); //end sparqlService

            $('html,body').animate({
                scrollTop: $("#scrollToCalc").offset().top
            }, "slow");
        };

        function applyFullSilabo(fullSilabo)
        {
            $scope.safeApply(function () {
                $scope.silabotoShow = fullSilabo;
            });
        }


        ////////////////////////////////////////////////
        //////////PROCESO PARA CARGAR DATOS DE SILABOS MANUALMENTE O CARGAR DESDE EXCEL////
        ////////////////////////////////////////////////



        $scope.seleccionarSilabo = function ($event) { //el usuario ha ingresado los datos de un silabo manualmente o ha cargado un excel
            //obtenerSimilitud();
            var fullSilabo = [];
            var datosContenido = $scope.datosContenidoTemporal;

            var capitulos = [];
            //var capitulo = {};
            for (var i = 1; i < datosContenido.length; i++)
            {
                var capitulo = {};
                capitulo["@value"] = datosContenido[i][0];
                capitulos.push(capitulo);

            }

            fullSilabo = {silaboID: "0000", silaboCHAPTER: datosContenido, silaboOBJETIVO: $scope.addObjetivo, silaboDESCRIPCION: $scope.addDescripcion, silaboNAME: $scope.addTitulo, silaboDEPENDENCIA: $scope.addDependencia, silaboDEPENDENCIAID: "0000", silaboINSTITUCION: $scope.addInstitucion, silaboINSTITUCIONID: "0000"};

            //se almacena temporalmente para enviar a calcular la similitud.
            temporalData.silaboIngresadoB = fullSilabo;

            //para saber que es un sílabo que no se encuentra en el repositorio.
            temporalData.selectedSyllabusID_B = "0000";


            applyFullSilabo(fullSilabo);
            $('#addDialog2').modal('hide');
            $('#contenidoB').css('display', '');

        };

        document.getElementById('inputExcel2').addEventListener("change", function (e) {
            cargarExcel(e);
        });
        function cargarExcel(e) {
            // do some asynchronous work
            // and when the asynchronous stuff is complete

            var files = e.target.files, file;
            if (!files || files.length == 0)
                return;
            file = files[0];
            var File;
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                var filename = file.name;
                // call 'xlsx' to read the file
                var binary = "";
                var bytes = new Uint8Array(e.target.result);
                var length = bytes.byteLength;
                for (var i = 0; i < length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                File = XLSX.read(binary, {type: 'binary', cellDates: true, cellStyles: true});
            };
            fileReader.readAsArrayBuffer(file);
            setTimeout(function () {
                var datos = File["Strings"];
                extrayendoDatosDeExcel(datos);
            }, 1000);
        }
        ;
        function extrayendoDatosDeExcel(datos) {
            var allData = readFromExcel($scope, datos);


            //lo siguiente es para mostrar en pantalla, creando el html necesario
            var datosGenerales = allData["datosGenerales"];
            var datosContenido = allData["datosContenido"];
            $scope.datosContenidoTemporal = datosContenido;

            $scope.$apply(function () {
                $scope.addTitulo = datosGenerales[0];
                $scope.addDescripcion = datosGenerales[1];
                $scope.addDependencia = datosGenerales[2];

            });

            //aqui se crean los input para los capitulos y subcapitulos.
            var infoContenido = $('#contenidoAcademicoDeTabla2');
            var trContenido = $('#trcontenido2');
            trContenido.html('');

            for (var i = 0; i < datosContenido.length; i++)
            {
                datosContenido[i][0];
                var tr = $('<tr>');
                var td = $('<td>');
                var capituloTd = $('<td>').text('Capítulo ' + (i + 1) + ' *');
                //var capituloInput = $('<input style="width: 100%" ng-model="addCapitulo' + (i + 1) + '" ng-change="" value="' + datosContenido[i][0] + '"/><br>');
                var capituloInput = $('<input style="width: 100%" ng-model="addCapitulo[' + (i) + '][0]" ng-change="" value="' + datosContenido[i][0] + '"/><br>');
                td.append(capituloInput);
                tr.append(capituloTd); //col1
                tr.append(td); //col2
                var subCapituloTd = $('<td style="width: 11%"> ').text('SubCapítulos ' + (i + 1));
                tr.append(subCapituloTd); //col3
                var td = $('<td style="width: 35%">');
                for (var j = 1; j < datosContenido[i].length; j++)
                {
                    //var subCapituloInput = $('<input style="width: 100%" ng-model="addSubCapitulo' + (i + 1) + '" ng-change="" value="' + datosContenido[i][j] + '" /><br>');
                    var subCapituloInput = $('<input style="width: 100%" ng-model="addCapitulo[' + (i) + '][' + (j) + ']" ng-change="" value="' + datosContenido[i][j] + '" /><br>');
                    td.append(subCapituloInput);
                }
                tr.append(td); //col4
                infoContenido.append(tr);
            }
        }
        ;




        ////////////////////////////////////////////////
        //////////FIN DEL PROCESO PARA CARGAR DATOS DE SILABOS MANUALMENTE O CARGAR DESDE EXCEL////
        ////////////////////////////////////////////////






        $scope.searchDialog = function () {
            $('#searchDialog2').modal('show');
        };
        $scope.addDialog = function () {
            $('#addDialog2').modal('show');
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
