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
    this.selectedSyllabusID_A = null;
    this.selectedSyllabusID_B = null;

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
    this.translateData = null;

    this.CONTEXT = {
        "foaf": "http://xmlns.com/foaf/0.1/",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "bibo": "http://purl.org/ontology/bibo/",
        "ies": "http://ies.linkeddata.ec/syllabusOntology/vocabulary#",
        "aiiso": "http://purl.org/vocab/aiiso/schema#",
    };


    this.PREFIX = ' PREFIX bibo: <http://purl.org/ontology/bibo/>'
            + ' PREFIX foaf: <http://xmlns.com/foaf/0.1/>  '
            + ' PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> '
            + ' PREFIX ies: <http://ies.linkeddata.ec/syllabusOntology/vocabulary#> '
            + ' PREFIX aiiso: <http://purl.org/vocab/aiiso/schema#> ';

    this.querySilabos = this.PREFIX
            + 'CONSTRUCT { '
            + '                 ?silabo aiiso:name ?nombreAsignatura. '
            + '                 ?silabo ies:name_academic_unit ?nombreDependencia. '
            + '                 ?silabo ies:name_institution ?nombreInstitucion. '
            + ' }'
            + ' WHERE { '
            + ' SELECT (sample(?silaboTemp) as ?silabo) ?nombreAsignatura (max(?nombreDependenciaTemp) as ?nombreDependencia) '
            + '                                      (max(?nombreInstitucionTemp) as ?nombreInstitucion)'
            + ' WHERE { '
            + '         ?silaboTemp      a aiiso:KnowledgeGrouping. '
            + '         ?silaboTemp      aiiso:name ?nombreAsignatura. '
            + '         ?silaboTemp      aiiso:description ?descripcion.'    
            + '         ?silaboTemp      ies:is_taught_by   ?dependencia. '
            + '         ?dependencia aiiso:name       ?nombreDependenciaTemp. '
            + '         ?dependencia ies:is_academic_unit_of  ?institucion. '
            + '         ?institucion aiiso:name         ?nombreInstitucionTemp. '
            + '       FILTER REGEX(concat(str(?nombreAsignatura), '
            + '         str(?nombreInstitucionTemp), '
