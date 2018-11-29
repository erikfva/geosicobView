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
	"default": {
		filter: [], //https://docs.geoserver.org/stable/en/user/styling/mbstyle/reference/spec.html#types-filter
		//Vector with three elements:
		//[0] = logical operation, ej: '==', '!=', '>', '>=', '<', <='.
		//[1] = field name for operation.
		//[2] = value for operation.
		//Ej.: filter: ['>=', 'poblation', '2000'] 
		icon: {
			file: "",
			maxresol: 1200,
			position: "center", //left,right,top,bottom,top-left,top-right,bottom-left,bottom-right
			/** opacity, scale **/
		},
		border: { //stroke
			color: 'blue',
			lineCap: 'round', // extremos de la linea (butt, round, or square. Default is round).
			lineJoin: 'round', //	junte de las lineas (bevel, round, or miter. Default is round).
			lineDash: [], // estilo de linea punteada (An Array of numbers which specify distances
			//	to alternately draw a line and a gap (in coordinate space units).
			// If the number of elements in the array is odd, the elements of the array
			// get copied and concatenated.
			//For example, [5, 15, 25] will become [5, 15, 25, 5, 15, 25].
			//If the array is empty, the line dash list is cleared and line strokes return to being solid.)
			lineDashOffset: 0.0, //Desplazamiento en relacion al maraco para empezar a dibujar la linea.
			miterLimit: 10,
			opacity: 1,
			width: 2
		},
		fill: {
			color: 'rgba(0, 0, 255, 0.1)'
		},
		text: {
			field: '',
			type: 'normal', //hide, shorten, wrap
			maxresol: 1200,
			align: 'center',
			baseline: 'middle', //Text base line. Possible values: 'bottom', 'top', 'middle', 'alphabetic', 'hanging', 'ideographic'.
			size: 20,
			offsetX: parseInt(0, 10),
			offsetY: parseInt(0, 10),
			weight: 'bold',
			rotation: parseFloat(0),
			font: 'Arial',
			color: '#000000',
			outlineColor: '#ffffff',
			outlineWidth: 3, //parseInt(2, 10),
			overflow: false,
		}
	},
	"titulado": {
		text: {
			field: 'titulo',
			color: 'green'
		},
		fill: {
			color: 'green'
		},
		border: {
			color: 'green'
		}
	}
};
//** Retorna o asigna el estilo de un layer
if (ol.layer.Base.prototype.geosicobStyle === undefined){
    ol.layer.Base.prototype.geosicobStyle = function(geosicobStyle){
    	if (!arguments.length) return this.getProperties().geosicobStyle;
    	//console.log(this.getProperties().geosicobStyle);
    	jQuery.extend(true,this.getProperties().geosicobStyle,geosicobStyle);
    	//Object.assign(this.getProperties().geosicobStyle,geosicobStyle);
    }
}
//** Prepara el texto de la etiqueta
function stringDivider(str, width, spaceReplacer) {
	if (str.length>width) {
			var p=width
			for (;p>0 && str[p]!=' ';p--) {
			}
			if (p>0) {
					var left = str.substring(0, p);
					var right = str.substring(p+1);
					return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
			}
	}
	return str;
}
var getText = function(feature, resolution, gvStyle) {
  //console.log(feature);
  var type = gvStyle.text.type;
  var maxResolution = gvStyle.text.maxresol;
  var text = '' + feature.get(gvStyle.text.field);
  //console.log(maxResolution,resolution);

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
var createTextStyle = function(feature, resolution, gvStyle) {
	var align = gvStyle.text.align;
	var baseline = gvStyle.text.baseline;
	var size = gvStyle.text.size;
	var offsetX = parseInt(gvStyle.text.offsetX, 10);
	var offsetY = parseInt(gvStyle.text.offsetY, 10);
	var weight = gvStyle.text.weight;
	var placement = gvStyle.text.placement ? gvStyle.text.placement.value : undefined;
	var maxAngle = gvStyle.text.maxangle ? parseFloat(gvStyle.text.maxangle) : undefined;
	var overflow = gvStyle.text.overflow ? (gvStyle.text.overflow == 'true') : undefined;
	var rotation = parseFloat(gvStyle.text.rotation);
	if (gvStyle.text.font == '\'Open Sans\'' && !openSansAdded) {
	  var openSans = document.createElement('link');
	  openSans.href = 'https://fonts.googleapis.com/css?family=Open+Sans';
	  openSans.rel = 'stylesheet';
	  document.getElementsByTagName('head')[0].appendChild(openSans);
	  openSansAdded = true;
	}
	var font = weight + ' ' + size + ' ' + gvStyle.text.font;
	var fillColor = gvStyle.text.color;
	var outlineColor = gvStyle.text.outlineColor;
	var outlineWidth = parseInt( gvStyle.text.outlineWidth, 10);

	return new ol.style.Text({
	  textAlign: align == '' ? undefined : align,
	  textBaseline: baseline,
	  font: font,
	  text: getText(feature, resolution, gvStyle),
	  fill: new ol.style.Fill({color: fillColor}),
	  stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
	  offsetX: offsetX,
	  offsetY: offsetY,
	  placement: placement,
	  maxAngle: maxAngle,
	  overflow: overflow,
	  rotation: rotation
	});
};
/* var createTextStyle = function(feature, resolution, gvStyle) {
  
	var align = gvStyle.text.align;
  var baseline = gvStyle.text.baseline;
  var size = gvStyle.text.size;
  var offsetX = parseInt(gvStyle.text.offsetX, 10);
  var offsetY = parseInt(gvStyle.text.offsetY, 10);
  var weight = gvStyle.text.weight;
  var rotation = parseFloat(gvStyle.text.rotation);
  var font = weight + ' ' + size + 'px ' + gvStyle.text.font;
  var fillColor = gvStyle.text.color;
  var outlineColor = gvStyle.text.outlineColor;
  var outlineWidth = parseInt( gvStyle.text.outlineWidth, 10);
	var	overflow = gvStyle.text.overflow;


  return new ol.style.Text({
    textAlign: align,
    textBaseline: baseline,
    font: font,
    text: getText(feature, resolution, gvStyle),
    fill: new ol.style.Fill({color: fillColor}),
    stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
    offsetX: offsetX,
    offsetY: offsetY,
		rotation: rotation,
		overflow: overflow,
  });
}; */
//** Prepara el borde
var createBorderStyle = function(feature, resolution, gvStyle) {
	var data = gvStyle.border;
	data.lineDashOffset= parseFloat(gvStyle.border.lineDashOffset);
	data.miterLimit= parseInt(gvStyle.border.miterLimit, 10);
	data.width= parseInt(gvStyle.border.width);
	if(data.width == 0) data.opacity = 0;
	var color = ol.color.asArray(ol.color.asString(data.color));
	color = color.slice();
	color[3] = isNaN(data.opacity)?1:data.opacity;  // change the alpha of the color
	data.color = ol.color.asString(color);
  return new ol.style.Stroke(data);
};
//** Prepara el fondo
var createFillStyle = function(feature, resolution, gvStyle) {
	var data = gvStyle.fill;
	var color = ol.color.asArray(ol.color.asString(data.color));
	color = color.slice();
	color[3] = data.opacity || 0.1;  // change the alpha of the color
	data.color = ol.color.asString(color);
  return new ol.style.Fill(data);
};
//** Prepara el icono
var createIconStyle = function(feature, resolution, gvStyle) {
	var data = gvStyle.icon;
	if(gvStyle.icon.file != '')
		data.src = gvStyle.icon.file;
	data.opacity = data.opacity || 1;
	if (resolution > data.maxresol) 
		data.opacity = 0;
	switch (data.position) {
		case 'center':
			data.anchor = [0.5, 0.5];
			break;
		case 'top':
			data.anchor = [0.5, 0];
			break;
		case 'bottom':
			data.anchor = [0.5, 1];
			break;
	}
	return new ol.style.Icon(data);
}

function gvMixedStyle(feature, gvStyles){
	//console.log(feature.getProperties());
	var gvStyle = JSON.parse(JSON.stringify(geosicobStyles.default));
	var properties = feature.getProperties();
	for(let i=0; i<gvStyles.length; i++){
		// do something
		var gvNStyle =  gvStyles[i];
		var apply = true;
		if(gvNStyle.filter && Array.isArray(gvNStyle.filter) && gvNStyle.filter.length >= 3){
			//console.log(gvNStyle.filter);
			var operator = gvNStyle.filter[0];
			var key = gvNStyle.filter[1];
			var value1 = properties[key];
			var value2 = gvNStyle.filter[2];
			var isNumeric = !isNaN(value2);
			switch (operator) {
				case '==':
					apply = isNumeric? Number(value1) == Number(value2): value1 == value2;
					break;
				case '!=':
					apply = isNumeric? Number(value1) != Number(value2): value1 != value2;
					break;
				case '>':
					apply = isNumeric? Number(value1) > Number(value2): value1 > value2;
					break;
				case '>=':
					apply = isNumeric? Number(value1) >= Number(value2): value1 >= value2;
					break;
				case '<':
					apply = isNumeric? Number(value1) < Number(value2): value1 < value2;
					break;
				case '<=':
					apply = isNumeric? Number(value1) <= Number(value2): value1 <= value2;
					break;
			}
		}
		if(apply)
			jQuery.extend(true,gvStyle, gvNStyle);
	}
	//console.log(gvStyle);
	return gvStyle;
}

//** Prepara el estilo = borde + fondo + etiqueta
function geosicobStylesFunction(feature, resolution, geosicobStyle) {
	var gvStyle = gvMixedStyle(feature, geosicobStyle);
	var data = {
		stroke : createBorderStyle(feature, resolution, gvStyle),
		fill : createFillStyle(feature, resolution, gvStyle),
	}
	if(gvStyle.text.field != '') 
		data.text =  createTextStyle(feature, resolution, gvStyle);

	if(gvStyle.icon.file != '') 
		data.image = createIconStyle(feature, resolution, gvStyle);
		return new ol.style.Style(data)
}
//**********************************************//
//** Agrega una capa vectorial a partir de un geoJSON. El parametro de entrada es un json con los sgtes atributos:
//	id (alfanumerico): Identificador unico para la nueva capa.
//	title (opcional) : Titulo para la nueva capa.
//	type (opcional) : Valor para clasificar la capa, util para procesos posteriores.
//	Ej.: Para las capas cargadas del geoSICOB se asiga automaticamente el valor de 'geosicob'.
//	geojson (texto/JSON): Contenido en formato geoJSON de la capa, el formato puede ser en texto plano o en JSON.
//  url (opcional) : Carga el geoJSON mediante llamada AJAX a la URL dada.
if (ol.Map.prototype.addGeojsonLayer === undefined) {
	ol.Map.prototype.addGeojsonLayer = function addGeojsonLayer(o){
	var lyr = this.getLayer(o.id); //buscando si ya existe el layer
	if (!!lyr){
		//console.log('ya esta cargado', g.id);
		if(!!!o.replace) return;
		this.removeLayer(lyr);		
	}
	var olMap = this;
	var createLayer = function(){
		if(typeof o.geojson == 'string'){
		o.geojson = o.geojson.replace(/\\"/g,'\\"');
		}
		//console.log(o.geojson)
		//if(!o.geojson.features) return; //si no existen elementos.

		var vectorSource = new ol.source.Vector({
			features: (new ol.format.GeoJSON({
				projection: 'EPSG:4326',
				featureProjection: 'EPSG:3857'
			})).readFeatures(typeof o.geojson !== 'object'? JSON.parse(o.geojson):o.geojson)
		});

		function applyStylesFunction(feature, resolution) {
			//fix: cut icon/labels in border of layer extent.
			let factor = 50
			let dx = resolution * factor;
			let dy = resolution * factor;
			let newextent = [
				extent[0] - dx,
				extent[1] - dy,
				extent[2] + dx,
				extent[3] + (dy + factor + (resolution/10*2*factor) ) //Se aumenta unos pixeles para que no se corte la parte del icono que queda fuera del recuadro.
			]
			vectorLayer.setExtent(newextent);
			return geosicobStylesFunction(feature, resolution, vectorLayer.geosicobStyle())
		}
		o.id = o.id || 'newgeojson';
		var opVectorLayer = jQuery.extend (
			true,
			o, //JSON.parse(JSON.stringify(o)),
			{
				geosicobStyle: o.geosicobStyle || [{}], //JSON.stringify(o.geosicobStyle || [{}]),
				id		:	o.id,
				title : o.title || ("Capa: " + o.id),
				type	: o.type || "undefined"
			},
			{
				style: applyStylesFunction,
				source: vectorSource,
				declutter: true
			}
		);

		if(!Array.isArray(opVectorLayer.geosicobStyle)){
			opVectorLayer.geosicobStyle = [opVectorLayer.geosicobStyle];
		}

		var vectorLayer = new ol.layer.Vector(opVectorLayer);
		olMap.addLayer(vectorLayer);
		var extent = vectorSource.getExtent();
		//console.log(extent);
		vectorLayer.setExtent(extent);
		if(!isNaN(olMap.getSize()[0]))
		olMap.getView().fit(extent, olMap.getSize());
		
		var infoContainer = document.getElementById('tool-geoprocess-result');
		if(infoContainer){
			infoContainer.innerHTML = tmpl('tmpl-attribute-table', {id: o.id});
			$('a[href="#tool-geoprocess-result"]').removeClass('collapse');
			if(!!o.showtable){
				$('a[href="#geoprocesses"]').trigger('click').delay(800).promise().done(
					function(){
						$('a[href="#tool-geoprocess-result"]').trigger('click');
					}
				)
			}
		}
		return vectorLayer;			
	}
	
	var url = o.url || '';
	if( url != '' ){
		$.ajax({
			 'global': false,
			 'url': url,
			 'dataType': "json",
			 'success': function (data) {
				if(!data.features) return null; //si no existen elementos
				o.geojson = data;
				return createLayer();
			 }
		});		
	} else {
		return createLayer();
	} 
}
}
//**********************************************//
//** Agrega una capa vectorial de tipo PUNTO. El parametro de entrada es un json con los sgtes atributos:
if (ol.Map.prototype.addPointLayer === undefined) {
	ol.Map.prototype.addPointLayer = function addPointLayer(o){
	//op.lon = longitud
	//op.lat = latitud
	//op.properties = atributos de informacion del punto
	//Cualquier otro parametro para la funcion addGeojsonLayer por ejemplo:
	//	geosicobStyle = estilo para dibujar el punto (GeoVision Style)
		var olMap = this;
		var ran = Math.floor((Math.random() * 1000) + 1);
		var GeoJSON = {
			type:"FeatureCollection",
			crs:{type:"name",properties:{name:"EPSG:4326"}},
			features:[{
				type:"Feature",
				geometry:{
					type:"Point",
					coordinates:[parseFloat(o.lon),parseFloat(o.lat)]
				},
				properties: o.properties || {nombrepunto:"Nuevo punto"}
			}]
		}

		o.id = o.id || ('punto' + ran);
		o.geojson = GeoJSON;
		o.title = o.title || ('Capa: ' + o.id );
		o.geosicobStyle = o.geosicobStyle || {};
		o.process = o.process || "";
		olMap.addGeojsonLayer(o);
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
