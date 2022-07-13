// Author:  Erin Wills (70%), Bootcamp example (10%), Leaflet Documentation (20%)

// **************************************************** //
// PART I:  Generate Map, empty Bottom Right Legend Control, Upper Right Layer Control (labels-only)
// **************************************************** //


// ***************************************************** //
// Create the map with options
// map is an L.map() function
let map = L.map("map-id", {
    center: [40.73, -74.0059],
    zoom: 12
});

// ***************************************************** //
// Create a legend to display information about our map. //
// info is an L.control() function
let info = L.control({
    position: "bottomright"
});

// when info is addTo(map), execute this function
// adds '<div class="legend"></div> inside bottomright control div
info.onAdd = function() {
let div = L.DomUtil.create("div", "legend");
return div;
};
// adds info function to map function
info.addTo(map);

// ***************************************************** //
// Create the tile layer that will be the background of our map
// L.tileLayer() function is directly added to map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(map);

// ***************************************************** //
// Initialize all the LayerGroups that we'll use.
// Each variable is a L.LayerGroup() function
let COMING_SOON = new L.LayerGroup();
let EMPTY = new L.LayerGroup();
let LOW = new L.LayerGroup();
let NORMAL = new L.LayerGroup();
let OUT_OF_ORDER = new L.LayerGroup();

// Create an overlayMaps object to hold the bikeStations layer
let overlayMaps = {
    "Coming Soon": COMING_SOON,
    "Empty Stations": EMPTY,
    "Low Stations": LOW,
    "Healthy Stations": NORMAL,
    "Out of Order": OUT_OF_ORDER
};

// ***************************************************** //
// Create Overlay control on map
// 
L.control.layers(null, overlayMaps, {
    collapsed: false
}).addTo(map);


// **************************************************** //
// PART II:  Add Legend Data, call mapLayer function to add each station one-at-a-time
// **************************************************** //

createLegend()

// **************************************************** //
// PART III:  Within mapLayers function: markers are created, markers have messages binded, and markers are added to layer
// Note:  Layers were already added (initialized) to map in PART I. 
// **************************************************** //

  // Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
function createLegend(){
  d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_information.json").then(function(infoRes){

  // When the first API call completes, perform another call to the Citi Bike station status endpoint.
    d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_status.json").then(function(statusRes) {
      // Pull the "stations" property off of response.data
      let updatedAt = infoRes.last_updated;
      let stationStatus = statusRes.data.stations;
      let stationInfo = infoRes.data.stations;

      // The code below is basically the same as the pyPoll homework if you used a dictionary for that assignment.
      // Create an object to keep the number of markers in each layer.
      let stationCount = {
        COMING_SOON: 0,
        EMPTY: 0,
        LOW: 0,
        NORMAL: 0,
        OUT_OF_ORDER: 0
      };

      // Initialize stationStatusCode, which will be used as a key to access the appropriate layers, icons, and station count for the layer group.
      let stationStatusCode;

      // add json key, value pairs from arrays that have matching legacy_id's.  Order does not matter.
      const uniqueObjects = new Map();
      stationInfo.forEach(item => uniqueObjects.set(item.legacy_id, item));
      stationStatus.forEach(item => uniqueObjects.set(item.legacy_id, {...uniqueObjects.get(item.legacy_id), ...item}));
      const mergedArrays = Array.from(uniqueObjects.values());


      // Loop through the stations (they're the same size and have partially matching data).
      for (let i = 0; i < mergedArrays.length; i++) {

        // Create a new station object with properties of both station objects.
        // Object.assign() combines objects; for duplicates the object to the right is retained.
        let station = mergedArrays[i]

        // If a station is listed but not installed, it's coming soon.
        if (!station.is_installed) {
          stationStatusCode = "COMING_SOON";
        }
        // If a station has no available bikes, it's empty.
        else if (!station.num_bikes_available) {
          stationStatusCode = "EMPTY";
        }
        // If a station is installed but isn't renting, it's out of order.
        else if (station.is_installed && !station.is_renting) {
          stationStatusCode = "OUT_OF_ORDER";
        }
        // If a station has less than five bikes, it's status is low.
        else if (station.num_bikes_available < 5) {
          stationStatusCode = "LOW";
        }
        // Otherwise, the station is normal.
        else {
          stationStatusCode = "NORMAL";
        }
        // Update the station count.
        stationCount[stationStatusCode]++;

        // added marker to mapLayer
        // stationStatusCode is a string
        // station is a single JSON Object aka {}
        // this function is called within for loop (runs stationInfo.length times)
        markerLayers(stationStatusCode, station)
      }
      

      // ***************************************************** //
      // Create Legend
      document.querySelector(".legend").innerHTML = [
        "<p>Updated: " + moment.unix(updatedAt).format("h:mm:ss A") + "</p>",
        "<p class='out-of-order'>Out of Order Stations: " + stationCount.OUT_OF_ORDER + "</p>",
        "<p class='coming-soon'>Stations Coming Soon: " + stationCount.COMING_SOON + "</p>",
        "<p class='empty'>Empty Stations: " + stationCount.EMPTY + "</p>",
        "<p class='low'>Low Stations: " + stationCount.LOW + "</p>",
        "<p class='healthy'>Healthy Stations: " + stationCount.NORMAL + "</p>"
      ].join("");

    })
  })
} // end of function