//            + '         str(?descripcion), '
            + '         str(?nombreDependenciaTemp)), "{0}", "i") '
            + ' } group by ?nombreAsignatura LIMIT 50 '
            + ' }';


    this.queryFullSilabos = this.PREFIX
            + 'CONSTRUCT { '
            + '                 <{0}> aiiso:name ?nombreAsignatura. '
            + '                 <{0}> aiiso:description ?descripcion. '
            + '                 <{0}> ies:is_taught_by ?dependencia. '
            + '                 <{0}> ies:name_academic_unit ?nombreDependencia. '
            + '                 <{0}> ies:has_institution ?institucion. '
            + '                 <{0}> ies:name_institution ?nombreInstitucion. '
            + '                 <{0}> ies:objective      ?nombreObjetivo. '
            + '                 <{0}> ies:has_academic_content ?capitulos.   '
            + '                 <{0}> ies:date_creation ?fechaCreacion . '
            + '                 <{0}> ies:credits ?creditos .'
            + '                 ?capitulos ies:chapter ?nombreCapitulo. '
            + '                 ?capitulos ies:subchapter ?nombreSubcapitulo '
            + ' }'
            + ' WHERE { '
            + '     SELECT DISTINCT ?nombreCapitulo ?nombreSubcapitulo ?capitulos '
            + '                        ?nombreAsignatura ?nombreObjetivo ?descripcion '
            + '                        ?dependencia ?institucion ?nombreDependencia '
            + '                        ?nombreInstitucion ?fechaCreacion ?creditos '
            + ' WHERE {   '
            + '         <{0}>      aiiso:name   ?nombreAsignatura. '
            + '       OPTIONAL { '
            + '         <{0}>      aiiso:description  ?descripcion. '
            + '       } .'
            + '       OPTIONAL { '
            + '         <{0}>      ies:is_taught_by   ?dependencia. '
            + '         ?dependencia aiiso:name       ?nombreDependencia. '
            + '       } .'
            + '       OPTIONAL { '
            + '         <{0}> ies:date_creation ?fechaCreacion .'
            + '       } . '
            + '       OPTIONAL { '
            + '         <{0}> ies:credits ?creditos .'
            + '       } . '
            + '       OPTIONAL { '
            + '         ?dependencia ies:is_academic_unit_of  ?institucion. '
            + '         ?institucion aiiso:name         ?nombreInstitucion. '
            + '       } .'
            + '       OPTIONAL { '
            + '         <{0}>      ies:has_academic_content  ?contenido. '
            + '         ?contenido  ies:has_chapter ?capitulos. '
            + '         ?capitulos aiiso:name ?nombreCapitulo.  '
            + '         ?capitulos ies:has_subchapter ?subcap. '
            + '         ?subcap aiiso:name ?nombreSubcapitulo. '
            + '       } .'
            + '       OPTIONAL { '
            + '             <{0}> ies:has_objective ?objetivos.'
            + '             ?objetivos ies:has_item ?objetivo. '
            + '             ?objetivo aiiso:name ?nombreObjetivo . '
            + '         }. '
            + '     } '
            + ' } ';

    this.queryDependencias = this.PREFIX
            + 'CONSTRUCT { ?dependencias aiiso:name  ?nameDependencias }'
            + ' WHERE { '
            + '    SELECT DISTINCT ?dependencias  ?nameDependencias'
            + '    WHERE { '
            + '         <{0}> ies:has_academic_unit ?dependencias .'
            + '         ?dependencias aiiso:name ?nameDependencias .'
            + '      } limit 500'
            + ' } ';
    this.queryLoadSilabos = this.PREFIX
            + 'CONSTRUCT { ?silabo aiiso:name ?name . '
            + '            ?silabo ies:date_creation ?date_creation}'
            + ' WHERE { '
            + '     SELECT DISTINCT (max(?silaboTemp) as ?silabo) ?name (max(?date_creationTemp) as ?date_creation) WHERE {  '
            + '         ?silaboTemp ies:is_taught_by <{0}>.  '
            + '         ?silaboTemp aiiso:description ?description.'
            + '         <{0}> ies:is_academic_unit_of <{1}>. '
            + '         ?silaboTemp aiiso:name ?name . '
            + '         ?silaboTemp ies:date_creation ?date_creationTemp '
            + '     } group by ?name limit 1000'
            + ' } ';


    this.silabos_template = ''
            + '['
            + '   {'
            + '    "id":1,'
            + '     {0} '
            + '  },'
            + '  {'
            + '     "id":2,'
            + '     {1} '
            + '  }'
            + ']';

    this.campos_template = '"{0}":"{1}"';
    this.lista_template = '"{0}": [ '
            + '  {1} '
            + ']';
    this.contenido_template = '"content":   [ '
            + '    {0} '
            + ' ] ';
    this.full_capitulos_template = ''
            + '{'
            + '  "id":{0},'
            + '  "title":"{1}",'
            + '  "subchapter":['
            + '     {2}'
            + '   ]'
            + '}';
    this.capitulos_template = ''
            + '{'
            + '  "id":{0},'
            + '  "title":"{1}"'
            + '}';

    this.items_template = ''
            + '{'
            + '  "id":{0},'
            + '  "desc":"{1}"'
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
                when('/:lang/data/statistics', {
                    templateUrl: '/similitud_silabos/partials/statistics.html',
                }).
                when('/:lang/info/about', {
                    templateUrl: '/similitud_silabos/partials/about.html'
                }).
                when('/:lang/data/ontology', {
                    templateUrl: '/similitud_silabos/partials/ontology.html'
                }).
                when('/:lang/data/endpoint', {
                    templateUrl: '/similitud_silabos/partials/endpoint.html'
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
                when('/:lang/silabo/similitud', {
                    templateUrl: '/similitud_silabos/partials/similitudBuscar.html'
                }).
                when('/:lang/silabo/navegar', {
                    templateUrl: '/similitud_silabos/partials/similitudNavegar.html'
                }).
                otherwise({
                    redirectTo: '/es/'
                })
                ;
    }]);

similitudApp.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
    }]);
