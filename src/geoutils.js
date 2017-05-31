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
//** FUNCIONES PARA APLICAR ESTILOS
//**********************************************//
var geosicobStyles = {
  "default" : {
  	border : { //stroke
  		color : 'blue',
  		lineCap : 'round', // extremos de la linea (butt, round, or square. Default is round).
  		lineJoin : 'round', //	junte de las lineas (bevel, round, or miter. Default is round).
  		lineDash: [], // estilo de linea punteada (An Array of numbers which specify distances 
  									 //	to alternately draw a line and a gap (in coordinate space units). 
  									 // If the number of elements in the array is odd, the elements of the array 
  									 // get copied and concatenated. 
  									 //For example, [5, 15, 25] will become [5, 15, 25, 5, 15, 25]. 
  									 //If the array is empty, the line dash list is cleared and line strokes return to being solid.)
  		lineDashOffset : 0.0, //Desplazamiento en relacion al maraco para empezar a dibujar la linea.
  		miterLimit : 10,
  		width: 2
  	},
  	fill : {
  		color : 'rgba(0, 0, 255, 0.1)'
  	},
  	text : {
  		field : 'sicob_id',
  		type : 'normal', //hide, shorten, wrap
  		maxresol : 1200,
      align:'Center',
      baseline:'Middle',
      size:20,
      offsetX:parseInt(0, 10),
      offsetY:parseInt(0, 10),
      weight:'bold',
      rotation:parseFloat(0),
      font: 'Arial',
      color:'blue',
      outlineColor:'#ffffff',
      outlineWidth:parseInt(3, 10)
    }
  },
  "titulado" : {
  	text : {
  		field : 'titulo',
  		color : 'green'
  	},
  	fill : {
  		color : 'green'
  	},
  	border : {
  		color : 'green'
  	}
  }
};
//** Retorna o asigna el estilo de un layer 
if (ol.layer.Layer.prototype.geosicobStyle === undefined){
    ol.layer.Layer.prototype.geosicobStyle = function(geosicobStyle){
    	if (!arguments.length) return this.getProperties().geosicobStyle; 
    	//console.log(this.getProperties().geosicobStyle);
    	jQuery.extend(true,this.getProperties().geosicobStyle,geosicobStyle);
    	//Object.assign(this.getProperties().geosicobStyle,geosicobStyle);
    }
}
//** Prepara el texto de la etiqueta
var getText = function(feature, resolution, geosicobStyle) {
  //console.log(feature);
  var type = geosicobStyle.text.type;
  var maxResolution = geosicobStyle.text.maxresol;
  var text = '' + feature.get(geosicobStyle.text.field);
  
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
//** Prepara la etiqueta	
var createTextStyle = function(feature, resolution, geosicobStyle) {
  var align = geosicobStyle.text.align;
  var baseline = geosicobStyle.text.baseline;
  var size = geosicobStyle.text.size;
  var offsetX = parseInt(geosicobStyle.text.offsetX, 10);
  var offsetY = parseInt(geosicobStyle.text.offsetY, 10);
  var weight = geosicobStyle.text.weight;
  var rotation = parseFloat(geosicobStyle.text.rotation);
  var font = weight + ' ' + size + 'px ' + geosicobStyle.text.font;
  var fillColor = geosicobStyle.text.color;
  var outlineColor = geosicobStyle.text.outlineColor;
  var outlineWidth = parseInt( geosicobStyle.text.outlineWidth, 10);
  
  return new ol.style.Text({
    textAlign: align,
    textBaseline: baseline,
    font: font,
    text: getText(feature, resolution, geosicobStyle),
    fill: new ol.style.Fill({color: fillColor}),
    stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
    offsetX: offsetX,
    offsetY: offsetY,
    rotation: rotation
  });
};
//** Prepara el borde
var createBorderStyle = function(feature, resolution, geosicobStyle) {
	var data = geosicobStyle.border;
	data.lineDashOffset= parseFloat(geosicobStyle.border.lineDashOffset);
	data.miterLimit= parseInt(geosicobStyle.border.miterLimit, 10);
	data.width= parseInt(geosicobStyle.border.width); 
  return new ol.style.Stroke(data);
};
//** Prepara el fondo
var createFillStyle = function(feature, resolution, geosicobStyle) {
	var data = geosicobStyle.fill;
	var color = ol.color.asArray(ol.color.asString(data.color));
	color = color.slice();
	color[3] = data.opacity || 0.1;  // change the alpha of the color
	data.color = ol.color.asString(color);
  return new ol.style.Fill(data);
};
//** Prepara el estilo = borde + fondo + etiqueta
function geosicobStylesFunction(feature, resolution, geosicobStyle) {
		return new ol.style.Style({
			stroke: createBorderStyle(feature, resolution, geosicobStyle),
			fill: createFillStyle(feature, resolution, geosicobStyle),
			text : createTextStyle(feature, resolution, geosicobStyle)
		})
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
		 
    function applyStylesFunction(feature, resolution) {
    	return geosicobStylesFunction(feature, resolution, vectorLayer.geosicobStyle())
		}
		
    var opVectorLayer = jQuery.extend (
    	true,
    	JSON.parse(JSON.stringify(o)),
    	{
				geosicobStyle: jQuery.extend(true,JSON.parse(JSON.stringify(geosicobStyles.default)) ,o.geosicobStyle || {}),
				id		:	o.id,
				title : o.title || ("Capa: " + o.id),
				type	: o.type || "undefined"
			},
			{
				style: applyStylesFunction,
				source: vectorSource
			}
		);		
		var vectorLayer = new ol.layer.Vector(opVectorLayer);	
    this.addLayer(vectorLayer);  
    var extent = vectorSource.getExtent();
    //console.log(extent);
    vectorLayer.setExtent(extent);
    this.getView().fit(extent, this.getSize());	
    return vectorLayer;
	}
}
//**********************************************//
// Carga una capa geoJSON desde el servidor del geoSICOB.
// Importante!!! declar antes la variable global "GEOSICOB_URL", ej.: window.GEOSICOB_URL = 'http://fon-l11/abt/';
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
			dataType: 'jsonp', // Notice! JSONP <-- P (lowercase)
			success:function(response) {
				//console.log(response);
				if(typeof response.rows === 'undefined'){
					
				}
				response.rows.forEach(function(item, i){
					
					var lyr = o.lyrs.find(function(el){return el.id === item.lyr_name });
					map.addGeojsonLayer({
						id: item.lyr_name, 
						geojson : item.geojson, 
						title : lyr.title || ('Capa: ' + item.lyr_name), 
						type : "geosicob", 
						geosicobStyle : lyr.geosicobStyle || {},
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

