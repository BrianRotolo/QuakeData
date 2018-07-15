var quakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tecPlatesURL = "https://raw.githubusercontent.ccom/fraxen/tecPlates/master/GeoJSON/PB2002_boundaries.json";
d3.json(quakeUrl, function(data){
	Features(data.features);
});
function Features(quakeData){
	var earthquakes = L.geoJson(quakeData, {
		onEachFeature: function(feature,layer){
			layer.bindPopup("<h2>Magnitude: " + feature.properties.mag + "</h2><h2>Location: " + feature.properties.place + "</h2><hr><p>" + new Date(feature.properties.time) + "</p>");
		},
		pointtoLayer: function(feature, latlng){
			return new L.circle(latlng, 
				{radius: getRadius(feature.properties.mag),
				fillColor: getColor(feature.properties.mag),
				fillOpacity: .5,
				color: "#000",
				stroke: true,
				weight: 1})
		}
	});
	createMap(earthquakes);
}

function createMap(earthquakes){
	var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
	"MAPBOX_ACCESS_TOKEN");

	var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "MAPBOX_ACCESS_TOKEN");
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "MAPBOX_ACCESS_TOKEN");

    var baseMaps = {
		"Dark Map": darkmap,
    	"Outdoors": outdoors,
    	"Satellite": satellite
    };

    var tecPlates = new L.layerGroup();
    var overlayMaps = {
    	"Earthquakes": earthquakes,
    	"Tectonic Plates": tecPlates
    };
    var quakeMap = L.map("map", {
    	center:[37.09, -95.71], 
    	zoom: 3,
    	layers: [darkmap, outdoors, earthquakes]
    });

    d3.json(tecPlatesURL, function(plateData){
    	L.geoJson(plateData, {
    		color: "red",
    		weight: 3
    	})
    	.addTo(tecPlates);
    });

    L.control.layers(baseMaps, overlayMaps, {
    	collapsed: false
    })
    .addTo(quakeMap);

    var legend = L.control({position: "topright"});
    legend.onAdd = function(quakeMap){
    	var div = L.DomUtil.create("div", "info legend"),
    	grades = [0,1,2,3,4,5],
    	labels = [];

    for (var i =0; i<grades.length; i++){
    	div.innerHTML +=
    		'<i style="background: ' + getColor(grades[i] + 1) + '></i>' + grades[i] + (grades[i + 1]?'&ndash;' + grades[i+1] + '<br>' : '+');
    }
    return div;
    };
    legend.addTo(quakeMap);
}
function getColor(d){
	return d>5 ? "#a54500":
	d > 4 ? "#cc5500":
	d > 3 ? "#ff6f08":
	d > 2 ? "#ff9143":
	d > 1 ? "#ffb37e": "#ffcca5";
}
function getRadius(value){
	return value*20000
}