//**********************************************//
//**Extendiendo las funciones del core OL, para buscar un layer mediante su id, ej.: map.getLayer(<lyrID>);
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
//**********************************************//
//** Agrega una capa vectorial a partir de un geoJSON. El parametro de entrada es un json con los sgtes atributos:		
//	id (alfanumerico): Identificador unico para la nueva capa.	
//	title (opcional) : Titulo para la nueva capa.
//	type (opcional) : Valor para clasificar la capa, util para procesos posteriores.
//										Ej.: Para las capas cargadas del geoSICOB se asiga automaticamente el valor de 'geosicob'.
//	geojson (texto/JSON): Contenido en formato geoJSON de la capa, el formato puede ser en texto plano o en JSON. 
	function addGeojsonLayer(o){
		if (!!map.getLayer(o.id)){
			//console.log('ya esta cargado', g.id);
			return;
		}
		var vectorSource = new ol.source.Vector({
			features: (new ol.format.GeoJSON({
         projection: 'EPSG:4326',
         featureProjection: 'EPSG:3857'
			})).readFeatures(typeof o.geojson !== 'object'? JSON.parse(o.geojson):o.geojson)
		});	
		var vectorLayer = new ol.layer.Vector({
			//style: styleFunction,
			id		:	o.id,
			title : o.title || ("Capa: " + o.id),
			type	: o.type || "undefined",
			source: vectorSource
		});	
    map.addLayer(vectorLayer);  
    var extent = vectorSource.getExtent();
    //console.log(extent);
    vectorLayer.setExtent(extent);
    map.getView().fit(extent, map.getSize());	
	}
//**********************************************//
// Carga una capa geoJSON desde el servidor del geoSICOB.
// Importante!!! declar antes la variable global "GEOSICOB_URL", ej.: var GEOSICOB_URL = 'http://192.168.50.9:8084/gsadmin';
//El parametro de entrada es un json con los sgtes. atributos:	
// lyrs : Array de json {id:<identificacion de la capa>, title:<Etiqueta para mostrar en el listado de capas>}, ej.: {id:"temp.f20170525efgcbad82cc4435_pred",title:"Predios encontrados"}.
// success (opcional): funcion de callbak (en caso de exito) a la que se le envia como parametro "response".
// fail (opcional ): funcion de callbak (en caso de error) a la que se le envia como parametro "jqXHR".
	function loadGeojson(o){
		var lyrs = '';
		o.lyrs.forEach(function(item, i){
			lyrs += (lyrs===''?'':',')+item.id;
		});
		
  	if(lyrs && lyrs !== ''){
  		$.ajax({
  			url: GEOSICOB_URL + 'geojsonlist.php',
  			data:{"lyr_name":lyrs,"opciones":"webservice"},
  			success:function(response) {
  				//console.log(response);
  				if(typeof response.rows === 'undefined'){
  					
  				}
  				response.rows.forEach(function(item, i){
  					
  					var lyr = o.lyrs.find(function(el){return el.id === item.lyr_name });
  					addGeojsonLayer({
  						id: item.lyr_name, 
  						geojson : item.geojson, 
  						title : lyr.title || ('Capa: ' + item.lyr_name), 
  						type : "geosicob", 
  						process: item.process || ""
  					});
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