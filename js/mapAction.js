$(document).ready(function() {

    var map = L.map("map", {
        center: [27.6419412, 85.1224152],
        zoom: 13,
        doubleClickZoom: true
    });

    L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    L.control.scale().addTo(map);
        var markerCluster = L.markerClusterGroup({
        showCoverageOnHover: false
    });
    markerCluster.addTo(map);


    function TableContent(jsonData,invert) {
        var content = $('<div></div>').addClass('table-content');
        for (row in jsonData) {
            var tableRow = $('<div></div>').addClass('table-row').append(function() {
                var key = row;
                if (!(key === "@uid" || key === "@changeset" || key === "@version" || key === "@timestamp" || key === "@id")) {
                    return jsonData[row] ? $("<div></div>").text(key).append($("<div></div>").text(jsonData[row])) : "";
                }
            });
            invert ? tableRow.prependTo(content).addClass(row) : tableRow.appendTo(content).addClass(row);
        }
        return $(content)[0];
    }


    function Table(json) {
        return $('<div></div>').append($('<div class="title"></div>').text(json.type)).addClass('table-container').append(new TableContent(json.data));
    }

    function summaryTable(json){

        if ($('.table-container').length == 0) {
            $.getJSON(json, function(data) {
                new Table(data).appendTo("body")
            });
        }
        else{
            $('.table-container').remove();
            $.getJSON(json, function(data) {
                new Table(data).appendTo("body")
            });
        }
        
    }


    var pointBuild = L.geoJson(null, {
        pointToLayer: function(feature, latlng) {
            var deferred = $.Deferred();
            marker = L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'img/marker.png',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                }),
                riseOnHover: true,
                title: "This is a Point feature. Click to have a look at some of its attributes"
            });            
            
            //markerCluster.clearLayers();
            map.fire('cluster-hover');
            
            deferred.resolve();
            return marker;
        },
        onEachFeature: function(feature, layer) {
            var popup = L.popup();
            //markerCluster.clearLayers();
            markerCluster.addLayer(marker);
            layer.on('click', function(e) {
                var deferred = $.Deferred();
                popup.setLatLng(e.latlng);
                popup.setContent(new TableContent(feature.properties));
                popup.openOn(map);
                deferred.resolve();
            });
        }
    });

    var myStyle = {
        weight: 2,
        opacity: 1,
        color: '#FF0000',
        dashArray: '3',
        fillOpacity: 0.3,
        fillColor: '#FA8072'
    };

    var wayBuild = L.geoJson(null, {
        style: myStyle,
        onEachFeature: function(feature, layer) {
            //console.log(layer);
            //layer.setAttribute("title", "This is a " + feature.geometry.type.replace("String", "") + " feature. Click to have a look at some of its attributes.");
            var popup = L.popup();
            layer.on('click', function(e) {
                var deferred = $.Deferred();
                popup.setLatLng(e.latlng);
                popup.setContent(new TableContent(feature.properties));
                popup.openOn(map);
                deferred.resolve();
            });
        }
    });



    function pointLinePolygon(receivedPoints, receivedLines, receivedPolygon, day) {

        markerCluster.clearLayers();
        var points_, lines_, polygon_;
        var deferredPoint = $.Deferred();
        var deferredLine = $.Deferred();
        var deferredPolygon = $.Deferred();

        $.getJSON(receivedPoints, function(data) {

            setTimeout(function() {
                points_ = pointBuild.addData(data);
                deferredPoint.resolve(points_);
            }, 0);
        });

        $.getJSON(receivedLines, function(data) {
            setTimeout(function() {
                lines_ = wayBuild.addData(data);
                deferredLine.resolve(lines_);
            }, 0);
        });

        $.getJSON(receivedPolygon, function(data) {
            setTimeout(function() {
                polygon_ = wayBuild.addData(data);
                deferredPolygon.resolve(polygon_);
            }, 0);
        });

        $.when(deferredPoint, deferredLine, deferredPolygon).done(function(points_, lines_, polygon_) {
            var featureGroup = L.layerGroup([lines_, polygon_]);
            featureGroup.addTo(map);

            $.map(wayBuild._layers, function(layer, index) {
                $(layer._container).find("path").attr("title", "This is a way feature. Click to have a look at some of its attributes.");
            });
            

        });
    }

    map.on('cluster-hover', function() {
        setTimeout(function() {
            $("#map").find("div.marker-cluster").attrByFunction(function() {
                return {
                    title: "This is a Cluster of " + $(this).find("span").text() + " Point features. Click to zoom in and see the Point features and sub-clusters it contains."
                }
            });
        }, 0);
    });

    pointLinePolygon("data/day1/points.geojson", "data/day1/lines.geojson", "data/day1/polygon.geojson", "Day 1");
    summaryTable("data/day1/summary.json");
    
    var tooltip = $('<div id="toolTipSlider" />');

    $('#slider').slider({
        min: 1,
        max: 4,
        slide: function (event, ui) {
            if (ui.value === 1) {
                tooltip.text("Day " + ui.value);
                $.ajax({
                    type: 'get',
                    success: function () {
                        setTimeout(function () {
                            map.eachLayer(function (layer) {
                                if (layer.feature) {
                                    map.removeLayer(layer);
                                }
                            });
                            pointLinePolygon("data/day1/points.geojson", "data/day1/lines.geojson", "data/day1/polygon.geojson", "Day 1");
                            summaryTable("data/day1/summary.json");
                        }, 0);
                    }
                });
            }
            else if (ui.value === 2) {
                tooltip.text("Day " + ui.value);
                $.ajax({
                    type: 'get',
                    success: function () {
                        setTimeout(function () {
                            map.eachLayer(function (layer) {
                                //console.log(layer);
                                if (layer.feature) {
                                    map.removeLayer(layer);
                                }
                            });
                            pointLinePolygon("data/day2/points.geojson", "data/day2/lines.geojson", "data/day2/polygon.geojson", "Day 2");
                            summaryTable("data/day2/summary.json");
                        }, 0);
                    }
                });
            }

            else if (ui.value === 3) {
                tooltip.text("Day " + ui.value);
                $.ajax({
                    type: 'get',
                    success: function () {
                        setTimeout(function () {
                            map.eachLayer(function (layer) {
                                if (layer.feature) {
                                    map.removeLayer(layer);
                                }
                            });
                            pointLinePolygon("data/day3/points.geojson", "data/day3/lines.geojson", "data/day3/polygon.geojson", "Day 3");
                            summaryTable("data/day3/summary.json");
                        }, 0);
                    }
                });
            }

            else if (ui.value === 4) {
                tooltip.text("Day " + ui.value);
                $.ajax({
                    type: 'get',
                    success: function () {
                        setTimeout(function () {
                            map.eachLayer(function (layer) {
                                if (layer.feature) {
                                    map.removeLayer(layer);
                                }
                            });
                            pointLinePolygon("data/day4/points.geojson", "data/day4/lines.geojson", "data/day4/polygon.geojson", "Day 4");
                            summaryTable("data/day4/summary.json");
                        }, 0);
                    }
                });
            }
        }
    }).find(".ui-slider-handle").append(tooltip).hover(function () {
        tooltip.show();
    });

    tooltip.text("Day 1");



});

$.fn.attrByFunction = function(a) {
    return $(this).each(function() {
        $(this).attr(a.call(this));
    });
};