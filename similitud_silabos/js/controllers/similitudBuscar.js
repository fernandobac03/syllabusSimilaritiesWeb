
similitudControllers.controller('similitudBuscar', ['$translate', '$routeParams', '$scope', 'temporalData', 'globalData', 'sparqlQuery', 'searchData', '$route', '$window',
    function ($translate, $routeParams, $scope, temporalData, globalData, sparqlQuery, searchData, $route, $window) {
        //se colocan en null los indicadores de selección de silabos
        temporalData.selectedSyllabusID_B= null;
        
        $translate.use($routeParams.lang);
        $scope.themes = [];

        $scope.buscandoSilabo = function ($event, texto) {

            var query = String.format(globalData.querySilabos, texto);
            var silabosList = [];
            sparqlQuery.querySrv({query: query}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {

                    if (compacted["@graph"])
                    {
                        _.map(compacted["@graph"], function (silb) {
                            var model = {};
                            //model["Publication"] = pub["foaf:publications"]["@id"];
                            model["silabo"] = silb["@id"];
                            model["name"] = silb["aiiso:name"]["@value"];
                            model["dependencia"] = silb["ies:name_academic_unit"]["@value"];
                            silb["ies:name_institution"] ? model["institucion"] = silb["ies:name_institution"]["@value"] : model["institucion"] = "No Data";
                            silabosList.push({silaboID: model["silabo"], silaboNAME: model["name"], silaboDEPENDENCIA: model["dependencia"], silaboINSTITUCION: model["institucion"]});
                        });
                        //applyvaluesSearchSilabos(silabosList);
                        waitingDialog.hide();
                    } else//no retrieve data
                    {
                        //alert("No se han recuperado datos de las dependencias");
                        waitingDialog.hide();
                    }
                    applyvaluesSearchSilabos(silabosList);
                }); //end jsonld.compact
            }); //end sparqlService
        }
        //)
        ; //end buscarSilabo
        function applyvaluesSearchSilabos(silabosList) {
            $scope.$apply(function () {
                $scope.silabos = silabosList;
            });
        }

        $scope.selectedSilaboA = function ($event, selectedSilaboA) {

            $('#searchDialogA').modal('hide');
            temporalData.selectedSyllabusA = selectedSilaboA;
            mostrarFullSilaboA(temporalData.selectedSyllabusA);

        };

        $scope.selectedSilaboB = function ($event, selectedSilaboB) {

            $('#searchDialogB').modal('hide');
            temporalData.selectedSyllabusB = selectedSilaboB;
            mostrarFullSilaboB(temporalData.selectedSyllabusB);

        };

        function fullSilaboMapping(compacted, silaboID)
        {
            var fullSilabo = {};
            var model = {};

            if (compacted["@graph"])
            {
                var contenido = [];
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
            } else
            {
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
                //var capitulo = [];
                //capitulo .push("No se ha encontrado contenido académico")
                //contenido.push(capitulo)
                model["chapter"] = contenido;
            }
            fullSilabo = {id: model["silabo"], creacion: model["creacion"],
                creditos: model["creditos"], content: model["chapter"],
                objectives: model["objective"], description: model["description"],
                name: model["name"], dependencia: model["dependencia"],
                dependenciaID: model["dependenciaID"], institucion: model["institucion"],
                institucionID: model["institucionID"]};
            return  {schema: {fields: ["name", "description", "objectives", "content",
                        "dependencia", "institucion", "creacion", "creditos"],
                    fields_to_compare: ["name", "description", "objectives", "content"]},
                data: fullSilabo};
        }
        function mostrarFullSilaboA(silaboID)
        {
            var query = String.format(globalData.queryFullSilabos, silaboID);
            var fullSilaboData = [];
            sparqlQuery.querySrv({query: query}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted)
                    {
                        fullSilaboData = fullSilaboMapping(compacted, silaboID);
                        applyFullSilaboA(silaboID, fullSilaboData);
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
                        fullSilaboData = fullSilaboMapping(compacted, silaboID);
                        applyFullSilaboB(silaboID, fullSilaboData);
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
        function applyFullSilaboA(silaboID, fullSilaboData)
        {
            $scope.safeApply(function () {
                // $scope.showSilaboA = fullSilabo[0];
                $scope.dataA = fullSilaboData;
                $scope.labelA = "Silabo A";
                temporalData.selectedSyllabusID_A = silaboID;
                temporalData.silaboAlmacenadoA = fullSilaboData;
            });
        }
        ;
        function applyFullSilaboB(silaboID, fullSilaboData)
        {
            $scope.safeApply(function () {
                // $scope.showSilaboB = fullSilabo;
                $scope.dataB = fullSilaboData;
                $scope.labelB = "Silabo B";
                temporalData.selectedSyllabusID_B = silaboID;
                temporalData.silaboAlmacenadoB = fullSilaboData;
            });
        }
        ;

        ////////////////////////////////////////////////
        //////////PROCESO PARA CARGAR DATOS DE SILABOS MANUALMENTE O CARGAR DESDE EXCEL////
        ////////////////////////////////////////////////

        $scope.seleccionarSilaboA = function ($event) { //el usuario ha ingresado los datos de un silabo manualmente o ha cargado un excel
            //obtenerSimilitud();
            var fullSilabo;
            var datosContenido = $scope.datosContenidoTemporal;
            var capitulos = [];
            //var capitulo = {};
            for (var i = 1; i < datosContenido.length; i++)
            {
                var capitulo = {};
                capitulo["@value"] = datosContenido[i][0];
                capitulos.push(capitulo);

            }

            fullSilabo = {id: "0000", creacion: "no data",
                creditos: "no data", content: datosContenido,
                objectives: $scope.addObjetivo, description: $scope.addDescripcion,
                name: $scope.addTitulo, dependencia: $scope.addDependencia,
                dependenciaID: "0000", institucion: $scope.addInstitucion,
                institucionID: "0000"};
            var fullSilaboDataA = {schema: {fields: ["name", "description", "objectives", "content",
                        "dependencia", "institucion", "creacion", "creditos"],
                    fields_to_compare: ["name", "description", "objectives", "content"]},
                data: fullSilabo};

            applyFullSilaboA("0000", fullSilaboDataA);
            $('#addDialogA').modal('hide');
        };
        
          $scope.seleccionarSilaboB = function ($event) { //el usuario ha ingresado los datos de un silabo manualmente o ha cargado un excel
            //obtenerSimilitud();
            var fullSilabo;
            var datosContenido = $scope.datosContenidoTemporal;
            var capitulos = [];
            //var capitulo = {};
            for (var i = 1; i < datosContenido.length; i++)
            {
                var capitulo = {};
                capitulo["@value"] = datosContenido[i][0];
                capitulos.push(capitulo);

            }

            fullSilabo = {id: "0000", creacion: "no data",
                creditos: "no data", content: datosContenido,
                objectives: $scope.addObjetivo, description: $scope.addDescripcion,
                name: $scope.addTitulo, dependencia: $scope.addDependencia,
                dependenciaID: "0000", institucion: $scope.addInstitucion,
                institucionID: "0000"};
            var fullSilaboDataB = {schema: {fields: ["name", "description", "objectives", "content",
                        "dependencia", "institucion", "creacion", "creditos"],
                    fields_to_compare: ["name", "description", "objectives", "content"]},
                data: fullSilabo};

            applyFullSilaboB("0000", fullSilaboDataB);
            $('#addDialogB').modal('hide');
        };

        document.getElementById('inputExcelA').addEventListener("change", function (e) {
            cargarExcelA(e);
        });
         document.getElementById('inputExcelB').addEventListener("change", function (e) {
            cargarExcelB(e);
        });
        function cargarExcelA(e) {
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
                extrayendoDatosDeExcelA(datos);
            }, 1000);
        }
        ;
        
         function cargarExcelB(e) {
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
                extrayendoDatosDeExcelB(datos);
            }, 1000);
        }
        ;
        function extrayendoDatosDeExcelA(datos) {
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
            var infoContenido = $('#contenidoAcademicoDeTablaA');
            var trContenido = $('#trcontenidoA');
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
        ;//Fin extrayendoDatosDeExcer A
        
          function extrayendoDatosDeExcelB(datos) {
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
            var infoContenido = $('#contenidoAcademicoDeTablaB');
            var trContenido = $('#trcontenidoB');
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


        $scope.error = function (e) {
            console.log(e);
        };
        $scope.searchDialogA = function () {
            $('#searchDialogA').modal('show');
        };
        $scope.searchDialogB = function () {
            $('#searchDialogB').modal('show');
        };
        $scope.addDialogA = function () {
            $('#addDialogA').modal('show');
        };
        $scope.addDialogB = function () {
            $('#addDialogB').modal('show');
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
