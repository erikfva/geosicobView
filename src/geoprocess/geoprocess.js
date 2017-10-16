function showFrmProcess(o){
	$('.sidebar-close:visible').trigger('click'); //cerrando el menu lateral

	var frm = $('#dlg-frmgeoprocess');
	if(frm.length){
		frm.find('.modal-title').html(o.title).end().find('.modal-body').empty().append(tmpl(o.templates.input,o));
	} else {
		frm = $('body').append(tmpl("tmpl-frmgeoprocess",o)).find('#dlg-frmgeoprocess');
	}
	frm.find('.msg-board').hide();
	frm.modal('show');
}

function runGeoprocess(gp){

	if(gp.actions && gp.actions.onBeforeRun && gp.actions.onBeforeRun !== '' && typeof window[gp.actions.onBeforeRun] === 'function' && !window[gp.actions.onBeforeRun]())
		return;

	var frm = $('#dlg-frmgeoprocess form');
	var in_data = frm.serializeFormJSON();
		var $btn = frm.find('#btnsubmit');

		in_data.x_proceso = gp.id;
		in_data.opciones = 'webservice';
		in_data.x_opcionestxt = '';
		in_data.session_key = GEOSICOB_KEY;
		$btn.button('loading');
		showAlertMsg({container:"#dlg-frmgeoprocess .msg-board", typemsg : "alert-info", msg : "<h4>" + "Espere por favor..." + "</h4>", delay: 0});
		$.ajax
		({
			type:'post',
			url: GEOSICOB_URL + 'geoprocesamientoadd.php',
			data: in_data, //frm.serialize(),
			success:function(response) {
				if(response.success && response.success!="0"){

					showAlertMsg({container:"#dlg-frmgeoprocess .msg-board", typemsg : "alert-info", msg : "<h4>" + response.msg + "</h4>", delay:0});
					var idgeoproceso = response.idgeoproceso;
					var refreshIntervalId = setInterval(function(){
						$.ajax
						({
							dataType : 'json',
							url: GEOSICOB_URL + 'geoprocesamientolist.php',
							data:{cmd:"search",x_idgeoproceso : idgeoproceso, opciones:"webservice"},
							beforeSend: function( xhr ) {
								showAlertMsg({container:"#dlg-frmgeoprocess .msg-board", typemsg : "alert-info", msg : "<div><i class=\"fa fa-clock-o fa-spin fa-fw fa-3x\"></i><span class=\"h4 pull-left\">Espere por favor...</span></div>"});
							},
							success:function(response) {
								if( parseInt(response.pager.RecordCount) > 0){

									var out_data = JSON.parse(response.rows[0].salida) || {};

									if(jQuery.isEmptyObject(out_data)){ // Todavia no tiene listo el resultado.
										showAlertMsg({container:"#dlg-frmgeoprocess .msg-board", typemsg : "alert-info", msg : "<div><i class=\"fa fa-cog fa-spin fa-fw fa-3x\"></i><span class=\"h4 pull-left\">Procesando...</span></div>", delay: 0});
										return;
									}
									if(out_data.hasOwnProperty('error')){ // Se produjo un error!!!.
										showAlertMsg({container:"#dlg-frmgeoprocess .msg-board", typemsg : "alert-danger", msg : out_data.error, delay: 0});
										clearInterval(refreshIntervalId);
										$btn.button('reset');
										return;
									}
									//El resultado ya esta listo!!!.
									clearInterval(refreshIntervalId);
									$btn.button('reset');
									showAlertMsg({container:"#dlg-frmgeoprocess .msg-board", typemsg : "alert-success", msg : "<div><i class=\"fa fa-thumbs-o-up fa-3x\"></i><span class=\"h4 pull-left\">Proceso completado.</span></div>",delay:400});
									if(response.rows[0].geojson)
										out_data.lyr_geojson = response.rows[0].geojson;

									if(gp.actions && gp.actions.onSuccess && gp.actions.onSuccess !== '' && typeof window[gp.actions.onSuccess] === 'function')
										if(!window[gp.actions.onSuccess](out_data)) return;

									$('#dlg-frmgeoprocess .close').click();
									if(gp.templates && gp.templates.result){
										var htmlresult = tmpl('tmpl-geoprocess-result', {"gp": gp, "in":in_data,"out":out_data});
										$('#tool-geoprocess-history').prepend(document.getElementById('tool-geoprocess-result').innerHTML);

										document.getElementById('tool-geoprocess-result').innerHTML = htmlresult;

										$('#geoprocess-count').text(parseInt($('#geoprocess-count').text())+1);
										$('a[href="#tool-geoprocess-history"]').show();
										$('a[href="#geoprocesses"]').trigger('click').delay(800).promise().done(
                      function(){
                        $('a[href="#tool-geoprocess-result"]').show().trigger('click');
                      }
                    );
									}
								}
							},
							error : function(){
								clearInterval(refreshIntervalId);
								$btn.button('reset');
							}
						});
					}, 3000);
					$('#dlg-frmgeoprocess').one('hide.bs.modal',function(){
						clearInterval(refreshIntervalId); //cancelando el geoproceso.
					});
				}else{ //no se pudo ejecutar el geoprocesamiento.

					showAlertMsg({container:"#dlg-frmgeoprocess .msg-board", typemsg : "alert-danger", msg : response.msg, delay: 0});
					$btn.button('reset');
				}

			},
			error : function( jqXHR , textStatus, errorThrown ){
				$btn.button('reset');
				showAlertMsg({container:"#dlg-frmgeoprocess .msg-board", typemsg : "alert-danger", msg : textStatus, delay: 0});
			}
		});

	return false;
}

function renderGeoprocessPanel(_json, idContainer){
		var container = document.getElementById(idContainer);
		if(typeof container === 'undefined') return;
		$(container).addClass('basemap container-fluid');

    var htmlx = tmpl("tmpl-geoprocess-item", _json);
		$(container).append(htmlx);
}
