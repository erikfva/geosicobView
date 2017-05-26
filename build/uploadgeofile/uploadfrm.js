//antes de mostrar el dialogo se inicializan los estados y las variables.
$('#dlgUploadSHP').on('show.bs.modal', function (event) {
	$('li',this).remove();
	$('#drop',this).show();
	$('#modal-result',this).val('');
});

//funcion principal para mostrar el dialogo
function uploadSHP(__f){

	if(typeof __f === 'function'){
		$('#dlgUploadSHP').one('hide.bs.modal', function () {
			
			var r = $("#modal-result",this).val();
			//console.log('hide.bs.modal', r);
			if(r)
				__f(r);//$('<div class="alert alert-success" />').text(r).appendTo('body');
		});
	}
	$('#dlgUploadSHP').modal('show');
}

$(function(){
    var ul = $('#upload ul');

    $('#drop a').click(function(){
        // Simulate a click on the file input button
        // to show the file browser dialog
        $(this).parent().find('input').click();
    });

    // Initialize the jQuery File Upload plugin
    $('#upload').fileupload({

        // This element will accept file drag/drop uploading
        dropZone: $('#drop'),

        // This function is called when a file is added to the queue;
        // either via the browse button, or via drag/drop:
        add: function (e, data) {
        		
        		$('#drop').hide(); //Si solo se permite subir 1 archivo.

            var tpl = $('<li class="working">' +
            		'<div class="col-xs-8">' + 
            		'	<input type="text" value="0" data-width="48" data-height="48"' +
                ' data-fgColor="#0788a5" data-readOnly="1" data-bgColor="#3e4043" /><p></p>' +
                '</div>' +
                '<div class="col-xs-3"><div class="pull-right btn-toolbar">' +
                '	<a href="#" class="btn btn-danger"><span class="glyphicon glyphicon-trash"></span></a>' +
                '	<a href="#" class="btn btn-primary"><span class="glyphicon glyphicon-upload"></span></a>' +
                '</div></div><div class="clearfix" style="height:75px"></div>' +
                '<div class="message"></div>' +
						'</li>');
                
            data.msgboard = tpl.find('.message');

            // Append the file name and file size
            tpl.find('p').text(data.files[0].name)
                         .append('<i>' + formatFileSize(data.files[0].size) + '</i>');

            // Add the HTML to the UL element
            data.context = tpl.appendTo(ul);

            // Initialize the knob plugin
            tpl.find('input').knob();

            // Listen for clicks on the cancel icon
            tpl.find('a.btn-danger').click(function(){

                if(tpl.hasClass('working')){
                	if (typeof jqXHR !== 'undefined'){
                		jqXHR.abort();
                	}                 
                }

                tpl.fadeOut(function(){
                    tpl.remove();
                    $('#drop').show();
                });

            });
            
            var jqXHR;
            
            data.handleError = function(){
            		// Something has gone wrong!
            		data.context.addClass('error');
            		data.msgboard.html(
            		'<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
            		'	<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
            		'	    <span aria-hidden="true">&times;</span>' +
            		'	</button>' +
            		'	<strong>' + data.msg + '</strong>' +
            		'</div>');
            };
            
            tpl.find('a.btn-primary').click(function(){
            	
            	$(this).fadeOut();
            	
            	if(typeof GEOSICOB_KEY !== 'undefined') $('#upload input[name="session_key"]').val(GEOSICOB_KEY);
            	data.form[0].action = GEOSICOB_URL + 'geosicob_upload.php' ;
            	jqXHR = data.submit()
            	.fail(function (jqXHR, textStatus, errorThrown) {
            		data.msg =  errorThrown;
            		data.handleError.call();
            	})
            	.always(function (result, textStatus, jqXHR ) { 
            		
            		//console.log(result, textStatus, jqXHR);

            		if(textStatus === 'success'){           			
            			var r = JSON.parse(result);
            			//console.log(r);

            			if(r.success === '0'){
            				data.msg = r.msg;
            				data.handleError.call();
            				tpl.find('a.btn-primary').fadeIn();
            				return;
            			}
            			/*
            			tpl.fadeOut(function(){
                    tpl.remove();
                    $('#drop').show();
                	});
                	*/
                	$('#upload #modal-result').val(result);
                	$('#dlgUploadSHP .close').click();
            		}
            		           		
            	});
          	});
        },
        progress: function(e, data){

            // Calculate the completion percentage of the upload
            var progress = parseInt(data.loaded / data.total * 100, 10);

            // Update the hidden input field and trigger a change
            // so that the jQuery knob plugin knows to update the dial
            data.context.find('input').val(progress).change();

            if(progress == 100){
                data.context.removeClass('working');
                $('<h2 class="text-center text-info"><span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Analizando archivo...</h2>')
                .hide()
                .appendTo(data.msgboard).fadeIn();
            }
        }
    });

    // Prevent the default action when a file is dropped on the window
    $(document).on('drop dragover', function (e) {
        e.preventDefault();
    });

    // Helper function that formats the file sizes
    function formatFileSize(bytes) {
        if (typeof bytes !== 'number') {
            return '';
        }

        if (bytes >= 1000000000) {
            return (bytes / 1000000000).toFixed(2) + ' GB';
        }

        if (bytes >= 1000000) {
            return (bytes / 1000000).toFixed(2) + ' MB';
        }

        return (bytes / 1000).toFixed(2) + ' KB';
    }

});