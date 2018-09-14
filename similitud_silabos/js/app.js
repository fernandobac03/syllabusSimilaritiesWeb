'use strict';

/* App Module */
var similitudApp = angular.module('similitudApp', [
    'pascalprecht.translate',
    'ngSanitize',
    'ngRoute',
    'ui.router',
    'swipe',
    'snapscroll',
    'similitudControllers',
    //'commonDirectives',
    'similitudServices',
]);


similitudApp.service('temporalData', function () {
    this.selectedSyllabusID_A = "";
    this.selectedSyllabusID_B = "";

    this.selectedDependenciaA = "";
    this.selectedDependenciaB = "";
    this.selectedInstitucionA = "";
    this.selectedInstitucionB = "";
    this.temporalDependencias = [];
    this.silaboAlmacenadoA = [];
    this.silaboAlmacenadoB = [];
    this.silaboIngresadoA = [];
    this.silaboIngresadoB = [];
    

});
similitudApp.service('searchData', function () {
    this.authorSearch = null;
    this.areaSearch = null;
    this.genericData = null;
    this.researchArea = "Semantic Web";
    this.selectedTagItem = "Semantic Web";
    this.globalauthor = null;
    this.clustersAuthors = null;
    this.dataRequested = false;
});

similitudApp.service('globalData', function () {
    this.language = "es";
    this.centralGraph = "http://ucuenca.edu.ec/wkhuska";
    this.clustersGraph = "http://ucuenca.edu.ec/wkhuska/clusters";
    this.authorsGraph = "http://ucuenca.edu.ec/wkhuska/authors";
    this.endpointsGraph = "http://ucuenca.edu.ec/wkhuska/endpoints";
    this.externalAuthorsGraph = "http://ucuenca.edu.ec/wkhuska/externalauthors";
    this.translateData = null;

    this.CONTEXT = {
        "uc": "http://ucuenca.edu.ec/ontology#",
        "foaf": "http://xmlns.com/foaf/0.1/",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "bibo": "http://purl.org/ontology/bibo/",
        "dc": "http://purl.org/dc/elements/1.1/",
        "dct": "http://purl.org/dc/terms/",
        "ies": "http://ies.linkeddata.ec/vocabulary#",
        "aiiso": "http://purl.org/vocab/aiiso/schema#",
    };


    this.PREFIX = ' PREFIX bibo: <http://purl.org/ontology/bibo/>'
            + ' PREFIX foaf: <http://xmlns.com/foaf/0.1/>  '
            + ' PREFIX dct: <http://purl.org/dc/terms/> '
            + ' PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> '
            + ' PREFIX uc: <http://ucuenca.edu.ec/ontology#>  '
            + ' PREFIX mm: <http://marmotta.apache.org/vocabulary/sparql-functions#> '
            + ' PREFIX ies: <http://ies.linkeddata.ec/vocabulary#> '
            + ' PREFIX aiiso: <http://purl.org/vocab/aiiso/schema#> '
            ;

    this.querySilabos = this.PREFIX
            + 'CONSTRUCT { '
            + '                 ?silabo rdfs:label ?title. '
            + '                 ?silabo ies:belonging_to ?dependencia. '
            + '                 ?silabo ies:faculty ?nameDependencia. '
            + '                 ?silabo ies:has_institution ?institucion. '
            + '                 ?silabo ies:institution ?nameInstitucion . '
            + '  }'
            + ' WHERE { '
            + '     SELECT DISTINCT ?silabo ?title ?dependencia ?institucion ?nameDependencia ?nameInstitucion WHERE {   '
            + '         ?silabo      ies:belonging_to   ?dependencia. '
            + '         ?dependencia rdfs:label         ?nameDependencia. '
            + '         ?dependencia ies:is_faculty_of  ?institucion. '
            + '         ?institucion rdfs:label         ?nameInstitucion. '
            + '         ?silabo      ies:abarca         ?subject. '
            + '         ?subject     a                  aiiso:Subject.  '
            + '         ?subject     ies:name           ?title . '
            + '         FILTER REGEX(str(?title), "{0}", "i") '
            + '     } '
            + ' } ';


    this.queryFullSilabos = this.PREFIX
            + 'CONSTRUCT { '
            + '                 <{0}> rdfs:label ?title. '
            + '                 <{0}> aiiso:description ?descripcion. '
            + '                 <{0}> ies:objective      ?objetivo. '
            + '                 <{0}> ies:belonging_to ?dependencia. '
            + '                 <{0}> ies:faculty ?nameDependencia. '
            + '                 <{0}> ies:has_institution ?institucion. '
            + '                 <{0}> ies:institution ?nameInstitucion. '
            + '                 <{0}> ies:has_content ?capitulos.   '
            + '                 ?capitulos ies:has_cap ?nameCapitulo. '
            + '                 ?capitulos ies:has_sub ?nameSubcapitulo ' 
            + ' }'
            + ' WHERE { '
            + '     SELECT DISTINCT ?silabo ?nameCapitulo ?nameSubcapitulo ?capitulos ?title ?objetivo ?descripcion ?dependencia ?institucion ?nameDependencia ?nameInstitucion WHERE {   '
            + '         <{0}>      aiiso:description  ?descripcion. '
            + '         <{0}>      ies:objective      ?objetivo. '
            + '         <{0}>      ies:belonging_to   ?dependencia. '
            + '         ?dependencia rdfs:label       ?nameDependencia. '
            + '         ?dependencia ies:is_faculty_of  ?institucion. '
            + '         ?institucion rdfs:label         ?nameInstitucion. '
            + '         <{0}>      ies:abarca         ?subject. '
            + '         ?subject     a aiiso:Subject.  '
            + '         ?subject     ies:name ?title . '
            + '         <{0}>      ies:abarca  ?contenido. '
            + '         ?contenido a <http://ies.linkeddata.ec/vocabulary/ContenidoAcademico>. '
            + '         ?contenido  ies:abarca ?capitulos. '
            + '         ?capitulos rdfs:label ?nameCapitulo.  '
            + '         ?capitulos ies:has_subchapter ?subcap. '
            + '         ?subcap ies:name ?nameSubcapitulo. '  //PROBAR esta consulta 
            + '     }'
            + ' } ';

    this.silabos_json =''
            +'['
            +'   {'
            + '    "id":1,'
            + '    "title":"{0}",'
            + '    "description":"{1}",'
            + '    "contenido":['
            + '        {2}'
            + '     ]'
            + '  },'
            + '  {'
            + '     "id":2,'
            + '     "title":"{3}",'
            + '     "description":"{4}",'
            + '     "contenido":['
            + '         {5}'
            + '     ]'
            + '  }'
            + ']';

    this.capitulos_json = ''
            +'{'
            + '  "id":{0},'
            + '  "title":"{1}",'
            + '  "subchapter":['
            + '     {2}'
            + '   ]'
            + '}';
    this.subcapitulos_json = ''
            +'{'
            + '  "id":{0},'
            + '  "title":"{1}"'
            + '}';

});

