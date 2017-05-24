if (ol.Map.prototype.getLayer === undefined) {    
		ol.Map.prototype.getLayer = function (id) {
        var layer = null;
        this.getLayers().forEach(function (lyr) {
            if (id == lyr.get('id')) {
                layer = lyr;
            }            
        });
        return layer;
		}
}
					
	function addGeojsonLayer(g){
		if (!!map.getLayer(g.id)){
			//console.log('ya esta cargado', o.sceneID);
			return;
		}
		var vectorSource = new ol.source.Vector({
			features: (new ol.format.GeoJSON({
         projection: 'EPSG:4326',
         featureProjection: 'EPSG:3857'
			})).readFeatures(typeof g.geojson !== 'object'? JSON.parse(g.geojson):g.geojson)
		});	
		var vectorLayer = new ol.layer.Vector({
			//style: styleFunction,
			id		:	g.id,
			title : g.title,
			type	: g.type || "undefined",
			source: vectorSource
		});	
    map.addLayer(vectorLayer);  
    var extent = vectorSource.getExtent();
    //console.log(extent);
    vectorLayer.setExtent(extent);
    map.getView().fit(extent, map.getSize());	
	}
	
	function loadGeojson(o){
  	if(o.lyrs && o.lyrs !== ''){
  		$.ajax({
  			url: GEOSICOB_URL + 'geojsonlist.php',
  			data:{"lyr_name":o.lyrs,"opciones":"webservice"},
  			success:function(response) {
  				//console.log(response);
  				if(typeof response.rows === 'undefined'){
  					
  				}
  				response.rows.forEach(function(item, i){
  					addGeojsonLayer({id: item.lyr_name, geojson : item.geojson, title : item.lyr_name, type : "geosicob", process:"identificar_predio"});
  				});
  				if(typeof o.success === 'function'){
  					o.success(response);
  				}
  			},
  			fail:function( jqXHR ) {
  				console.log(jqXHR);
  				if(typeof o.fail === 'function'){
  					o.fail(jqXHR);
  				}
  			}
  		});
  	}
	}

	function addSHP(data){
		//console.log(data);
		var json = JSON.parse(data);
		addGeojsonLayer({id: json.lyr_fix_si || json.lyr_uploaded, geojson : json[json.lyr_fix_si || json.lyr_uploaded], title : json.filesource.replace(".zip", ""), type : "geosicob"});
		showLayerList();
	} 