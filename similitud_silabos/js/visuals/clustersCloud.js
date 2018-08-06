'use strict';

var clusterKeywCloud = angular.module('clusterKeywCloud', []);
//	D3	Factory
clusterKeywCloud.factory('d3', function () {
    return	d3;
});
clusterKeywCloud.directive('clusterKeywCloud', ["d3", 'globalData', 'sparqlQuery',
    function (d3, globalData, sparqlQuery) {

        var chart, clear, click, collide, collisionPadding, connectEvents, data, force, gravity, hashchange, height, idValue, jitter, label, margin, maxRadius, minCollisionRadius, mouseout, mouseover, node, rScale, rValue, textValue, tick, transformData, update, updateActive, updateLabels, updateNodes, width;
        var scope;
        var attrs;
        var pageTitle = "";
        width;// = 980;
        height;// = 510;
        data = [];
        node = null;
        label = null;
        margin = {
            top: 5,
            //top: 1350,
            right: 0,
            bottom: 0,
            left: 0
        };
        maxRadius = 35;
        rScale = d3.scale.sqrt().range([0, maxRadius]);
        rValue = function (d) {
            return parseInt(d.value);
        };
        idValue = function (d) {
            return d.label;
        };
        textValue = function (d) {
            return d.label;
        };
        collisionPadding = 10;
        minCollisionRadius = 12;
        jitter = 0.1;
        transformData = function (rawData) {
            rawData.forEach(function (d) {
                d.value = parseInt(d.value);
            });
            return rawData;
        };
        tick = function (e) {
            var dampenedAlpha;
            dampenedAlpha = e.alpha * 0.1;
            node.each(gravity(dampenedAlpha)).each(collide(jitter)).attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
            return label.style("left", function (d) {
                /*if(d.label == "Amino Acid") { 
                 d = d;
                 }*/      //POSITION OF LABEL
                return (17 + (margin.left + d.x) - d.dx / 2) + "px";
            }).style("top", function (d) {
                return (140 + (margin.top + d.y) - d.dy / 2) + "px";
            });
        };

        //main method to plot 
        chart = function (selection) {
            return selection.each(function (rawData) {
                var maxDomainValue, svg, svgEnter;
                data = transformData(rawData);
                maxDomainValue = d3.max(data, function (d) {
                    return rValue(d);
                });
                rScale.domain([0, maxDomainValue]);
                svg = d3.select(this).selectAll("svg").data([data]);
                svgEnter = svg.enter().append("svg");
                svg.attr("width", width + margin.left + margin.right);
                svg.attr("height", height + margin.top + margin.bottom);
                node = svgEnter.append("g").attr("id", "gbubble-nodes").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                node.append("rect").attr("id", "gbubble-background").attr("width", width).attr("height", height);
                label = d3.select(this).selectAll("#gbubble-labels").data([data]).enter().append("div").attr("id", "gbubble-labels");
                update();
                /*hashchange();
                 return d3.select(window).on("hashchange", hashchange);*/
                return d3.select(window);
            });
        };
        update = function () {
            data.forEach(function (d, i) {
                return d.forceR = Math.max(minCollisionRadius, rScale(rValue(d)));
            });
            force.nodes(data).start();
            updateNodes();
            return updateLabels();
        };
        updateNodes = function () {
            node = node.selectAll(".gbubble-node").data(data, function (d) {
                return idValue(d);
            });
            node.exit().remove();
            return node.enter().append("a").attr("class", "gbubble-node")
//            .attr("xlink:href", function (d) {
//                return "#" + (encodeURIComponent(idValue(d)));
//            })
                    .call(force.drag).call(connectEvents).append("circle").attr("id", "gcircle").attr("r", function (d) {
                return rScale(rValue(d));
            });
        };
        updateLabels = function () {
            var labelEnter;
            label = label.selectAll(".gbubble-label").data(data, function (d) {
                return idValue(d);
            });
            label.exit().remove();
            labelEnter = label.enter().append("a").attr("class", "gbubble-label")
//            .attr("href", function (d) {
//                return "#" + (encodeURIComponent(idValue(d)));
//            })
                    .call(force.drag).call(connectEvents);
            labelEnter.append("div").attr("class", "gbubble-label-name").text(function (d) {
                return textValue(d);
            });
            labelEnter.append("div").attr("class", "gbubble-label-value").text(function (d) {
                return rValue(d);
            });
            label.style("font-size", function (d) {
                return Math.max(8, rScale(rValue(d) / 5)) + "px";
            }).style("width", function (d) {
                return 0.1 * rScale(rValue(d)) + "px";
            });
            label.append("span").text(function (d) {
                return textValue(d);
            }).each(function (d) {
                return d.dx = Math.max(2.5 * rScale(rValue(d)), this.getBoundingClientRect().width);
            }).remove();
            label.style("width", function (d) {
                return d.dx + "px";
            });
            return label.each(function (d) {
                return d.dy = this.getBoundingClientRect().height;
            });
        };
        gravity = function (alpha) {
            var ax, ay, cx, cy;
            cx = width / 2;
            cy = height / 2;
            ax = alpha / 8;
            ay = alpha;
            return function (d) {
                d.x += (cx - d.x) * ax;
                return d.y += (cy - d.y) * ay;
            };
        };
        collide = function (jitter) {
            return function (d) {
                return data.forEach(function (d2) {
                    var distance, minDistance, moveX, moveY, x, y;
                    if (d !== d2) {
                        x = d.x - d2.x;
                        y = d.y - d2.y;
                        distance = Math.sqrt(x * x + y * y);
                        minDistance = d.forceR + d2.forceR + collisionPadding;
                        if (distance < minDistance) {
                            distance = (distance - minDistance) / distance * jitter;
                            moveX = x * distance;
                            moveY = y * distance;
                            d.x -= moveX;
                            d.y -= moveY;
                            d2.x += moveX;
                            return d2.y += moveY;
                        }
                    }
                });
            };
        };

        connectEvents = function (d) {
            d.on("click", click);
            d.on("mouseover", mouseover);
            return d.on("mouseout", mouseout);
        };
        clear = function () {
            return location.replace("#");
        };

        click = function (d) {
            //   location.replace("#" + encodeURIComponent(idValue(d)));


            //adding information about publications of THIS keyword into "tree-node-info"   DIV
            var infoBar = $('div.tree-node-info');
            var model = {"dcterms:title": {label: "Title", containerType: "div"},
                "bibo:uri": {label: "URL", containerType: "a"},
                "dcterms:contributor": {label: "Contributor", containerType: "a"},
                "dcterms:isPartOf": {label: "Is Part Of", containerType: "a"},
                "dcterms:license": {label: "License", containerType: "a"},
                "dcterms:provenance": {label: "Source", containerType: "div"},
                "dcterms:publisher": {label: "Publisher", containerType: "div"},
                "bibo:numPages": {label: "Pages", containerType: "div"}
            };
            if (infoBar) {
                var key = d.label;

                var headbar = $('div.head-info');
                headbar.find('title').text("ddddddtitletitle");
                headbar.html('');
                //Function to show the buttons for the reports
                scope.$parent.exportReport(d.id);
                var div = $('<div>');
                var label = $('<span class="label label-primary" style="font-size:35px">').text("AUTHORS OF CLUSTER " + d.label);
                div.append(label);
                div.append("</br>");
                headbar.append(div);

                var sparqlPublications = globalData.PREFIX

                        + 'CONSTRUCT '
                        + '{'
                        + '     ?subject a foaf:Person. '
                        + '	?subject foaf:name ?name. '

                        + '	?subject bibo:Quote ?keywords. '
                        + '} '
                        + 'where'
                        + '{'
                        + ' SELECT DISTINCT ?subject ?name ?keywords'
                        + ' WHERE '
                        + ' {  '
                        + '   graph <' + globalData.clustersGraph + '>        '
                        + '   {          '
                        + '     <' + d.id + '>  ' + 'uc:hasPerson  ?subject.'
                        + '     {      			'
                        + '       select DISTINCT ?subject ?name ?keywords            		'
                        + '       where            		'
                        + '                     {            	'
                        + '                       graph <' + globalData.centralGraph + '>            			'
                        + '                             {            				  '
                        + '                               ?subject foaf:name ?name.'
                        + '                               ?subject foaf:publications ?publicationUri. '
                        + ' 							  ?publicationUri dct:title ?title .'
                        + '                           ?publicationUri bibo:Quote ?keywords.'
                        + '                         }          			'
                        + '                 } group by ?subject ?name ?keywords         	'
                        + ' }           '
                        + ' } '
                        + ' } '
                        + ' } ';


                waitingDialog.show("Searching Authors of the cluster " + key);

                sparqlQuery.querySrv({query: sparqlPublications}, function (rdf) {

                    jsonld.compact(rdf, globalData.CONTEXT, function (err, compacted) {
                        if (compacted)
                        {
                            var newdata = [];
                            _.map(compacted["@graph"], function (keyword) {
                                var mykeywords;
                                for (var i = 0; i < 20 && i < keyword["bibo:Quote"].length; i++)
                                {

                                    mykeywords = ( mykeywords ? mykeywords + ", " : "" ) + keyword["bibo:Quote"][i];

                                }
                                newdata.push({"@id": keyword["@id"], "@type": keyword["@type"], "bibo:Quote": mykeywords, "foaf:name": keyword["foaf:name"]});


                            })
                            var entity = newdata;
                            //Each author is a person
                            var final_entity = _.where(entity, {"@type": "foaf:Person"});
                            var values = final_entity.length ? final_entity : [final_entity];
                            //send data to the controller
                            scope.ctrlFn({value: values});
                            waitingDialog.hide();

                        }
                        else
                        {
                            waitingDialog.hide();
                        }
                    });
                });
            }
            return d3.event.preventDefault();
        };
        hashchange = function () {
            var id;
            id = decodeURIComponent(location.hash.substring(1)).trim();
            return updateActive(id);
        };
        updateActive = function (id) {
            node.classed("gbubble-selected", function (d) {
                return id === idValue(d);
            });
            if (id.length > 0) {
                return d3.select("#status").html("<h3>The word <span class=\"active\">" + id + "</span> is now active</h3>");
            } else {
                return d3.select("#status").html("<h3>No word is active</h3>");
            }
        };
        function removePopovers() {
            $('.popover').each(function () {
                $(this).remove();
            });
        }
        function showPopover(d) {
            $(this).popover({
                placement: 'auto top',
                container: 'body',
                trigger: 'manual',
                html: true,
                content: function () {
                    if (d.abstract != null && (d.abstract.constructor === Array || d.abstract instanceof Array))
                        d.abstract = d.abstract[0];
                    return "<strong>Cluster:</strong> " + d.label + "<br />" + "<strong>Authors</strong> in this cluster with publications that contain "
                            + pageTitle.toString().replace('Clusters that contain ', '').replace(' Keyword".', '').replace('Clusters que contienen ', '')
                            /*"Abstract: " + d.abstract.substring(0, 50) + "<br />" +
                             "Author: " + d.author + "<br />"
                             "Author Source: " + d.source + "<br />"*/

//                        "Country: " + d.country + "<br />" +
//                        "SIC Sector: " + d.sicSector + "<br />" +
//                        "Last: " + d.lastPrice + " (" + d.pricePercentChange + "%)<br />" +
//                        "Volume: " + d.volume + "<br />" +
//                        "Standard Deviation: " + d.standardDeviation
                            ;
                }
            });
            $(this).popover('show')
        }
        mouseover = function (d) {
            showPopover.call(this, d);
            return node.classed("gbubble-hover", function (p) {
                return p === d;
            });
        };
        mouseout = function (d) {
            removePopovers();
            return node.classed("gbubble-hover", false);
        };
        chart.jitter = function (_) {
            if (!arguments.length) {
                return jitter;
            }
            jitter = _;
            force.start();
            return chart;
        };
        chart.height = function (_) {
            if (!arguments.length) {
                return height;
            }
            height = _;
            return chart;
        };
        chart.width = function (_) {
            if (!arguments.length) {
                return width;
            }
            width = _;
            return chart;
        };
        chart.r = function (_) {
            if (!arguments.length) {
                return rValue;
            }
            rValue = _;
            return chart;
        };

        var draw = function draw(element, widthEl, heightEl, data, scopeEl, attrsEl, pageTitleEl) {
            width = widthEl;
            height = heightEl;
            scope = scopeEl;
            attrs = attrsEl;
            pageTitle = pageTitleEl;
            d3.select('div.head-pagetitle').text(pageTitle);
            force = d3.layout.force().gravity(0).charge(0).size([width, height]).on("tick", tick);
            element.datum(data).call(chart);

        }

        return {
            restrict: 'E',
            scope: {
                'ctrlFn': "&",
                data: '='
            },
            compile: function (element, attrs, transclude) {
                //	Create	a	SVG	root	element
                /*var	svg	=	d3.select(element[0]).append('svg');
                 svg.append('g').attr('class', 'data');
                 svg.append('g').attr('class', 'x-axis axis');
                 svg.append('g').attr('class', 'y-axis axis');*/
                //	Define	the	dimensions	for	the	chart
                //var width = 960, height = 500;
                var elementWidth = parseInt(element.css('width'));
                var elementHeight = parseInt(element.css('height'));
                var width = attrs.ctWidth ? attrs.ctWidth : elementWidth;
                var height = attrs.ctHeight ? attrs.ctHeight : elementHeight;



                var svg = d3.select(element[0]);

                //	Return	the	link	function
                return	function (scope, element, attrs) {
                    //	Watch	the	data	attribute	of	the	scope
                    /*scope.$watch('$parent.logs', function(newVal, oldVal, scope) {
                     //	Update	the	chart
                     var data = scope.$parent.logs.map(function(d) {
                     return {
                     x: d.time,
                     y: d.visitors
                     }
                     
                     });
                     
                     draw(svg, width, height, data);
                     },	true);*/
                    scope.$watch('data', function (newVal, oldVal, scope) {
                        //	Update	the	chart

                        var data = scope.data;
                        if (data) {
                            var jsonld = data.data;
                            var schema = data.schema;
                            var fields = schema.fields;
                            var mappedData = [];

                            _.each(jsonld['@graph'], function (keyword, idx) {
                                if (keyword["rdfs:label"])
                                {
                                    var id = keyword["@id"];
                                    var field1 = fields[1].replace("uc:", "http://ucuenca.edu.ec/ontology#");
                                    var val = "";
                                    if (keyword[fields[1]] || keyword[field1]) {
                                        val = keyword[fields[1]] ? keyword[fields[1]]["@value"] : keyword[field1]["@value"];
                                    }
                                    if (keyword[fields[0]].toString().toLowerCase() != 'uc:resulttitle' && keyword[fields[0]] != 'http://ucuenca.edu.ec/wkhuska/resource/resultTitle') {
                                        mappedData.push({id: id, label: keyword[fields[0]], value: val});
                                    }

                                }
                            });

                            try {
                                pageTitle = _.findWhere(jsonld['@graph'], {"@type": "uc:pagetitle"})["uc:viewtitle"];
                            }
                            catch (err) {
                                pageTitle = _.findWhere(jsonld['@graph'], {"@type": "http://ucuenca.edu.ec/resource/pagetitle"})["http://ucuenca.edu.ec/resource/viewtitle"];
                            }
                            draw(svg, width, height, mappedData, scope, attrs, pageTitle);
                        }
                    }, true);

                };
            }
        };
    }]);
