//////// map w/ 2 rasters (fishing effort & diversity) + EEZ polygons ////////

//// establish map variable ////
var map2 = L.map('map2').setView([0, 200], 2.5); // Adjust the view and zoom level


//// add base layer w/ bathymetry and coastlines ////
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

}).addTo(map2);


//// fetch EEZ boundaries ////
var eezLayers = {}; // make container for EEZ layer
var eezGeoJSONLayer;
fetch('data/eez_v12_0_360.json')
// fetch('https://oregonstate.box.com/shared/static/55vvgtv7ttcct009b91yx86qjxdjqtm6')
    .then(function(response) {
        return response.json(); // convert the response to JSON
    })
    .then(function(geojsonData) {
        var eezGeoJSONLayer = L.geoJSON(geojsonData, {
            style: function(feature) { 
                return {
                    color: "darkblue", 
                    weight: 1.5,        
                    dashArray: '4',
                    opacity: 0.6,
                    fillOpacity: 0    
                };
            },
            onEachFeature: function(feature, layer) {
                layer.on({
                    mouseover: function(e) {
                        var layer = e.target;
                        layer.setStyle({
                            weight: 5, 
                            opacity: 0.7
                        });
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                            layer.bringToFront();
                        }
                        infoControl.update(layer.feature.properties); // add to feature property temporarily
                    },
                    mouseout: function(e) {
                        eezGeoJSONLayer.resetStyle(e.target); // reset the layer
                        infoControl.update(null);
                    }
                });
            }
        }).addTo(map2);
        console.log(geojsonData.features[0].properties); // check a feature's properties

    })
    .catch(function(error) {
        console.error('error:', error);
    });


// function for the mouseovers
var infoControl = L.control({position: 'topright'}); 

infoControl.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update(); 
    return this._div;
};

infoControl.update = function(props) {
    if (props) { // if on an EEZ, show its information
        var territory1 = props.TERRITORY1; // grab country it belongs to name
        var sovereign1 = props.SOVEREIGN1; // grab the sovereign name
        if (territory1 === sovereign1) { // if territory and sovereign are the same
            this._div.innerHTML = '<h4>EEZ Information</h4>' + 
                '<b>' + territory1 + '</b>'; // only write territory
        } else {
            this._div.innerHTML = '<h4>EEZ Information</h4>' + 
                '<b>' + territory1 + '</b><br />' + sovereign1; // if they're different, write both
        }
    } else { // else, just show instructions
        this._div.innerHTML = 'Hover over an EEZ';
    }
};
infoControl.addTo(map2);


//// add the raster datasets ////
// diversity
var imageBounds = [[-47,102], [50, 271]]; // note: keep these the same as the raster extents in R

var fishing = L.imageOverlay('data/pacific_ocean_raster_div.png', imageBounds, { // fishing diversity
    opacity: 0.6,
    interactive: true
}).addTo(map2);
fishing._image.classList.add('fishing-layer');

// abundance/effort
var imageBounds = [[-47,102], [50, 271]];

var conflict = L.imageOverlay('data/pacific_ocean_raster_abundance.png', imageBounds, { 
    opacity: 0,
    interactive: true,

}).addTo(map2);
conflict._image.classList.add('conflict-blend-layer');


//// blender for layer 1: diversity ////
var opacityControldiv = L.control({position: 'bottomleft'});
opacityControldiv.onAdd = function(map) {
    var div = L.DomUtil.create('div');
    div.innerHTML = '<div style="text-align: center; margin-bottom: 5px;">Fishing Diversity</div>' +
    '<input type="range" id="opacitySliderdiv" min="0" max="1" step="0.1" value="0.6" style="width:200px;">';
    L.DomEvent.disableClickPropagation(div);
    return div;
};
opacityControldiv.addTo(map2);

// event listener for the slider
document.getElementById('opacitySliderdiv').addEventListener('input', function(e) {
    var newOpacity = e.target.value;
    fishing.setOpacity(newOpacity); // Adjust the opacity of the second raster based on the slider
});



//// blender for layer 2: effort (conflict) ////
var opacityControlcon = L.control({position: 'bottomright'});
opacityControlcon.onAdd = function(map) {
    var div = L.DomUtil.create('div');
    div.innerHTML = '<div style="text-align: center; margin-bottom: 5px;">Fishing Effort</div>' +
    '<input type="range" id="opacitySlidercon" min="0" max="1" step="0.1" value="0" style="width:200px;">';    L.DomEvent.disableClickPropagation(div);
    return div;
};
opacityControlcon.addTo(map2);

