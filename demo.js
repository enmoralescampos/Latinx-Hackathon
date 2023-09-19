// Initialize the HERE Location Services platform with your API key
var platform = new H.service.Platform({
  apikey: 'nOs90Nl_EEDtnOiDCL1k97c3rkZjaZKBqibvMDBsSdk'
});

// Create default map layers for rendering
var defaultLayers = platform.createDefaultLayers();

// Create a new map instance and specify its properties
var map = new H.Map(
  document.getElementById('mapContainer'), // The HTML element where the map will be displayed
  defaultLayers.vector.normal.map,          // The type of map (in this case, a normal map)
  {
    center: { lat: 41.8721199 , lng: -87.6478325 }, // Initial center coordinates
    zoom: 17,                       // Initial zoom level
    pixelRatio: window.devicePixelRatio || 1 // Adjust pixel ratio for device resolution
  }
);

// Enable map interaction behaviors
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// Create a default user interface (UI) for the map
var ui = H.ui.UI.createDefault(map, defaultLayers);

// Add a window resize event listener to resize the map viewport
window.addEventListener("resize", () => map.getViewPort().resize());

// Add a click event listener to the search button
document.getElementById('searchButton').addEventListener('click', function() {
  var location = document.getElementById('locationInput').value; // Get the location input value
  var selectedPOIs = getSelectedPOIs(); // Get selected points of interest (POIs)
  geocode(location, selectedPOIs); // Geocode the entered location and display selected POIs
});

// Clear existing POIs and markers on the map
function clearPOIs() {
  map.removeObjects(map.getObjects()); // Remove all map objects
  document.getElementById('locationsList').innerHTML = ''; // Clear the locations list
}

// Get the selected POIs based on checkbox selections
function getSelectedPOIs() {
  var selectedPOIs = [];
  if (document.getElementById('evChargingCheckbox').checked) {
    selectedPOIs.push('EV Charging Stations');
  }
  if (document.getElementById('restaurantsCheckbox').checked) {
    selectedPOIs.push('Restaurants');
  }
  if (document.getElementById('shoppingCheckbox').checked) {
    selectedPOIs.push('Shopping');
  }
  return selectedPOIs;
}

// Geocode the provided location and display POIs
function geocode(query, selectedPOIs) {
  clearPOIs(); // Clear previous POIs before displaying new ones
  var searchService = platform.getSearchService();
  searchService.geocode({ q: query }, function(result) {
    onSuccess(result, selectedPOIs); // Handle geocoding success
  }, onError); // Handle geocoding error
}

// Handle geocoding success
function onSuccess(result, selectedPOIs) {
  var location = result.items[0].position;
  map.setCenter({ lat: location.lat, lng: location.lng });

  selectedPOIs.forEach(function(category) {
    fetchAndDisplayPOIs(location, category); // Fetch and display POIs for each selected category
  });
}

// Handle geocoding error
function onError(error) {
  console.error('Geocode error:', error);
}

// Fetch and display POIs for a specific location and category
function fetchAndDisplayPOIs(location, category) {
  var searchService = platform.getSearchService();
  searchService.discover({
    at: location.lat + ',' + location.lng, // Location coordinates
    q: category // Category to search for
  }, function(data) {
    data.items.forEach(function(item) {
      var listItem = document.createElement('li');
      listItem.textContent = item.title;
      document.getElementById('locationsList').appendChild(listItem);

      var coordinates = item.position;

      // Determine marker color based on category
      var markerColor = getMarkerColor(category);
      var poiMarker = new H.map.Marker(coordinates, { icon: createIcon(markerColor) });
      map.addObject(poiMarker);

      // Match the marker to the list item by setting the map center on list item click
      listItem.addEventListener('click', function() {
        map.setCenter(coordinates);
      });
    });
  }, onError); // Handle search error
}

// Define marker colors for different categories
function getMarkerColor(category) {
  switch (category) {
    case 'EV Charging Stations':
      return 'blue';
    case 'Restaurants':
      return 'red';
    case 'Shopping':
      return 'green';
    default:
      return 'black';
  }
}

// Create a colored marker icon using SVG
function createIcon(color) {
  var svgMarkup = '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">' +
                  '<circle cx="12" cy="12" r="10" fill="' + color + '"/>' +
                  '</svg>';

  return new H.map.Icon(svgMarkup);
}
