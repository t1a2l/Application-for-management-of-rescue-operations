function ajaxRequest(SendObject, serverPage, myfunction, contentType, processData))
{
	if(typeof contentType == 'undefined')
		contentType = "application/x-www-form-urlencoded; charset=UTF-8";
	if(typeof processData == 'undefined')
		processData = true;
	$.ajax({ 
			type:'POST',
			url: serverPage,
			data:SendObject,
			processData: processData,
			contentType: contentType,
			crossDomain: true,
			beforeSend: function(xhr){
					xhr.withCredentials = true;
			},
			success:myfunction,
			error:function(xhr, status, error){
				var str = JSON.stringify(xhr);
				alert("xhr: " + str + "\nStatus: " + status + "\nError: " + error);
			}
	});
}

function lightOrDark(bgcolor){
	var r, b, g, hsp; 
	var a = bgcolor;

	if(a.match(/^rgb/)) 
	{
	  a = a.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
	  r = a[1];
	  g = a[2];
	  b = a[3];
	} 
	else {
	  a = +("0x" + a.slice(1).replace(a.length < 5 && /./g, '$&$&'));
	  r = a >> 16;
	  g = a >> 8 & 255;
	  b = a & 255;
	}

	hsp = Math.sqrt(
	  0.299 * (r * r) +
	  0.587 * (g * g) +
	  0.114 * (b * b)
	);

	if(hsp > 127.5) 
	{
	  return "light";
	} 
	else 
	{
	  return "dark";
	}
}








