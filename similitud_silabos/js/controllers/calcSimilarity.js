
similitudControllers.controller('calcSimilarity', ['$translate', '$routeParams', '$scope', 'similarityQuery', 'temporalData', 'globalData', 'sparqlQuery', 'searchData', '$route', '$window',
    function ($translate, $routeParams, $scope, similarityQuery, temporalData, globalData, sparqlQuery, searchData, $route, $window) {
        $translate.use($routeParams.lang);
        $scope.ifClick = function ()
        {
            if (temporalData.selectedSyllabusID_A == null)
            {
                alert("Seleccione el Silabo A")
            } else
            if (temporalData.selectedSyllabusID_B == null)
            {
                alert("Seleccione el Silabo B")
            } else
            if (temporalData.selectedSyllabusID_A == "0000") { //Silabo A: fue un silabo ingresado o cargado desde excel
                if (temporalData.selectedSyllabusID_B == "0000") {//Silabo B: fue ingresado o cargado desde excel
                    //proceso para analizar ingresado VS ingresado   
                    calcularSimilitud(temporalData.silaboIngresadoA, temporalData.silaboIngresadoB);
                } else//Entonces Silabo B es un sílabo almacenado en el repositorio.
                {
                    //proceso para analizar ingresado VS almacenado   
                    calcularSimilitud(temporalData.silaboIngresadoA, temporalData.silaboAlmacenadoB);
                }
            } else
            if (temporalData.selectedSyllabusID_B == "0000") {//Silabo B: fue ingresado o cargado desde excel
                //proceso para analizar almacenado VS ingresado   
                calcularSimilitud(temporalData.silaboAlmacenadoA, temporalData.silaboIngresadoB);
            } else
            {
                //proceso para analizar almacenado VS almacenado   
                similitudPrealmacenada(temporalData.selectedSyllabusID_A, temporalData.selectedSyllabusID_B);
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
            var similitud = [];
            sparqlQuery.querySrv({query: querySimilitud}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted && compacted["ies:value"])
                    {
                        var model = {};
                        model["id"] = compacted["@id"];
                        model["value"] = compacted["ies:value"]["@value"];
                        similitud = {similitudID: model["id"], similitudValue: model["value"]};

                        applyvaluesSimilitud(similitud);
                        $('html,body').animate({
                            scrollTop: $("#scrollToValue").offset().top
                        }, "slow")
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

        function applyvaluesSimilitud(valor_de_similitud) {
            $('#scrollToValue').css('display', '');
            $scope.safeApply(function () {
                $scope.similitudFinal = valor_de_similitud;
            });
        }
        ;

        function crearJsonDeContenido(silabo){
            var string_contenido = "";
            for (var i = 0; i < silabo["silaboCHAPTER"].length; i++)
            {
        //leyendo subcapitulos
                var subcap_string = "";
                for (var j = 1; j < silabo["silaboCHAPTER"][i].length; j++)
                {
                    subcap_string = subcap_string + String.format(globalData.subcapitulos_json, j, silabo["silaboCHAPTER"][i][j]);
                    if (j < silabo["silaboCHAPTER"][i].length - 1)
                    {
                        subcap_string += ",";
                    }
                }
                //agregando subcapitulos a cada capitulo
                string_contenido = string_contenido + String.format(globalData.capitulos_json, (i + 1), silabo["silaboCHAPTER"][i][0], subcap_string);
                if (i < silabo["silaboCHAPTER"].length - 1)
                {
                    string_contenido += ",";
                }
            }
            return string_contenido;
        }

        createJSON = function (silaboA, silaboB) {
            return String.format(globalData.silabos_json, silaboA["silaboNAME"], silaboA["silaboDESCRIPCION"], crearJsonDeContenido(silaboA), silaboB["silaboNAME"], silaboB["silaboDESCRIPCION"], crearJsonDeContenido(silaboB));
        };

//////////////////
//Hasta quí, un ejemplo de cómo vienen los datos de cada sílabo
//{silaboID: "0000", silaboCHAPTER: capitulos, silaboOBJETIVO: $scope.addObjetivo, silaboDESCRIPCION: $scope.addDescripcion, silaboNAME: $scope.addTitulo, silaboDEPENDENCIA: $scope.addDependencia, silaboDEPENDENCIAID: "0000", silaboINSTITUCION: $scope.addInstitucion, silaboINSTITUCIONID: "0000"};
/////////////////

        function calcularSimilitud(silaboA, silaboB) {//obtener similitud de silabos ingresados manualmente o desde excel

            var jsonString = createJSON(silaboA, silaboB);
            jsonString = jsonString.replace(/\n/g,' ');
            jsonString = jsonString.replace(/\t/g,' ');
            jsonString = jsonString.replace(/[|&;$%@<>()+]/g, "");
            var jsonobject = JSON.parse(jsonString)
            var similitud = [];
            similarityQuery.query(jsonobject, function (result) {
                if (result)
                {
                    var model = {}
                    model["id"] = "1";
                    model["value"] = result["value"];
                    similitud = {similitudID: model["id"], similitudValue: model["value"]};

                    applyvaluesSimilitud(similitud);
                    $('html,body').animate({
                        scrollTop: $("#scrollToValue").offset().top
                    }, "slow")
                    waitingDialog.hide();
                } else//no retrieve data
                {
                    //alert("No se han recuperado datos de las dependencias");
                    waitingDialog.hide();
                }

            }); //end sparqlService



        }
        ; //Fin 


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
