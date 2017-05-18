function do_login()
{
	var user=$("#flogin #username").val();
	var pass=$("#flogin #password").val();
	if(user!=="" && pass!=="")
	{
		var $btn = $('#flogin #btnsubmit');
		$btn.button('loading');

		$.ajax
		({
			type:'post',
			url: GEOSICOB_URL + 'login.php',
			data:{
				opciones:"login,webservice",
				username:user,
				password:pass
			},
			success:function(response) {
				if(response.success && response.success=="1"){
					console.log(response);
					 $('#flogin').hide();
					 $('#flogout').find('#infoname').text(response.nombre).end().fadeIn();
					 GEOSICOB_KEY = response.session_key;
				}else{
					$("#flogin .msg-board").fadeIn().text(response.msg).delay(3200).fadeOut();
				}
				$btn.button('reset');
			}
		});
	}
	else{
		$("#flogin .msg-board").fadeIn().html('Ingrese el nombre de usuario y contrase&ntilde;a').delay(3500).fadeOut();
	}
	
	return false;
}
function do_logout()
{
		var $btn = $('#flogout #btnsubmit');
		$btn.button('loading');

		$.ajax
		({
			url: GEOSICOB_URL + 'logout.php',
			data:{
				opciones:"webservice",
				session_key:GEOSICOB_KEY,
			},
			complete:function() {			
				$btn.button('reset');
				$("#flogout").hide();
				$("#flogin").find("input").val('').end().fadeIn();
			}
		});

	return false;
}