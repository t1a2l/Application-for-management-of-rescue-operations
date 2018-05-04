var mainFunction = (function()
{
	var webURL; // server url
	var LocationsArr;
	
	function NewEventForm(){ // send login info to server and recieve a session to work with
		var formData = new FormData($('#NewEventForm')[0]);
		ajaxRequest(formData, webURL + "/event_create.php", NewEventFormResult, false, false);
	}
	
	function NewEventFormResult(response){ // Get user info to show the appopriate home screen
		response = response.trim();
		var myresponse = response.replace(/['"]+/g, '');
		if(myresponse.startsWith("success"))
		{
			myresponse = myresponse.replace('success','');
			alert(myresponse);
			window.location.href = "JoinEvent.html";
		}
		else
		{
			alert(myresponse);
		}
		
	}
	
	function GetLocations(){
		var CitiesFile = "excel/CitiesInIsrael.xlsx";
		var CityList = {targetFile : CitiesFile};
		ajaxRequest(CityList, webURL + "/locations_list.php", GetLocationsResult);
	}
	
	function GetLocationsResult(response){
		response = response.trim();
		if(response == "")
		{
			alert("שגיאה באיחזור נתונים");
		}
		else
		{
			results = JSON.parse(response);
			if(results)
			{
				$("#EventLoc").select2({
					dir: "rtl",
					data: results
				});
			}
			else
			{
				var defaultText = [{
					id: 0,
					text: 'Nothing'
				}];
				$("#EventLoc").select2({
					data: defaultText
				});
			}
		}
	}
		
	$("document").ready(function(){
		webURL = serverURL(); // server url
		GetLocations();
		
		$('#NewEventForm').submit(function(event){ // enter the homescreen
			event.preventDefault();
			NewEventForm();
		});
		
		$(document).on("click", "#RefreshBtn", function(){ // Create new event
			GetLocations();
		});
		
		$(document).on("click", "#BackBtn", function(){ // Create new event
			event.preventDefault();
			window.location.href = "MainPage.html";
		});
		
	});
}());