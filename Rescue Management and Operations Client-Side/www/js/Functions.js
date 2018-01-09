function ajaxRequest(SendObject, serverPage, myfunction)
{
	$.ajax({ 
			type:'POST',
			url: serverPage,
			data:SendObject,
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

function DropDownPopulate(objectFromServer, selectBoxArray, propertyNameArray)
{
		if(objectFromServer == null) 
		{
			alert("בעיה במילוי התיבה!");
			return;
		}
		var i;
		for(i = 0; i < objectFromServer.length; i++)
		{
			var k;
			for(k = 0; k < objectFromServer[i].length; k++)
			{
				selectBoxArray[i].options[selectBoxArray[i].options.length] = new Option(objectFromServer[i][k][propertyNameArray[i]], objectFromServer[i][k][propertyNameArray[i]]);
			}
		}
		
}


function Sort(MyArr, sortVar, property) // Sorting dates ascending/descending
{ 
		
		if(sortVar == 0)
		{
			MyArr.sort(function(a, b){ // Sorting dates ascending
				if(a[property] > b[property]) 
					return -1
				else if (a[property] < b[property]) 
					return 1 
				else  
					return 0 
			});
		}
		else if(sortVar == 1)
		{
			MyArr.sort(function(a, b){ // Sorting dates descending
				if(a[property] > b[property]) 
					return 1
				else if (a[property] < b[property])
					return -1 
				else  
					return 0
			});
		}
		return MyArr;
}




