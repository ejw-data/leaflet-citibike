


// Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_information.json").then(function(response){

  // Pull the "stations" property off of response.data
  var stations = response.data.stations;

  // Initialize an array to hold bike markers
  var bikeMarkers = [];

  // Loop through the stations array
  for (var index = 0; index < stations.length; index++) {
    var station = stations[index];

    // For each station, create a marker and bind a popup with the station's name
    var bikeMarker = L.marker([station.lat, station.lon])
      .bindPopup("<h3>" + station.name + "<h3><h3>Capacity: " + station.capacity + "</h3>");

    // Add the marker to the bikeMarkers array
    bikeMarkers.push(bikeMarker);
  }
    // create a group layer of bike markers
    var bikeMarkerLayer = L.layerGroup(bikeMarkers);

  // Send bikeMakerLayer to the map setup code (aka pass it into the createMap function)
  // No longer needed - bikeMarkerLayer replaces bikeStations in the below code once the functions are combined.
  //createMap(bikeMarkerLayer);

  // Create the tile layer that will be the background of our map
  var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
    id: "light-v10"
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": streetmap
  };

  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "Bike Stations": bikeMarkerLayer
  };

  // Create the map object with options
  var map = L.map("map-id", {
    center: [40.73, -74.0059],
    zoom: 12,
    layers: [streetmap, bikeMarkerLayer]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  // Erin's change - I removed 'baseMaps' with null to remove the icon in the control box in teh upper right of the html page
  L.control.layers(null, overlayMaps, {
    collapsed: false
  }).addTo(map);
});