similitudApp.config(['$routeProvider',
    function ($routeProvider) {

        $routeProvider.
                when('/:lang/', {
                    templateUrl: '/similitud_silabos/partials/home.html',
                }).
                when('/:lang/:section', {
                    templateUrl: '/similitud_silabos/partials/home.html',
                }).
                when('/:lang/w/search?:text', {//when user search an author in textbox
                    templateUrl: '/similitud_silabos/partials/search.html',
                    //      controller: 'ExploreController'
                }).
                when('/:lang/w/author/:text', {//when user search an author in textbox
                    templateUrl: '/similitud_silabos/partials/search.html',
                }).
                when('/:lang/w/cloud?:text', {
                    templateUrl: '/similitud_silabos/partials/genericPageCloud.html',
                }).
                when('/:lang/w/clusters?:text', {
                    templateUrl: '/similitud_silabos/partials/clustersCloud.html',
                }).
                when('/:lang/data/statistics', {
                    templateUrl: '/similitud_silabos/partials/statistics.html',
                }).
                when('/:lang/b/', {
                    templateUrl: '/similitud_silabos/partials/geoplain.html',
                    controller: 'worldPath'
                }).
                when('/:lang/tags/cloud', {
                    templateUrl: '/similitud_silabos/partials/keywordsCloud.html',
                }).
                when('/:lang/d3/:geoId.json', {
                    templateUrl: '/similitud_silabos/partials/phone-detail.html',
                }).
                when('/:lang/cloud/group-by', {
                    templateUrl: '/similitud_silabos/partials/groupbyCloud.html',
                }).
                when('/:lang/geo-views/sources', {
                    templateUrl: '/similitud_silabos/partials/map.html',
                }).
                when('/:lang/cloud/clusters', {
                    templateUrl: '/similitud_silabos/partials/clusterGroupByCloud.html',
                }).
                when('/:lang/cloud/keywords', {
                    templateUrl: '/similitud_silabos/partials/clusterKeywordsCloud.html',
                }).
                when('/:lang/info/about', {
                    templateUrl: '/similitud_silabos/partials/about.html'
                }).
                when('/:lang/info/help', {
                    templateUrl: '/similitud_silabos/partials/help.html'
                }).
                when('/:lang/info/contact', {
                    templateUrl: '/similitud_silabos/partials/contact.html'
                }).
                when('/:lang/info/sources', {
                    templateUrl: '/similitud_silabos/partials/sources.html'
                }).
                when('/:lang/cepraxi/similitud', {
                    templateUrl: '/similitud_silabos/partials/similitudRepo.html'
                }).
                when('/:lang/cepraxi/navegar', {
                    templateUrl: '/similitud_silabos/partials/similitudNavegar.html'
                }).
//                .
                /*when('/phones/:phoneId', {
                 templateUrl: 'partials/phone-detail.html',
                 controller: 'PhoneDetailCtrl'
                 }).*/
                otherwise({
                    redirectTo: '/es/'
                })
                ;
    }]);

similitudApp.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
    }]);
