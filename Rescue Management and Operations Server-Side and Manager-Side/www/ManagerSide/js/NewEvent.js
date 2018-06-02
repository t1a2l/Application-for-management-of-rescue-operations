var mainFunction = (function()
{
	var webURL; // server url
	var LocationsArr;
	var center;
	var latitude;
	var longitude;
	var map;
	
	function NewEventForm(){ // send login info to server and recieve a session to work with
		var formData = new FormData();
		formData.append('EventName', document.getElementById('EventNam').value);
		if($("input[name='byType']:checked").val() == "City")
		{
			var locArr = document.getElementById('EventLoc');
			formData.append('EventLocation', locArr[locArr.value].text);
		}
		else
		{
			formData.append('EventLocation', latitude +', ' + longitude);
		}
		formData.append('EventDescription', document.getElementById('EventDes').value);
		formData.append('EventLostPic', document.getElementById('EventPic').value);
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
	
	function GetLocations(){ // Get locations from server (cities names)
		var CitiesFile = "excel/CitiesInIsrael.xlsx";
		var CityList = {targetFile : CitiesFile};
		ajaxRequest(CityList, webURL + "/locations_list.php", GetLocationsResult);
	}
	
	function GetLocationsResult(response){ // populate the select with cities names
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

	function initializeMap(){ // Set map start location
		center = new google.maps.LatLng(31.793058, 35.22500969);
		var mapOptions = {
			zoom: 7,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			center: center
		};

		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		var marker = new google.maps.Marker({ // Move marker to the wanted position
			map:map,
			draggable:true,
			animation: google.maps.Animation.DROP,
			position: center
		});
		
		google.maps.event.addListener(marker, 'dragend', function(){
			geocodePosition(marker.getPosition());
		});
	}
	
	function geocodePosition(pos){ // Get the positon of the marker and send it to the server
	   geocoder = new google.maps.Geocoder();
	   geocoder.geocode
		({
			latLng: pos
		}, 
			function(results, status) 
			{
				if (status == google.maps.GeocoderStatus.OK) 
				{
					latitude = results[0].geometry.location.lat();
					longitude = results[0].geometry.location.lng();
				} 
				else 
				{
					$("#mapErrorMsg").html('Cannot determine address at this location.'+status).show(100);
				}
			}
		);
	}
	
		
	$("document").ready(function(){
		webURL = serverURL(); // Server URL
		GetLocations();
		initializeMap();
		
		$('#NewEventForm').submit(function(event){ // Register the new event to the database
			event.preventDefault();
			NewEventForm();
		});
		
		$(document).on("click", "#RefreshBtn", function(){ // Create new event
			GetLocations();
		});
		
		$(document).on("click", "#MapBtn", function(){ // Choose location from the map
			$('#mapModal').modal({
				backdrop: 'static',
				keyboard: false
			}).on('shown.bs.modal', function () {
				google.maps.event.trigger(map, 'resize');
			});
		});
		
		$(document).on("click", "#BackBtn", function(){ // Go back to the main menu
			event.preventDefault();
			window.location.href = "MainPage.html";
		});
		
	
	});
}());