var mainFunction = (function()
{
	var webURL; // server url
	var TimeStampLocationValue = 0; // Default no location sent before
	var lastPointArr = []; // Array that save the lastest points 
	var mymap; // The map object
	var locationInterval; // send location evry minute or so
	var AreaColor = "black"; // color of the search areas
	var AreaNum = 0;
	var event_id;
	var Markers = [];
	var blackFoundIcon; // found marker
	var loader; // Page loading
	
	function EventInfo(){
		var ChosenEvent = JSON.parse(localStorage.getItem("ChosenEvent"));
		document.getElementById("eventName").innerHTML = ChosenEvent[0].event_name;
		document.getElementById("eventId").innerHTML = "מספר אירוע: " + ChosenEvent[0].event_id;
		document.getElementById("eventStartTime").innerHTML = "האירוע התחיל ב: " + ChosenEvent[0].s_time;
		event_id = ChosenEvent[0].event_id;
		ShowMap();
		locationInterval = setInterval(GetMarkers, 120000);
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
				loader.style.display = "none";
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
								html: '' // Text Box
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
		var locationObject = {
			TimeStampLocation : TimeStampLocationValue,
			eventID : event_id
		};
		var GetCurrentLocations = {currentLocations : locationObject};
		ajaxRequest(GetCurrentLocations, webURL + "/send_data.php", ShowMarkersOnMap);
	}
		
	function ShowMarkersOnMap(response){ // Display a polyline of user walking pattren
		response = response.trim();
		response = JSON.parse(response);
		if(!response)
		{
			alert("אין מיקומים חדשים");
		}
		else
		{
			var usersLocationArr = response[0];
			var usersInfoArr = response[1];
			var numOfUsers = usersLocationArr.length;
			var userLocationObject;
			var iconIndex = 0;
			var polyline; // User path
			var marker; // Current user location
			var pathColor; // Current user path color
			var usersColorArr = [];
			var index = 1;
			if(Markers.length != 0)
			{
				for(var s = 0; s < Markers.length; s++)
				{
					mymap.removeLayer(Markers[s]);
				}
			}
			for(var i = 0; i < numOfUsers; i++) // Number of users in the event
			{
				numOfUserLocation = usersLocationArr[i].length;
				var latlngs = [];
				for(var j = 0; j < numOfUserLocation; j++) // Number of location per user
				{
					userLocationObject = usersLocationArr[i][j];
					latlngs[j] = [userLocationObject['latitude'], userLocationObject['longitude']];
									
					if(j == numOfUserLocation - 1) // Take the last point and save it to connect to the first point of the next batch
					{
						for(var t = 0; t < usersInfoArr.length; t++)
						{
							if(usersInfoArr[t]['user_name'] == userLocationObject['user_name'])
							{
								pathColor = usersInfoArr[t]['color'];
								break;
							}
						}
										
						if(!pathColor) // check for a the path color
						{
							pathColor = getRandomColor();
							usersColorArr[index] = {};
							usersColorArr[index].username = userLocationObject['user_name'];
							usersColorArr[index].color = pathColor;
							index++;
						}
						
						rgbColor = HexToRgb(pathColor); // get the marker color in rgb
						polyline = L.polyline(latlngs, {color: pathColor}).addTo(mymap); // add the path to the map
						marker = new L.Marker.SVGMarker([userLocationObject['latitude'], userLocationObject['longitude']], { iconOptions: { color: rgbColor }}).addTo(mymap);
						Markers.push(marker);
					}
					
					if(parseInt(userLocationObject['found_point'])) // Check for found person and put marker on the map
					{
						foundMarker = L.marker([userLocationObject['latitude'], userLocationObject['longitude']], { iconOptions: { color: 'rgb(0,0,0)' }}).addTo(mymap);
					}
				}
			}
			if(userLocationObject) // Set the time stamp for the next batch of locations to add to the path
			{
				TimeStampLocationValue = userLocationObject['timestamp'];
			}
			if(usersColorArr.length > 0) // Send color attached to new users
			{
				usersColorArr[0] = {};
				usersColorArr[0].event_id = event_id;
				var usersColorsObject = {
					usersColors : usersColorArr
				};
				var SendcurrentUsersColors = {currentUsersColors : usersColorsObject};
				ajaxRequest(SendcurrentUsersColors, webURL + "/set_users_colors.php", usersColorsFunc);
			}
		}
	}
	
	function usersColorsFunc(response){
		response = response.trim();
		response = response.replace(/['"]+/g, '');
		if(response != "success")
		{
			alert("error saving new colors");
		}	
	}
	
	function getRandomColor() { // Get a random color for the line of the pathway of the client
		var letters = '0123456789ABCDEF';
		var color = '#';
		for(var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		while(color == '#000000' || color == '#FFFFFF')
		{
			return getRandomColor();
		}
		return color;
	}
	
	function HexToRgb(hex){
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
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
		loader = document.getElementById("eventLoader");
		loader.style.display = "block";
		webURL = serverURL(); // server url
		EventInfo();
		$(document).on("click", "#endEvent", function(){ // log out from app
			event.preventDefault();
			var answer = confirm("אתה בטוח שאתה רוצה לסיים את האירוע?");
			if(answer)
			{
				if(locationInterval)
					clearInterval(locationInterval);
				EventEnd();
			}
		});
		
		
	
	});
}());