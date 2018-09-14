function readFromExcel($scope, datos)
{
    var datosGenerales = [];
    var datosContenido = [];
    $scope.datosContenidoTemporal = [];
    //Se extraen los primeros datos fijos
    datosGenerales[0] = datos[1]["h"];
    datosGenerales[1] = datos[3]["h"];
    datosGenerales[2] = datos[5]["h"];
    var numCapitulo = 0;
    var numSubcapitulo = 0;
    var indiceDeInicioDelContenidoAcademico = 10;
    for (var i = indiceDeInicioDelContenidoAcademico; i < datos.length; i++) {
        //console.log(datos[i]);
        if (datos[i]["h"].startsWith("c"))
        {     //se trata de un capitulo
            var datosCapitulosySub = [];
            var chapterid = datos[i]["h"].substr(datos[i]["h"].length - 1);
            if (chapterid == numCapitulo + 1)
            {
                i += 1; //porque en el siguiente elemento esta el titulo del capitulo i
                datosCapitulosySub[datosCapitulosySub.length] = datos[i]["h"];
                numCapitulo++;

                i += 1; //el siguiente elemento debe contener el primer subcapitulo

                do {
                    datosCapitulosySub[datosCapitulosySub.length] = datos[i]["h"];
                    numSubcapitulo++;
                    if (i + 1 == datos.length)
                    {
                        break;
                    }
                    if ((datos[i + 1]["h"].startsWith("c") && datos[i + 1]["h"].endsWith(numCapitulo + 1)))
                    {
                        numSubcapitulo = 0;
                        break;
                    }

                    i++;

                } while (true);//mientras no se encuentre un cpx, donde x es el numero del siguiente capitulo
                datosContenido[datosContenido.length] = datosCapitulosySub;
            }

        }
    }
    return ({"datosGenerales": datosGenerales, "datosContenido": datosContenido})

}
;
        