// event listener for the slider
document.getElementById('opacitySlidercon').addEventListener('input', function(e) {
    var newOpacity = e.target.value;
    conflict.setOpacity(newOpacity); // Adjust the opacity of the second raster based on the slider
});


//// load json data for diversity and effort pop-up values ////
// diversity data
let diversityData = []; // make container
fetch('data/data_diversity_longline.json')
    .then(response => response.json())
    .then(data => {
        diversityData = data;
    })
    .catch(error => console.error('error:', error));

// effort data 
var abundanceData = []; 
fetch('data/data_diversity_longline_webmap.json')
    .then(response => response.json())
    .then(data => {
        abundanceData = data; 
    })
    .catch(error => console.error('error:', error));
    
// create event listener
map2.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    let popupContent = '';

    // find the closest effort data point
    if (abundanceData.length > 0) {
        const closestabundanceData = abundanceData.reduce((prev, curr) => {
            const prevDist = Math.sqrt(Math.pow(prev.lat - lat, 2) + Math.pow(prev.lon - lng, 2));
            const currDist = Math.sqrt(Math.pow(curr.lat - lat, 2) + Math.pow(curr.lon - lng, 2));
            return (prevDist < currDist) ? prev : curr;
        });
        popupContent += `<strong>Fishing Effort: </strong>${closestabundanceData.total_fe.toFixed(2)} hours<br>`;

    // same for diversity
    if (diversityData.length > 0) {
        const closestDiversityData = diversityData.reduce((prev, curr) => {
            const prevDist = Math.sqrt(Math.pow(prev.lat - lat, 2) + Math.pow(prev.lon - lng, 2));
            const currDist = Math.sqrt(Math.pow(curr.lat - lat, 2) + Math.pow(curr.lon - lng, 2));
            return (prevDist < currDist) ? prev : curr;
        });
        popupContent += `<strong>International Diversity: </strong>${closestDiversityData.fe_diversity_norm.toFixed(2)} countries`;
    } 
    }

    if (popupContent !== '') { // make pop-up
        L.popup()
            .setLatLng(e.latlng)
            .setContent(popupContent)
            .openOn(map2);
    }
});


//// add legends ////
// establish color palette
var spectralColors = ["#9E0142","#D53E4F", "#F46D43", "#FDAE61", "#FEE08B", "#FFFFBF", "#E6F598", "#ABDDA4","#66C2A5", "#3288BD", "#5E4FA2"];
var greyColors = ["#FFFFFF" ,"#F0F0F0", "#D9D9D9", "#BDBDBD", "#969696", "#737373", "#525252", "#252525","#000000"];
var orngColors = ["#FFF5EB","#FEE6CE", "#FDD0A2", "#FDAE6B", "#FD8D3C", "#F16913", "#D94801", "#A63603","#7F2704"]
var greenColors = ["F7FCF5", "#E5F5E0", "#C7E9C0", "#A1D99B", "#74C476" ,"#41AB5D" ,"#238B45" ,"#006D2C","#00441B"]

// add to map
var diversityLegend = createLegend(greenColors, "Fishing Diversity",0,1.84,'bottomleft');
diversityLegend.addTo(map2);

var abundanceLegend = createLegend(orngColors, "Fishing Effort<br>(logged hours)",0,11.2,'bottomright');
abundanceLegend.addTo(map2);

// build function for legend
function createLegend(colors, title, minValue, maxValue, position) {
    var legend = L.control({position: position}); 

    legend.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'info legend'),
            labels = [],
            range = maxValue - minValue,
            segment = range / (colors.length - 1);

        div.innerHTML += '<strong>' + title + '</strong><br>';

        // make the labels from value ranges
        for (var i = 0; i < colors.length; i++) {
            var fromValue = minValue + (i * segment);
            var toValue = fromValue + segment;
            
            // format text
            var labelText = i < colors.length - 1 ?
                fromValue.toFixed(2) + " - " + toValue.toFixed(2) :
                "> " + fromValue.toFixed(2);
            // show labels + colors
            labels.push(
                '<i style="background:' + colors[i] + '"></i> ' + labelText);
        }

        div.innerHTML += labels.join('<br>');
        return div;
    };

    return legend;
}

