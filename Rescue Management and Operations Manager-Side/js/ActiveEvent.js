var mainFunction = (function()
{
	var TimeStampLocationValue = 0; // Default no location sent before
	var lastPointArr = []; // Array that save the lastest points 
	var mymap; // The map object
	var marker; // The marker object
	
	function GetEventProperties(){ // Event properties request from server
		var GetEventData = {
			EventDataBit : true
		};
		var GetCurrentEvent = {EventProperties : GetEventData};
		ajaxRequest(GetCurrentEvent, webURL + "/event_properties.php", EventPropertiesResults);
	}
	
	function EventPropertiesResults(response){ // Event properties from server
		var myresponse = response.replace(/\n|\r/g, "");
		if(myresponse == "Failed")
		{
			alert("אין אירועים פעילים");
			window.location.href = "MainPage.html";
		}
		else
		{
			document.getElementById("eventName").value = response[0]["event_name"];
			document.getElementById("eventId").value = response[0]["event_id"];
			document.getElementById("eventStartTime").value = response[0]["s_time"];
			ShowMap();
			var locationInterval = setInterval(GetMarkers, 120000);
		}
	}
	
	
	
	function MapArea(){ // Display map location according to place entered on event create
		var GetMapLocation = {
			MapLocationBit : true
		};
		var GetCurrentLocation = {GetMapLocation : maplocation};
		ajaxRequest(GetCurrentLocation, webURL + "/setMapLocation.php", ShowMap);
	}
	
	function ShowMap(response){ // Show map according to location
		var geocoder = new google.maps.Geocoder();
		var address = response;
		
		geocoder.geocode( { 'address': address}, function(results, status){

			if (status == google.maps.GeocoderStatus.OK) {
				var latitude = results[0].geometry.location.lat();
				var longtitude = results[0].geometry.location.lng();
				var zoom = 13;
				mymap = L.map('mapid').setView([latitude, longtitude], zoom);
				L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
				{
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
					maxZoom: 18,
					subdomains: ['a','b','c']
				}).addTo(mymap);
			} 
		}); 
	}
	
	function GetMarkers(){  // Get active volunteers location on the map in the current event
		var TimeStampObject = {
			TimeStampLocation : TimeStampLocationValue
		};
		var GetCurrentLocation = {timeStamp : TimeStampObject};
		ajaxRequest(GetCurrentLocation, webURL + "/send_data.php", ShowMarkersOnMap);
	}
		
	function ShowMarkersOnMap(response){ // Display a polyline of user walking pattren
		numOfUsers = response.length;
		var userLocationObject;
		for(var i = 0; i < numOfUsers; i++)
		{
			numOfUserLocation = response[i].length;
			var latlngs = [];
			for(var j = 0; j < numOfUserLocation; j++)
			{
				userLocationObject = response[i][j];
				
				if(lastPointArr != null && j == 0) // Connect the last location with the new location
				{
					mymap.removeLayer(marker);
					var lastPoint = [];
					var lastPoint[0] = lastPointArr[userLocationObject['user_name']].lastPoint;
					var lastPoint[1] = [userLocationObject[latitude], userLocationObject[longtitude]];
					var polyline = L.polyline(lastPoint, {color: getRandomColor()}).addTo(mymap);
				}
								
				latlngs[j] = [userLocationObject[latitude], userLocationObject[longtitude]];
								
				if(j == numOfUserLocation - 1)
				{
					lastPointArr[userLocationObject['user_name']].lastPoint = latlngs[j];
					var polyline = L.polyline(latlngs, {color: getRandomColor()}).addTo(mymap);
					marker = L.marker([userLocationObject[latitude], userLocationObject[longtitude]]).addTo(mymap);
				}
			}
		}
		TimeStampLocationValue = userLocationObject[timestamp];
	}
	
	function getRandomColor() { // Get a random color for the line of the pathway of the client
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}
		
	function EventEnd(){ // Finish the event request
		var EndEventObject = {
			confirmEnd : true
		};
		var EndTheEvent = {EndEvent : EndEventObject};
		ajaxRequest(EndTheEvent, webURL + "/endOfEvent.php", EventEndingUpdate);
	}
	
	function EventEndingUpdate(response){ // Finish the event reponse
		if(response == "success")
		{
			alert("האירוע הסתיים בהצלחה")
			window.location.href = "MainPage.html";
		}
		else 
		{
			alert("יש בעיה בעדכון סיום האירוע");
		}
	}
		
	$("document").ready(function(){
		GetEventProperties();
		$(document).on("click", "#endEvent", function(){ // log out from app
			event.preventDefault();
			clearInterval(locationInterval);
			EventEnd();
		});
	
	});
}());