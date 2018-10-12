
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
                    calcularSimilitud(temporalData.silaboAlmacenadoA, temporalData.silaboAlmacenadoA);
                } else//Entonces Silabo B es un sílabo almacenado en el repositorio.
                {
                    //proceso para analizar ingresado VS almacenado   
                    calcularSimilitud(temporalData.silaboAlmacenadoA, temporalData.silaboAlmacenadoB);
                }
            } else
            if (temporalData.selectedSyllabusID_B == "0000") {//Silabo B: fue ingresado o cargado desde excel
                //proceso para analizar almacenado VS ingresado   
                calcularSimilitud(temporalData.silaboAlmacenadoA, temporalData.silaboAlmacenadoA);
            } else
            {
                //proceso para analizar almacenado VS almacenado   
                similitudPrealmacenada(temporalData.selectedSyllabusID_A, temporalData.selectedSyllabusID_B);
            }
        };

        function similitudPrealmacenada(silaboA, silaboB) {
            waitingDialog.show("Calculando Similitud");
            var querySimilitud = globalData.PREFIX
                    + ' CONSTRUCT {?similarityResource ies:total_value  ?value }'
                    + ' WHERE {'
                    + '     SELECT DISTINCT ?temporalResource ?value  '
                    + '         WHERE {'
                    + '             <' + silaboA + '> ies:has_similarity ?similarityResource. '
                    + '             <' + silaboB + '> ies:has_similarity ?similarityResource. '
                    + '             ?similarityResource ies:total_value ?value '
                    + '         } '
                    + ' }';
            var similitud = [];
            sparqlQuery.querySrv({query: querySimilitud}, function (rdf) {
                jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                    if (compacted && compacted["ies:value"])
                    {
                        var model = {};
                        model["id"] = compacted["@id"];
                        model["value"] = compacted["ies:total_value"]["@value"];
                        similitud = {similitudID: model["id"], similitudValue: model["value"]};

                        applyvaluesSimilitud(similitud);
                        $('html,body').animate({
                            scrollTop: $("#scrollToValue").offset().top
                        }, "slow")
                        waitingDialog.hide();
                    } else
                    {
                        //alert("No se ha recuperado información, consulte al administrador")
                        //son dos silabos del repositorio, que aún no tienen precalculado su similitud.
                        //aquí, esta similitud se calculará en el momento de la consulta.
                        calcularSimilitud(temporalData.silaboAlmacenadoA, temporalData.silaboAlmacenadoB);
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

        function crearJsonDeContenido(contenido) {
            var string_contenido = "";
            for (var i = 0; i < contenido.length; i++)
            {
                if (contenido[i][0] != "" || contenido[i][0] != " ")
                {
                    //leyendo subcapitulos
                    var subcap_string = "";
                    for (var j = 1; j < contenido[i].length; j++)
                    {
                        subcap_string = subcap_string + String.format(globalData.items_template, j, contenido[i][j]);
                        if (j < contenido[i].length - 1)
                        {
                            subcap_string += ",";
                        }
                    }
                    //agregando subcapitulos a cada capitulo, si no tiene subcaps, solo se agrega el capitulo

                    subcap_string != "" ? string_contenido = string_contenido + String.format(globalData.full_capitulos_template, (i + 1), contenido[i][0], subcap_string) :
                            string_contenido = string_contenido + String.format(globalData.capitulos_template, (i + 1), contenido[i][0]);
                    if (i < contenido.length - 1)
                    {
                        string_contenido += ",";
                    }
                }
            }
            return string_contenido;
        }
        function crearJsonDeLista(listaItems) {//objetivos, resultados, etc
            var lista = "";
            _.each(listaItems, function (val, idx) {
                if (val["@value"] != " " && val["@value"] != "")
                {
                    lista += String.format(globalData.items_template, idx, val["@value"]);
                    if (idx < (listaItems.length - 1))
                    {
                        lista += ",";
                    }
                }

            });
            return lista;
        }

        createJSON = function (silaboA, silaboB) {
            var campos = silaboA["schema"]["fields_to_compare"];
            silaboA = silaboA["data"];
            silaboB = silaboB["data"];

            //var jsonToSend = [];
            //jsonToSend.push(createIndividualJSON(silaboA));
            //jsonToSend.push(createIndividualJSON(silaboB));



            return stringToJson(String.format(globalData.silabos_template, stringFieldsBuilder(campos, silaboA), stringFieldsBuilder(campos, silaboB)));
        };

        function stringFieldsBuilder(campos, silabo)
        {
            var builderString = "";
            _.each(campos, function (campo, idx) {
                if (silabo[campo])
                {
                    if (typeof (silabo[campo]) == "string")
                    {
                        if (silabo[campo] != "" && silabo[campo] != " ")
                        {
                            if (builderString != "")
                            {
                                builderString = builderString + ",";
                            }
                            builderString = builderString + String.format(globalData.campos_template, campo, silabo[campo]);
                        }
                    } else if (campo == "content" && silabo[campo].length > 0)
                    {
                        if (builderString != "")
                        {
                            builderString = builderString + ",";
                        }
                        builderString = builderString + String.format(globalData.contenido_template, crearJsonDeContenido(silabo[campo]));
                    } else if (silabo[campo].length > 0)
                    {
                        var listaString = crearJsonDeLista(silabo[campo])
                        if (listaString != "")
                        {
                            if (builderString != "")
                            {
                                builderString = builderString + ",";
                            }
                            builderString = builderString + String.format(globalData.lista_template, campo, listaString);
                        }
                    }
                }

            });
            return builderString;
        }

        function stringToJson(jsonString)
        {
            jsonString = limpiarString(jsonString);
            return JSON.parse(jsonString);
        }
        function limpiarString(jsonString)
        {
            jsonString = jsonString.replace(/\n/g, ' ');
            jsonString = jsonString.replace(/\t/g, ' ');
            jsonString = jsonString.replace(/[|&;$%@<>()+]/g, "");
            return jsonString;
        }




//////////////////
//Hasta quí, un ejemplo de cómo vienen los datos de cada sílabo
//{silaboID: "0000", silaboCHAPTER: capitulos, silaboOBJETIVO: $scope.addObjetivo, silaboDESCRIPCION: $scope.addDescripcion, silaboNAME: $scope.addTitulo, silaboDEPENDENCIA: $scope.addDependencia, silaboDEPENDENCIAID: "0000", silaboINSTITUCION: $scope.addInstitucion, silaboINSTITUCIONID: "0000"};
/////////////////

        function calcularSimilitud(silaboA, silaboB) {//obtener similitud de silabos ingresados manualmente o desde excel

            var jsonobject = createJSON(silaboA, silaboB);
            var similitud = [];
            //similarityQuery.query(jsonobject, function (result) {
            similarityQuery.query(jsonobject, function (result) {
                if (result)
                {
                    var model = {}
                    model["id"] = "1";
                    model["value"] = result["value"]["total"];
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