// addes one-item (station) at a time to the layer function
function markerLayers(stationStatusCode, station){

  let newMarker = L.marker([station.lat, station.lon], {
    icon: markerLayerIcon(stationStatusCode)
  });

  // Add the new marker to the appropriate layer.
  newMarker.addTo(layerText2LayerFunction(stationStatusCode));

  // Bind a popup to the marker that will  display on being clicked. This will be rendered as HTML.
  newMarker.bindPopup(station.name + "<br> Capacity: " + station.capacity + "<br>" + station.num_bikes_available + " Bikes Available");

} // end function


// input the layer text and output L.ExtraMarkers function associated with that layer text
function markerLayerIcon(markerLayerText){
  let icon 
  switch(markerLayerText) {
    case "COMING_SOON":
      icon = L.ExtraMarkers.icon({
                                    icon: "ion-settings",
                                    iconColor: "white",
                                    markerColor: "yellow",
                                    shape: "star"
                                  })
      break;
    case "EMPTY":
      icon = L.ExtraMarkers.icon({
                                    icon: "ion-android-bicycle",
                                    iconColor: "white",
                                    markerColor: "red",
                                    shape: "circle"
                                  })
      break;
    case "OUT_OF_ORDER":
      icon = L.ExtraMarkers.icon({
                                    icon: "ion-minus-circled",
                                    iconColor: "white",
                                    markerColor: "blue-dark",
                                    shape: "penta"
                                  })
      break;
    case "LOW":
      icon = L.ExtraMarkers.icon({
                                    icon: "ion-android-bicycle",
                                    iconColor: "white",
                                    markerColor: "orange",
                                    shape: "circle"
                                  })
      break;
    default:
      // code block
      icon = L.ExtraMarkers.icon({
                                    icon: "ion-android-bicycle",
                                    iconColor: "white",
                                    markerColor: "green",
                                    shape: "circle"
                                  })
  }
  return icon

}  // end of function


// input the text and output the layer function
function layerText2LayerFunction(layerText){
  let layer  
  switch(layerText) {
    case "COMING_SOON":
        layer = COMING_SOON;
        break;
    case "EMPTY":
        layer = EMPTY;
        break;
    case "OUT_OF_ORDER":
        layer = OUT_OF_ORDER;
        break;
    case "LOW":
        layer = LOW;
        break;
    default:
        layer = NORMAL;
  }
  return layer

}