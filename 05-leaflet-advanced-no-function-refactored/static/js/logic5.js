// Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_information.json").then(function(infoRes){

// When the first API call completes, perform another call to the Citi Bike station status endpoint.
  d3.json("https://gbfs.citibikenyc.com/gbfs/en/station_status.json").then(function(statusRes) {
    // Pull the "stations" property off of response.data
    let updatedAt = infoRes.last_updated;
    let stationStatus = statusRes.data.stations;
    let stationInfo = infoRes.data.stations;

        // Create the map object with options
    let map = L.map("map-id", {
        center: [40.73, -74.0059],
        zoom: 12
    });

    // Create a legend to display information about our map.
    let info = L.control({
    position: "bottomright"
    });

    // When the layer control is added, insert a div with the class of "legend".
    info.onAdd = function() {
    let div = L.DomUtil.create("div", "legend");
    return div;
    };
    // Add the info legend to the map.
    info.addTo(map);

    // Initialize all the LayerGroups that we'll use.
    let layers = {
        COMING_SOON: new L.LayerGroup(),
        EMPTY: new L.LayerGroup(),
        LOW: new L.LayerGroup(),
        NORMAL: new L.LayerGroup(),
        OUT_OF_ORDER: new L.LayerGroup()
    };

    //******************************************************** */
    // Above Setup
    // Below Data Manipulation
    //******************************************************** */
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

    // Loop through the stations (they're the same size and have partially matching data).
    for (let i = 0; i < stationInfo.length; i++) {

      // Create a new station object with properties of both station objects.
      // Object.assign() combines objects; for duplicates the object to the right is retained.
      let station = Object.assign({}, stationInfo[i], stationStatus[i]);
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

      //************************************************************************ */
      // Above create counter with dictionary; same as Python Script - Election script
      // Below:  create markers; dictionary used like a case statement; icons has 5 key, value pairs
      // ie  icons["COMING_SOON"] returns  L.ExtraMarkers.icon({icon: "ion-settings", iconColor: "white", markerColor: "yellow", shape: "star"})
      //************************************************************************ */

         // Initialize an object that contains icons for each layer group.
      let icons = {
        COMING_SOON: L.ExtraMarkers.icon({
                                            icon: "ion-settings",
                                            iconColor: "white",
                                            markerColor: "yellow",
                                            shape: "star"
                                          }
        ),
        EMPTY: L.ExtraMarkers.icon({
                                      icon: "ion-android-bicycle",
                                      iconColor: "white",
                                      markerColor: "red",
                                      shape: "circle"
                                    }
        ),
        OUT_OF_ORDER: L.ExtraMarkers.icon({
                                            icon: "ion-minus-circled",
                                            iconColor: "white",
                                            markerColor: "blue-dark",
                                            shape: "penta"
                                          }
        ),
        LOW: L.ExtraMarkers.icon({
                                    icon: "ion-android-bicycle",
                                    iconColor: "white",
                                    markerColor: "orange",
                                    shape: "circle"
                                  }
        ),
        NORMAL: L.ExtraMarkers.icon({
                                      icon: "ion-android-bicycle",
                                      iconColor: "white",
                                      markerColor: "green",
                                      shape: "circle"
                                    }
        )
      };
      // Create a new marker with the appropriate icon and coordinates.
      // Remember that stationStatusCode is one of these values: ["COMING_SOON", "EMPTY", "OUT_OF_ORDER", "LOW", "NORMAL"]
      let newMarker = L.marker([station.lat, station.lon], {
        icon: icons[stationStatusCode]
      });

      // Add the new marker to the appropriate layer.
      newMarker.addTo(layers[stationStatusCode]);

      // Bind a popup to the marker that will  display on being clicked. This will be rendered as HTML.
      newMarker.bindPopup(station.name + "<br> Capacity: " + station.capacity + "<br>" + station.num_bikes_available + " Bikes Available");
    }


    // Send bikeMakerLayer to the map setup code (aka pass it into the createMap function)
    // No longer needed - bikeMarkerLayer replaces bikeStations in the below code once the functions are combined.
    //createMap(bikeMarkerLayer);


    //********************************************************************** */
    // Above, add markers to correct layer
    // Below, setup map structure
    //********************************************************************** */


    // Create the tile layer that will be the background of our map
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        id: "light-v10"
    }).addTo(map);

    // // Create a baseMaps object to hold the streetmap layer
    // // Not needed because I add streetmap to map above
    // let baseMaps = {
    //     "Street Map": streetmap
    // };

    // Create an overlayMaps object to hold the bikeStations layer
    let overlayMaps = {
        "Coming Soon": layers.COMING_SOON,
        "Empty Stations": layers.EMPTY,
        "Low Stations": layers.LOW,
        "Healthy Stations": layers.NORMAL,
        "Out of Order": layers.OUT_OF_ORDER
    };



    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    // Erin's change - I removed 'baseMaps' with null to remove the icon in the control box in the upper right of the html page
    L.control.layers(null, overlayMaps, {
        collapsed: false
    }).addTo(map);

    // note:  below, momoment is a javascript library; it must be linked in the HTML
    // This code is in the HTML:  
    // <!-- MomentJS -->
    // <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.15.1/moment.min.js"></script>
    document.querySelector(".legend").innerHTML = [
    "<p>Updated: " + moment.unix(updatedAt).format("h:mm:ss A") + "</p>",
    "<p class='out-of-order'>Out of Order Stations: " + stationCount.OUT_OF_ORDER + "</p>",
    "<p class='coming-soon'>Stations Coming Soon: " + stationCount.COMING_SOON + "</p>",
    "<p class='empty'>Empty Stations: " + stationCount.EMPTY + "</p>",
    "<p class='low'>Low Stations: " + stationCount.LOW + "</p>",
    "<p class='healthy'>Healthy Stations: " + stationCount.NORMAL + "</p>"
  ].join("");
  
  })
});