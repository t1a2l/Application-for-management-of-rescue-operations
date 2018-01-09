var mainFunction = (function()
{
	var webURL = "http://ec2-13-59-23-31.us-east-2.compute.amazonaws.com"; // server url
	var deleteInterval;
	var LocationsArr;
	
	function NewEventForm(){ // send login info to server and recieve a session to work with
		if(typeof deleteInterval == 'undefined')
		{
			var formData = new FormData($('#NewEventForm')[0]);
			ajaxRequest(formData, webURL + "/event_create.php", NewEventFormResult, false, false);
		}
		else
		{
			alert("Event delete in progress...");
		}
	}
	
	function NewEventFormResult(response){ // Get user info to show the appopriate home screen
		response = response.trim();
		var myresponse = response.replace(/['"]+/g, '');
		alert(myresponse);
		if(myresponse.startsWith("success"))
		{
			window.location.href = "ActiveEvent.html";
		}
		else if(!isNaN(myresponse))
		{
			alert("DataBase connection failed");
			var interval = 1000 * 30; // where X is your every X minutes
			var deleteTable = {event_id : myresponse};
			deleteInterval = setInterval(ajaxRequest, interval, deleteTable, webURL + "/event_delete.php", DeleteResult);
		}
	}
	
	function DeleteResult(response){
		if(response)
		{
			clearInterval(deleteInterval);
			deleteInterval = undefined;
		}
	}
	
	function GetLocations(){
		var CitiesFile = "excel/CitiesInIsrael.xlsx";
		var CityList = {targetFile : CitiesFile};
		ajaxRequest(CityList, webURL + "/locations_list.php", GetLocationsResult);
	}
	
	function GetLocationsResult(response){
		var myresponse = response.replace(/\n|\r/g, "");
		if(myresponse)
		{
			$("#EventLoc").select2({
				data: myresponse
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
		
	$("document").ready(function(){
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