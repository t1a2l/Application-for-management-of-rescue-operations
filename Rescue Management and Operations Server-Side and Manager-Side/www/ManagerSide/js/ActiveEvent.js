var mainFunction = (function()
{
	var webURL; // server url
	var TimeStampLocationValue = 0; // Default no location sent before
	var lastPointArr = []; // Array that save the lastest points 
	var mymap; // The map object
	var marker; // The marker object
	var locationInterval; // send location evry minute or so
	var AreaColor = "black"; // color of the search areas
	var AreaNum = 0;
	
	function GetEventProperties(){ // Event properties request from server
		var GetEventData = {
			EventDataBit : true
		};
		var GetCurrentEvent = {EventProperties : GetEventData};
		ajaxRequest(GetCurrentEvent, webURL + "/event_properties.php", EventPropertiesResults);
	}
	
	function EventPropertiesResults(response){ // Event properties from server
		if(typeof response === 'string')
		{
			alert("אין אירועים פעילים");
			window.location.href = "MainPage.html";
		}
		else
		{
			document.getElementById("eventName").innerHTML = response[0]["event_name"];
			document.getElementById("eventId").innerHTML = "מספר אירוע: " + response[0]["event_id"];
			document.getElementById("eventStartTime").innerHTML = "האירוע התחיל ב: " + response[0]["s_time"];
			ShowMap();
			//locationInterval = setInterval(GetMarkers, 120000);
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
		geocoder = new google.maps.Geocoder();
		var address = response;
		if(!address)
			address = "Jerusalem";
		geocoder.geocode( { 'address' : address}, function(results, status){
			if(status == google.maps.GeocoderStatus.OK)
			{
				var latitude = results[0].geometry.location.lat();
				var longitude = results[0].geometry.location.lng();
				var zoom = 13;
				mymap = L.map('mapid').setView([latitude, longitude], zoom);
						
				L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
				{
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
					maxZoom: 18,
					subdomains: ['a','b','c']
				}).addTo(mymap);
				
				var TitleTxtBox = L.Control.extend({
					options: {
						position: 'bottomleft' 
					},
					onAdd: function (mymap) {
						var container = L.DomUtil.create('input', 'myInput');
					 
						container.style.backgroundColor = 'white';
						container.style.width = '100px';
						container.style.height = '20px';
					
					return container;
				    },
				  
				    onRemove: function(mymap) {
							// Nothing to do here
				    },
				    getContent: function () {
						this.getContainer().innerHTML;
				    }
				  
				});
					
				var ShapeTitle =  new TitleTxtBox().addTo(mymap);
				
				var editActions = [
						L.Toolbar2.EditAction.Popup.Edit,
						L.Toolbar2.EditAction.Popup.Delete,
						L.Toolbar2.Action.extendOptions({
							toolbarIcon: { 
								className: 'leaflet-control-button', 
								html: ''
							}, 
							subToolbar: new L.Toolbar2({ actions: [
								L.ShapeTitle.extendOptions({title: ShapeTitle.getContent()})
							]})
						}),
						L.Toolbar2.Action.extendOptions({
							toolbarIcon: { 
								className: 'leaflet-color-picker', 
								html: '<span class="fa fa-eyedropper"></span>' 
							},
							subToolbar: new L.Toolbar2({ actions: [
								L.ColorPicker.extendOptions({ color: '#db1d0f' }),
								L.ColorPicker.extendOptions({ color: '#025100' }),
								L.ColorPicker.extendOptions({ color: '#ffff00' }),
								L.ColorPicker.extendOptions({ color: '#0000ff' })
							]})
						})
				];
				
								
				var drawControl = new L.Control.Draw({
					draw: {
						polyline: false,
						polygon: {
						  allowIntersection: false, // Restricts shapes to simple polygons
						  drawError: {
							color: 'black', // Color the shape will turn when intersects
							message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
						  },
						  shapeOptions: {
							color: AreaColor //'#bada55'
						  }
						},
						circle: false,
						circlemarker: false,
						rectangle: false,
						marker: false
					}
				});
				mymap.addControl(drawControl);

				var getPopupContent = function(layer) {
					if (layer instanceof L.Polygon) {
						var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
						area = L.GeometryUtil.geodesicArea(latlngs);
						return "Area: "+L.GeometryUtil.readableArea(area, true);
					}
					return null;
				}
								
				drawnItems = new L.FeatureGroup().addTo(mymap);
				
				mymap.on('draw:created', function(evt) {
					var	type = evt.layerType,
						layer = evt.layer;
					var content = "area" + AreaNum;
					AreaNum++;
					drawnItems.addLayer(layer);
					latLngs = layer.getLatLngs(); // get cordinates and save to database
					layer.bindPopup(content);
										
					var drawings = drawnItems.getLayers();  //drawnItems is a container for the drawn objects
					
					layer.on('click', function(event) {
												
						new L.Toolbar2.EditToolbar.Popup(event.latlng, {
							actions: editActions
						}).addTo(mymap, layer);
					});
					// mymap.on('click', '.myInput',function(event) {
						// mymap.removeControl(Input1);
					// });
					
				});
				
				
				
				mymap.on('draw:edited', function(event) {
					var layers = event.layers, content = null;
					layers.eachLayer(function(layer) {
						content = getPopupContent(layer);
						if (content !== null) {
							layer.setPopupContent(content);
						}
					});
				});
				
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
					lastPoint[0] = lastPointArr[userLocationObject['user_name']].lastPoint;
					lastPoint[1] = [userLocationObject[latitude], userLocationObject[longitude]];
					var polyline = L.polyline(lastPoint, {color: getRandomColor()}).addTo(mymap);
				}
								
				latlngs[j] = [userLocationObject[latitude], userLocationObject[longitude]];
								
				if(j == numOfUserLocation - 1)
				{
					lastPointArr[userLocationObject['user_name']].lastPoint = latlngs[j];
					var polyline = L.polyline(latlngs, {color: getRandomColor()}).addTo(mymap);
					marker = L.marker([userLocationObject[latitude], userLocationObject[longitude]]).addTo(mymap);
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
		webURL = serverURL(); // server url
		GetEventProperties();
		$(document).on("click", "#endEvent", function(){ // log out from app
			event.preventDefault();
			var answer = confirm("אתה בטוח שאתה רוצה לסיים את האירוע?");
			if(answer)
			{
				//if(locationInterval)
				//	clearInterval(locationInterval);
				EventEnd();
			}
		});
		
		
	
	});
}());