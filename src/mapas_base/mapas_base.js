	/*
  fetch('../build/mapas_base.html').then((resp) => resp.text())
.then(data => {
  var div = document.body.appendChild(document.createElement('div'));
  div.style.display = 'none';
  div.innerHTML = data;
  //console.log(data);
});
*/
function renderMapasBase(idcontainer){

 if (typeof window.jsonLayers !== 'undefined') return;

(function () {
  var span = document.createElement('span');
  
  span.className = 'fa';
  span.style.display = 'none';
  document.body.insertBefore(span, document.body.firstChild);
  
  function css(element, property) {
    return window.getComputedStyle(element, null).getPropertyValue(property);
  }
  
  if (css(span, 'font-family') !== 'FontAwesome') {
    var headHTML = document.head.innerHTML;
    headHTML += '<link href="https://opensource.keycdn.com/fontawesome/4.7.0/font-awesome.min.css" rel="stylesheet">';
    document.head.innerHTML = headHTML;
  }
  document.body.removeChild(span);
})();


    $.when(
    	$.getJSON('http://anyorigin.com/go?url=http%3A//geosicob.bitballoon.com/mapas_base.min.html&callback=?', function(data){
    		$(data.contents).filter('script').each(function(i,ss){
    			var s = document.createElement('script');
    			s.type = $(ss).attr('type') || 'text/javascript';
    			s.id = $(ss).attr('id') || '';
    			s.text = $(ss).text();
    			$("body").append(s);
    		});
    	}),
    	$.get('http://res.cloudinary.com/erikvargas/raw/upload/v1495635822/geosicob/base-maps.json',{ dataType: "json" },function(data){
    		window.jsonLayers = data.layers;
    	}),
    	typeof window['tmpl'] === 'function'?$.noop():$.get('https://cdn.rawgit.com/blueimp/JavaScript-Templates/master/js/tmpl.min.js',function(ss){
   			var s = document.createElement('script');
    		s.type = 'text/javascript';
    		s.text = ss;
    		$("body").append(s);
    	}),
    	$.getJSON('http://anyorigin.com/go?url=http%3A//geosicob.bitballoon.com/mapas_base.min.css&callback=?', function(data){
    		$('<style/>').text(data.contents).appendTo('head');
    	})
    ).then(function(d,e){
    		renderBaseMapsPanel(e[0].layers,idcontainer);
    });
}