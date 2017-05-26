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
if (ol.Map.prototype.addGeojsonLayer === undefined) {    
		ol.Map.prototype.addGeojsonLayer = function addGeojsonLayer(o){
		if (!!this.getLayer(o.id)){
			//console.log('ya esta cargado', g.id);
			return;
		}
		var vectorSource = new ol.source.Vector({
			features: (new ol.format.GeoJSON({
         projection: 'EPSG:4326',
         featureProjection: 'EPSG:3857'
			})).readFeatures(typeof o.geojson !== 'object'? JSON.parse(o.geojson):o.geojson)
		});	
		
		var odefaultstyle = {
			text : {
				field : 'sicob_id',
				type : 'normal',
				maxresol : 1200,
        align:'Center',
        baseline:'Middle',
        size:20,
        offsetX:parseInt(0, 10),
        offsetY:parseInt(0, 10),
        weight:'bold',
        rotation:parseFloat(0),
        font: 'Arial',
        fillColor:'blue',
        outlineColor:'#ffffff',
        outlineWidth:parseInt(3, 10)
      }
		};
		
    var getText = function(feature, resolution, ostyle) {
    	//console.log(ostyle);
        var type = ostyle.text.type;
        var maxResolution = ostyle.text.maxresol;
        var text = '' + feature.get(ostyle.text.field);

        if (resolution > maxResolution) {
          text = '';
        } else if (type == 'hide') {
          text = '';
        } else if (type == 'shorten') {
          text = text.trunc(12);
        } else if (type == 'wrap') {
          text = stringDivider(text, 16, '\n');
        }

        return text;
      };		
		var createTextStyle = function(feature, resolution, ostyle) {
        var align = ostyle.text.align;
        var baseline = ostyle.text.baseline;
        var size = ostyle.text.size;
        var offsetX = parseInt(ostyle.text.offsetX, 10);
        var offsetY = parseInt(ostyle.text.offsetY, 10);
        var weight = ostyle.text.weight;
        var rotation = parseFloat(ostyle.text.rotation);
        var font = weight + ' ' + size + 'px ' + ostyle.text.font;
        var fillColor = ostyle.text.fillColor;
        var outlineColor = ostyle.text.outlineColor;
        var outlineWidth = parseInt( ostyle.text.outlineWidth, 10);

        return new ol.style.Text({
          textAlign: align,
          textBaseline: baseline,
          font: font,
          text: getText(feature, resolution, ostyle),
          fill: new ol.style.Fill({color: fillColor}),
          stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
          offsetX: offsetX,
          offsetY: offsetY,
          rotation: rotation
        });
      };

		var geosicobStyles = {
    	default: new ol.style.Style({
    		stroke: new ol.style.Stroke({
    			color: 'blue',
    			//lineDash: [4],
    			width: 2
    		}),
    		fill: new ol.style.Fill({
    			color: 'rgba(0, 0, 255, 0.1)'
    		})
    	})
    };
    
    var opVectorLayer = {
			ostyle: o.ostyle || odefaultstyle,
			style: geosicobStylesFunction,
			id		:	o.id,
			title : o.title || ("Capa: " + o.id),
			type	: o.type || "undefined",
			source: vectorSource
		};  
    
    function geosicobStylesFunction(feature, resolution) {
    	if (feature.get('geosicobStyle')) {
        return geosicobStyles.blue;
    	} else {
    		geosicobStyles.default.setText(createTextStyle(feature, resolution, vectorLayer.O.ostyle));
    		return geosicobStyles.default;
    	}
		}
		
		var vectorLayer = new ol.layer.Vector(opVectorLayer);	
    this.addLayer(vectorLayer);  
    var extent = vectorSource.getExtent();
    //console.log(extent);
    vectorLayer.setExtent(extent);
    this.getView().fit(extent, this.getSize());	
	}
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