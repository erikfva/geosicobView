  /**
   * Elements that make up the popup.
   */
  var containerInf = document.getElementById('popupinfo');
  var contentInf = document.getElementById('popup-content');
  var closerInf = document.getElementById('popup-closer');


  /**
   * Create an overlay to anchor the popup to the map.
   */
  var overlayInf = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
    element: containerInf,
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  }));

  var displayFeatureInfo = function(evt) { 	
  	var coordinate = evt.coordinate;
  	var pixel = map.getEventPixel(evt.originalEvent);
  	var features = [];
  	
    map.forEachFeatureAtPixel(pixel, function(feature, layer) {
    	feature.setProperties({info_title: layer.getProperties().title}, true);
      features.push(feature);
    });

    if (features.length > 0) {
      var info = [];
      contentInf.innerHTML = '';
      for (var i in features) {
        var props = features[i].getProperties();
        contentInf.innerHTML += tmpl("tmpl-feature-info", props);
      }
      overlayInf.setPosition(coordinate);
    } else {
    	
    	var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
        coordinate, 'EPSG:3857', 'EPSG:4326'));

    	contentInf.innerHTML = '<p>You clicked here:</p><code>' + hdms +
        '</code>';
    }
    //overlayInf.setPosition(coordinate);

  };

  /**
   * Add a click handler to hide the popup.
   * @return {boolean} Don't follow the href.
   */
  closerInf.onclick = function() {
    overlayInf.setPosition(undefined);
    closerInf.blur();
    return false;
  };
  map.addOverlay(overlayInf);
	map.on('singleclick', function(evt) {

		displayFeatureInfo(evt);
	/*	
    var coordinate = evt.coordinate;
    var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
        coordinate, 'EPSG:3857', 'EPSG:4326'));

    contentInf.innerHTML = '<p>You clicked here:</p><code>' + hdms +
        '</code>';
    overlayInf.setPosition(coordinate);
  */
  
  });