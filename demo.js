var platform = new H.service.Platform({
    apikey: 'nOs90Nl_EEDtnOiDCL1k97c3rkZjaZKBqibvMDBsSdk'
  });

  var defaultLayers = platform.createDefaultLayers();
  var map = new H.Map(
    document.getElementById('mapContainer'),
    defaultLayers.vector.normal.map,
    {
      center: { lat: 41.8721199 , lng: -87.6478325 },
      zoom: 17,
      pixelRatio: window.devicePixelRatio || 1
    }
  );

  var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

  var ui = H.ui.UI.createDefault(map, defaultLayers);
  window.addEventListener("resize", () => map.getViewPort().resize());

  document.getElementById('searchButton').addEventListener('click', function() {
    var location = document.getElementById('locationInput').value;
    var selectedPOIs = getSelectedPOIs();
    geocode(location, selectedPOIs);
  });

  // Clear existing POIs and markers on the map
  function clearPOIs() {
    map.removeObjects(map.getObjects());
    document.getElementById('locationsList').innerHTML = '';
  }

  // Get the selected POIs
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

  function geocode(query, selectedPOIs) {
    clearPOIs(); // Clear previous POIs before displaying new ones
    var searchService = platform.getSearchService();
    searchService.geocode({ q: query }, function(result) {
      onSuccess(result, selectedPOIs);
    }, onError);
  }

  function onSuccess(result, selectedPOIs) {
    var location = result.items[0].position;
    map.setCenter({ lat: location.lat, lng: location.lng });

    selectedPOIs.forEach(function(category) {
      fetchAndDisplayPOIs(location, category);
    });
  }

  function onError(error) {
    console.error('Geocode error:', error);
  }

  function fetchAndDisplayPOIs(location, category) {
    var searchService = platform.getSearchService();
    searchService.discover({
      at: location.lat + ',' + location.lng,
      q: category
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

        // Match the marker to the list item
        listItem.addEventListener('click', function() {
          map.setCenter(coordinates);
        });
      });
    }, onError);
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

  // Create a colored marker icon
  function createIcon(color) {
    var svgMarkup = '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">' +
                    '<circle cx="12" cy="12" r="10" fill="' + color + '"/>' +
                    '</svg>';

    return new H.map.Icon(svgMarkup);
  }