function renderMapasBase(idcontainer){

 if (typeof window.jsonLayers !== 'undefined') return;

 if (typeof window.cloudURL == 'undefined')
 window.cloudURL = $("#base_url").val()+"application/assets/js/"; //'https://erikfva.github.io/geosicobView/';

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
    headHTML += '<link href="' + cloudURL + 'font-awesome.min.css" rel="stylesheet">';
    document.head.innerHTML = headHTML;
  }
  document.body.removeChild(span);
})();
	
		$.when(
     	$.get(cloudURL + 'mapas_base.min.css', function(data){
    		$('<style/>').text(data).appendTo('head');
    	}),
    	$.get(cloudURL + 'mapas_base.min.html', function(data){
    		$(data).filter('script').each(function(i,ss){
    			var s = document.createElement('script');
    			s.type = $(ss).attr('type') || 'text/javascript';
    			s.id = $(ss).attr('id') || '';
    			s.text = $(ss).text();
    			$("body").append(s);
    		});
    	}),
    	$.getJSON(cloudURL + 'base-maps.json', function( data ) {
    		window.jsonLayers = data.layers;
    	}),
    	typeof window.tmpl === 'function'?$.noop():$.get(cloudURL + 'tmpl.min.js',function(ss){
   			var s = document.createElement('script');
    		s.type = 'text/javascript';
    		s.text = ss;
    		$("body").append(s);
    	})
    ).then(function(){
    		renderBaseMapsPanel(jsonLayers,idcontainer);
    		$('[data-toggle="collapse"]').click(function(){
    			$($(this).attr('href')).toggleClass('collapse');
    			return false;
    		});
    },
    function (e) {
    	console.log(e, 'an error occurred somewhere');
  	});
}