//////// fishing diversity map ////////

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
                            weight: 5, // Highlight style
                            opacity: 0.7
                        });
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                            layer.bringToFront();
                        }
                        // Update the info control with the feature's properties
                        infoControl.update(layer.feature.properties);
                    },
                    mouseout: function(e) {
                        eezGeoJSONLayer.resetStyle(e.target); // Reset the style to original using the layer reference
                        infoControl.update(null);
                    }
                });
            }
        }).addTo(map2);
        console.log(geojsonData.features[0].properties); // Log the properties of the first feature to check

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
        // Check if territory1 and sovereign1 are the same
        if (territory1 === sovereign1) {
            this._div.innerHTML = '<h4>EEZ Information</h4>' + 
                '<b>' + territory1 + '</b>';
        } else {
            this._div.innerHTML = '<h4>EEZ Information</h4>' + 
                '<b>' + territory1 + '</b><br />' + sovereign1;
        }
    } else { // else, just show instructions
        this._div.innerHTML = 'Hover over an EEZ';
    }
};
infoControl.addTo(map2);

//// fetch EEZ boundaries (national waters) ////
// var eezLayers = {}; // make container for EEZ layer
// var eezGeoJSONLayer;

// fetch('data/eez_v12_0_360.json')
//     .then(function(response) {
//         return response.json();
//     })
//     .then(function(geojsonData) {
//         // filter out unwanted EEZ attributes
//         geojsonData.features = geojsonData.features.filter(function(feature) {
//             return feature.properties.LINE_TYPE !== "Archipelagic baseline" &&
//                     feature.properties.LINE_TYPE !== "Straight baseline";
//         });
//         // style map
//         L.geoJSON(geojsonData, {
//             style: function(feature) { 
//                 return {
//                     color: "darkblue", 
//                     weight: 1.5,        
//                     dashArray: '4',
//                     opacity: .6    
//                 };
//             },
//         // group EEZ for pop-up
//             onEachFeature: function(feature, layer) {
//                 var eez1 = feature.properties.EEZ1.replace(/\(.*?\)/g, "").trim(); // grab EEZ name - get rid of parentheses 
//                 var territory1 = feature.properties.TERRITORY1; // grab country it belongs to name

//                 if(!eezLayers[territory1]){
//                     eezLayers[territory1] = [];
//                 }
//                 eezLayers[territory1].push(layer);

//                 layer.bindPopup("<strong>" + territory1 + "</strong>" + "</br>" + eez1); // fill pop-up w/ EEZ and country
//         // make pop-up on mouseover: thicken line when mouse is on
//                 layer.on({
//                     mouseover: function(e) {
//                         eezLayers[territory1].forEach(function(layer) {
//                             var layer = e.target;
//                             layer.setStyle({
//                                 weight: 15 // Set the weight to highlight
//                             });
//                         });
//                         if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
//                             layer.bringToFront();
//                         }
//                         infoControl.update(layer.feature.properties); // Update the control with properties of the hovered feature
//                     },
//                     mouseout: function(e) {
//                         eezLayers[territory1].forEach(function(layer) {
//                             layer.setStyle({
//                                 weight: 1.5 // Reset to the original weight
//                             });
//                         });
//                         infoControl.update(null);
//                     }
//                 });
//             },
//         }).addTo(map2);
//     })
//     .catch(function(error) {
//         console.error('error:', error);
//     });







//// add the raster datasets ////
// diversity
var imageBounds = [[-47,102], [50, 271]]; // note: keep these the same as the raster extents in R

var fishing = L.imageOverlay('data/pacific_ocean_raster_div.png', imageBounds, { // fishing diversity
    opacity: 0.6,
    interactive: true
}).addTo(map2);
fishing._image.classList.add('fishing-layer');

// abundance
var imageBounds = [[-47,102], [50, 271]];

var conflict = L.imageOverlay('data/pacific_ocean_raster_abundance.png', imageBounds, { // conflict hotspots
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



//// blender for layer 2: conflict ////
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



//// load json data to call for diversity and conflict value pop-up ////
// diversity data
let diversityData = []; // make container
fetch('data/data_diversity_longline.json')
    .then(response => response.json())
    .then(data => {
        diversityData = data;
    })
    .catch(error => console.error('error:', error));

// conflict data 
var abundanceData = []; 

fetch('data/data_diversity_longline_webmap.json')
    .then(response => response.json())
    .then(data => {
        abundanceData = data; // Assuming this data is an array of objects
    })
    .catch(error => console.error('error:', error));
    

// create event listener
map2.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    let popupContent = '';

    // find the closest conflict data point
    if (abundanceData.length > 0) {
        const closestabundanceData = abundanceData.reduce((prev, curr) => {
            const prevDist = Math.sqrt(Math.pow(prev.lat - lat, 2) + Math.pow(prev.lon - lng, 2));
            const currDist = Math.sqrt(Math.pow(curr.lat - lat, 2) + Math.pow(curr.lon - lng, 2));
            return (prevDist < currDist) ? prev : curr;
        });
        popupContent += `<strong>Fishing Effort: </strong>${closestabundanceData.total_fe.toFixed(2)} hours<br>`;

    // find the closest diversity data point
    if (diversityData.length > 0) {
        const closestDiversityData = diversityData.reduce((prev, curr) => {
            const prevDist = Math.sqrt(Math.pow(prev.lat - lat, 2) + Math.pow(prev.lon - lng, 2));
            const currDist = Math.sqrt(Math.pow(curr.lat - lat, 2) + Math.pow(curr.lon - lng, 2));
            return (prevDist < currDist) ? prev : curr;
        });
        popupContent += `<strong>International Diversity: </strong>${closestDiversityData.fe_diversity_norm.toFixed(2)} countries`;
    } 
    }

    // display popup
    if (popupContent !== '') {
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
    var legend = L.control({position: position}); // Use the position parameter

    legend.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'info legend'),
            labels = [],
            range = maxValue - minValue,
            segment = range / (colors.length - 1);

        div.innerHTML += '<strong>' + title + '</strong><br>';

        // Generate labels with value ranges
        for (var i = 0; i < colors.length; i++) {
            var fromValue = minValue + (i * segment);
            var toValue = fromValue + segment;
            
            // Formatting the label text
            var labelText = i < colors.length - 1 ?
                fromValue.toFixed(2) + " - " + toValue.toFixed(2) :
                "> " + fromValue.toFixed(2);

            labels.push(
                '<i style="background:' + colors[i] + '"></i> ' + labelText);
        }

        div.innerHTML += labels.join('<br>');
        return div;
    };

    return legend;
}





//// establish functions (from lab 3, maybe useful) ////
/// number formatting
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
