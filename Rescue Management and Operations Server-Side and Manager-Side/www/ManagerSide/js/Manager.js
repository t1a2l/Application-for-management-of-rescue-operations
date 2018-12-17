var mainFunction = (function()
{
	var webURL; // Server URL
	var NewEventMapCenter; // Set the map position to Israel
	var NewEventMaplatitude; // The New event map latitude
	var NewEventMaplongitude; // The New event map longitude
	var NewEventByMap; // Get new event location by map
	var Events = []; // Show events to join to in the join event div
	var ChosenEvent = []; // The chosen event to start if there are number of events
	var TimeStampLocationValue = 0; // Default no location sent before
	var lastPointArr = []; // Array that save the lastest points 
	var mymap; // The map object
	var latitude;  // The map latitude
	var longitude; // The map longitude
	var zoom; // The map zoom
	var locationInterval; // send location every minute
	var areaInterval; // send search area every minute
	var AreaColorArr = []; // Array of all areas colors
	var PathColorArr = []; // Array of all paths and markers colors
	var event_id; // The current event id
	var Markers = []; // Array of all markers on the map
	var blackFoundIcon; // found marker
	var imgModalArr = []; // Array of all images of the current event
	var currentImage; // The active image the is showen in the active event page currently
	var ImageIndex = 0; // An image index to scroll over all the images of the event
	var content; // Initial name of drawen areas on the map
	var AreaNum = 0; // give drawen areas a name "area" + index for naming according to the initial name
	var areaObject; // Object that holds a specific drawen area with name, color, latlangs, id and event id
	var areaObjectArr = []; // Array that holds all area objects to send to the database
	var areaExist = false; // Check that areas where created on the map
	var area_id_arr = []; // Array that holds all the ids of the arrays
	var currentEventImage; // Current showen image in the modal
	var rescueImage; // Current showen image in the modal
	var BackGroundColorArr = []; // Array of colors of active events to show to manager
	
	function LoginForm(){ // send login info to server and recieve a session to identify the user
		var EntranceType = 1; // 1 = Manager entrance, 2 = Client entrance 
		var userLoginDetailsData = {
			username : document.getElementById('InputUserName').value,
			password : document.getElementById('InputPassword').value,
			source : EntranceType,
			recaptcha : grecaptcha.getResponse()
		};
		var SignInFrom = {userLoginDetails : userLoginDetailsData};
		ajaxRequest(SignInFrom, webURL + "/index.php", LoginFormResult);
	}
	
	function LoginFormResult(response){ // Show main screen upon login success
		response = response.trim();
		response = response.replace(/['"]+/g, '');
		if(response.startsWith("success"))
		{
			response = response.replace('success','');
			alert("מנהל התחבר בהצלחה");
			$('#LoginPageDiv').hide();
			$('#MainPageDiv').show();
			ActiveSession = response;
		}
		else
		{
			alert("Failed");
		}
	}
	
	function LogOut(){ // Logout from system
		var stopSession = {session_id : ActiveSession};
		ajaxRequest(stopSession, webURL + "/logout.php", LogOutResult);
	}
	
	function LogOutResult(response){ // Show sign in page after log out
		if(response == "Success")
		{
			$('#MainPageDiv').hide();
			$('#LoginPageDiv').show();
		}
		else
		{
			alert(response);
		}
	}
	
	function NewEventForm(){ // Create a new event
		var formData = new FormData();
		formData.append('EventName', document.getElementById('EventNam').value);
		if($("input[name='byType']:checked").val() == "City")
		{
			var locArr = document.getElementById('EventLoc');
			formData.append('EventLocation', locArr[locArr.value].text);
		}
		else
		{
			formData.append('EventLocation', NewEventMaplatitude +', ' + NewEventMaplongitude);
		}
		formData.append('EventDescription', document.getElementById('EventDes').value);
		formData.append('EventLostPicName', document.getElementById('NewEventPic').value);
		formData.append('EventLostPicData', document.getElementById('NewEventPic').src);
		formData.append('session_id', ActiveSession);
		ajaxRequest(formData, webURL + "/event_create.php", NewEventFormResult, false, false);
	}
	
	function NewEventFormResult(response){ // Join the started event
		response = response.trim();
		var myresponse = response.replace(/['"]+/g, '');
		if(myresponse.startsWith("success"))
		{
			myresponse = myresponse.replace('success','');
			alert(myresponse);
			$('#NewEventDiv').hide();
			$('#JoinEventDiv').show();
			GetEventProperties();
		}
		else
		{
			alert(myresponse);
		}
		
	}
	
	function GetLocations(){ // Get locations from server (cities names)
		var CitiesFile = "excel/CitiesInIsrael.xlsx";
		var CityList = {targetFile : CitiesFile, session_id : ActiveSession};
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
		NewEventMapCenter = new google.maps.LatLng(31.793058, 35.22500969);
		var mapOptions = {
			zoom: 7,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			center: NewEventMapCenter
		};

		NewEventByMap = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		var NewEventMapMarker = new google.maps.Marker({ // Move marker to the wanted position
			map:NewEventByMap,
			draggable:true,
			animation: google.maps.Animation.DROP,
			position: NewEventMapCenter
		});
		
		google.maps.event.addListener(NewEventMapMarker, 'dragend', function(){
			geocodePosition(NewEventMapMarker.getPosition());
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
					NewEventMaplatitude = results[0].geometry.location.lat();
					NewEventMaplongitude = results[0].geometry.location.lng();
				} 
				else 
				{
					$("#mapErrorMsg").html('Cannot determine address at this location.'+status).show(100);
				}
			}
		);
	}
	
	function GetEventProperties(){ // Event properties request from server
		var GetEventData = {
			EventDataBit : true
		};
		var GetCurrentEvent = {EventProperties : GetEventData, session_id : ActiveSession};
		ajaxRequest(GetCurrentEvent, webURL + "/event_properties.php", EventPropertiesResults);
	}
	
	function EventPropertiesResults(response){ // Event properties from server
		if(typeof response === 'string')
		{
			alert("אין אירועים פעילים");
			$('#JoinEventDiv').hide();
			$('#MainPageDiv').show();
		}
		else
		{
			if(response.length == 1)
			{
				ChosenEvent['event_id'] = response[0]["event_id"];
				ChosenEvent['event_name'] = response[0]["event_name"];
				ChosenEvent['s_time'] = response[0]["s_time"];
				$('#JoinEventDiv').hide();
				$('#ActiveEventDiv').show();
				EventInfo();
			}
			else
			{
				showEvents(response)
			}
		}
	}
	
	function showEvents(response) // Show events by this managar
	{
		$("#Events").html('');
		Events = response;
		document.getElementById("eventChoose").InnerHTML = "בחר אחד מהאירועים הבאים:"
		var NumOfEvents = Events.length; // Number of events
		var container = $('<div class="contianer">');
		var row = $('<div class="row">');
		var listGroup = $('<div class="col-xs-8 col-xs-offset-2 list-group">');
				
		for(var i = 0; i < NumOfEvents; i++) // Go through all event s and show them
		{
			var eventId = Events[i].event_id; // Event id number
			var eventName = Events[i].event_name; // Event name
			var eventStartTime = Events[i].s_time; // Event starting time and date
			var buttonInfo = $('<button type="button" class="list-group-item" id="'+ eventId +'"><label class="list-group-item-heading">' + eventName + '</label><label class="list-group-item-heading">' + eventStartTime + '</label></button>');
			var bgcolor = chooseBtnColor(); // Choose a color for button background
			buttonInfo.css('backgroundColor', bgcolor);
			buttonInfo.css('margin-top', '20px');
			var rgb = buttonInfo.css('backgroundColor'); // Get rgb color
			var brightness = lightOrDark(rgb); // Check color brightness
			if(brightness == "light") // Set text acoording
			{
				buttonInfo.children()[0].style.color = "black";
				buttonInfo.children()[1].style.color = "black";
			}
			else
			{
				buttonInfo.children()[0].style.color = "white";
				buttonInfo.children()[1].style.color = "white";
			}
			BackGroundColorArr.push(bgcolor); // Save color to avoid repeat
			listGroup.append(buttonInfo);
		}
		row.append(listGroup);
		container.append(row);
		$('#Events').append(container);
		$("#Events").show();
		$("#BackBtnJoin").show();
	}
	
	function chooseBtnColor(){ // Choose a background color of the event button
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		for (var j = 0; j < BackGroundColorArr.length; j++) {
			if(BackGroundColorArr[j] == color)
				color = chooseBtnColor();
		}
		return color;
	}
	
	function EventInfo(){ // Get event info from local storage set the map and locations interval
		document.getElementById("eventName").innerHTML = ChosenEvent['event_name'];
		document.getElementById("eventId").innerHTML = "מספר אירוע: " + ChosenEvent['event_id'];
		document.getElementById("eventStartTime").innerHTML = "האירוע התחיל ב: " + ChosenEvent['s_time'];
		event_id = ChosenEvent['event_id'];
		MapArea();
		locationInterval = setInterval(GetMarkers, 120000);
	}
		
	function MapArea(){ // Display map location according to place entered on event create
		var GetCurrentLocation = {eventID : event_id, session_id : ActiveSession};
		ajaxRequest(GetCurrentLocation, webURL + "/set_map_location.php", MapDetails);
	}
	
	function MapDetails(response){ // Get map details and set the map
		response = response.trim();
		response = response.replace(/['"]+/g, '');
		if(response.search(",") != -1) // Check for a comma (latitude, longitude)
		{
			var index = response.indexOf(",");  // Gets the comma index
			latitude = response.substr(0, index); // Gets the latitude
			longitude = response.substr(index + 1); // Gets the longitude
			GetShapes();
		}
		else // If there is no comma it means it is a name of place and needs to be translated to lat and long
		{
			geocoder = new google.maps.Geocoder();
			var address = response;
			if(!address)
				address = "Jerusalem";
			geocoder.geocode( { 'address' : address}, function(results, status){
				if(status == google.maps.GeocoderStatus.OK)
				{
					latitude = results[0].geometry.location.lat();
					longitude = results[0].geometry.location.lng();
					GetShapes();
				}
				else
				{
					alert("error in retriveing location");
				}
			});
		}
	}
	
	function GetShapes(){ // Send event id to get the areas from the database
		var GetAreas = {eventID : event_id, session_id : ActiveSession};
		ajaxRequest(GetAreas, webURL + "/get_areas.php", ShowMap);
	}
	
	function ShowMap(response){ // Show map according to location
		zoom = 13;
		mymap = L.map('mapid').setView([latitude, longitude], zoom);

		L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		{
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			maxZoom: 18,
			subdomains: ['a','b','c']
		}).addTo(mymap);
		
		response = response.trim();
		if(!response) // No search areas for this event
		{
			alert("אין שטחי חיפוש לאירוע זה");
		}
		else // redraw the search areas on the map from the database
		{
			areaObjectArr = JSON.parse(response);
			for(var t = 0; t < areaObjectArr.length; t++) // Go through all the areas and draw them on the map
			{
				areaObject = areaObjectArr[t];
				area_id_arr.push(areaObject['properties']['id']);
				L.geoJSON(areaObject,{
					onEachFeature: function(feature, layer){
						if(feature.properties)
						{
							if(feature.properties.id){
								layer._leaflet_id = feature.properties.id;
							}
							if(feature.properties.shapeName){
								layer.bindPopup(feature.properties.shapeName);
								layer.on('mouseover', function (e) {
									this.openPopup();
								});
								layer.on('mouseout', function (e) {
									this.closePopup();
								});
							}
							if(feature.properties.shapeColor){
								layer.options.color = feature.properties.shapeColor;
							}
						}
						layer.on('click', function(event){ // On area click display area toolbar options
							new L.Toolbar2.EditToolbar.Popup(event.latlng,{
								actions: editActions
							}).addTo(mymap, layer);
						});
					}
				}).addTo(mymap);
			}
		}
		
		areaInterval = setInterval(SendAreaToServer, 60000, areaObjectArr);
		
		// Toolbar that lets you edit, delete change the color and change the name of a certain area
		var editActions = [ 
			L.Toolbar2.EditAction.Popup.Edit,
			L.Toolbar2.EditAction.Popup.Delete,
			L.Toolbar2.Action.extendOptions({
				toolbarIcon: { 
					className: 'leaflet-color-picker',
					html: '<span class="fa fa-eyedropper"></span>'
				},
				subToolbar: new L.Toolbar2({ actions:[
					L.ColorPicker.extendOptions({ color: '#db1d0f' }), // color
					L.ColorPicker.extendOptions({ color: '#025100' }), // color
					L.ColorPicker.extendOptions({ color: '#ffff00' }), // color
					L.ColorPicker.extendOptions({ color: '#0000ff' })  // color
				]})
			}),
			L.Toolbar2.Action.extendOptions({
				toolbarIcon: { 
					className: 'leaflet-control-button', 
					html: '<span class="glyphicon glyphicon-pencil"></span>' // Text Box 
				}, 
				subToolbar: new L.Toolbar2({ actions: [
					L.ShapeTitle.extendOptions()
				]})
			})
		];
		
		// Side toolbar draw an area and zoom in and out
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
						color: getRandomColor(AreaColorArr), //'#bada55'
						id : AreaNum
				  }
				},
				circle: false,
				circlemarker: false,
				rectangle: false,
				marker: false
			}
		});
		
		mymap.addControl(drawControl); // Add the side toolbar to the map

		var drawnItems = new L.FeatureGroup().addTo(mymap); // an array of all drawen items on the map
		
		mymap.on('draw:created', function(evt){ // Happens when an area has been created
			var	type = evt.layerType,
				layer = evt.layer;
			content = "area" + AreaNum; // Give an area a initial name
			AreaNum++; // Set unique area name
			drawnItems.addLayer(layer); // Add area to drawen items arr
			layer.bindPopup(content); // Set the initial name of the area
			layer.on('mouseover', function (e) {
				this.openPopup();
			});
			layer.on('mouseout', function (e) {
				this.closePopup();
			});
			var shapeId = set_area_id(layer._leaflet_id); // Check if the area id exist and set it if not
			var color = layer.options.color; // Set the area color
			var drawings = drawnItems.getLayers();  //drawnItems is a container for the drawn objects
			areaObject = layer.toGeoJSON(); // Set the area object as geo json to send to database
			areaObject.properties = { // Set the geojson area properties
				id : shapeId,
				shapeName : content,
				shapeColor: color,
				eventID : event_id
			};
			areaObject.type = 'Feature'; // Set the geojson area type
			areaObjectArr.push(areaObject); // push the geojson object to the geojson array
			layer.on('click', function(event){ // On area click display area toolbar options
				new L.Toolbar2.EditToolbar.Popup(event.latlng,{
					actions: editActions
				}).addTo(mymap, layer);
			});

		});
		
		mymap.on('draw:edited', function(event) { // Happens when an area has been edited
			var layers = event.layers;
			layers.eachLayer(function(layer) {
				if(areaObjectArr)
				{
					// Find the edited area id in the area object array
					var editedAreaObj = areaObjectArr.find(function(element) {
						return element.properties.id == layer._leaflet_id;
					});
					// Remove the area object form the array for editing
					var i = areaObjectArr.indexOf(editedAreaObj);
					if(i != -1) {
						areaObjectArr.splice(i, 1);
					}
					// Set the edited area object as a new geojson object with properties and type
					editedAreaObj = layer.toGeoJSON();
					editedAreaObj.properties = {
						id : layer._leaflet_id,
						shapeName : layer._popup._content,
						shapeColor: layer.options.color,
						eventID : event_id
					};
					editedAreaObj.type = 'Feature';
					// Add the edited area object back to the area object array
					areaObjectArr.push(editedAreaObj);
				}
			});
		});
		
		mymap.on('draw:deleted', function(event) { // Happens when an area has been deleted
			var layers = event.layers;
			layers.eachLayer(function(layer) {
				if(areaObjectArr)
				{
					// Find the deleted area id in the area object array
					var deletedAreaObj = areaObjectArr.find(function(element) {
						return element.properties.id == layer._leaflet_id;
					});
					// Remove the area object form the array
					var i = areaObjectArr.indexOf(deletedAreaObj);
					if(i != -1) {
						areaObjectArr.splice(i, 1);
					}
				}
			});
		});
	}
	
	function SendAreaToServer(areaArr){ // Send the area object to save to the database
		if(areaArr.length > 0)
		{
			var AreaObjectArrayObj = {AreaObjectArray : areaArr, eventID : event_id, session_id : ActiveSession};
			ajaxRequest(AreaObjectArrayObj, webURL + "/store_areas.php", SaveAreaResults);
		}
	}
	
	function SaveAreaResults(response){ // Get answer if the area has been saved successfully
		response = response.trim();
		response = response.replace(/['"]+/g, '');
		if(response != "Success")
		{
			alert(response);
		}
	}
	
	function set_area_id(layer_id){ // Check if the given layer id already exist
		while(area_id_arr.includes(layer_id))
		{
			layer_id = Math.floor((Math.random() * 300) + 100);
		}
		return layer_id;
	}
		
	function GetMarkers(){  // Get active volunteers location on the map in the current event
		var locationObject = {
			TimeStampLocation : TimeStampLocationValue,
			eventID : event_id
		};
		var GetCurrentLocations = {currentLocations : locationObject, session_id : ActiveSession};
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
										
						if(!pathColor) // Check for a the path color
						{
							pathColor = getRandomColor(PathColorArr);
							usersColorArr[index] = {};
							usersColorArr[index].username = userLocationObject['user_name'];
							usersColorArr[index].color = pathColor;
							index++;
						}
						PathColorArr.push(pathColor); // Add path color to array to set distinctive color for each user
						rgbColor = HexToRgb(pathColor); // Get the marker color in rgb
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
				var SendcurrentUsersColors = {currentUsersColors : usersColorsObject, session_id : ActiveSession};
				ajaxRequest(SendcurrentUsersColors, webURL + "/set_users_colors.php", usersColorsFunc);
			}
		}
	}
	
	function usersColorsFunc(response){ // Get the response that colors has been set for users
		response = response.trim();
		response = response.replace(/['"]+/g, '');
		if(response != "success")
		{
			alert("error saving new colors");
		}	
	}
	
	function getRandomColor(myarr) { // Get a random color for the line of the pathway of the client or the area
		var letters = '0123456789ABCDEF';
		var color = '#';
		for(var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		while(color == '#000000' || color == '#FFFFFF') // No black or white color
		{
			return getRandomColor(myarr);
		}
		if(myarr.length > 0) // Check if color array exist - avoid same color
		{
			for(var j = 0; j < myarr.length; j++)
			{
				if(myarr[j] == color)
				{
					return getRandomColor(myarr);
				}
			}
		}
		return color;
	}
	
	function HexToRgb(hex){ // Convert an hex color code to rgb code
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}
		
	function EventEnd(){ // Finish the event request
		var EndEventObj = {event_id: event_id, session_id : ActiveSession};
		ajaxRequest(EndEventObj, webURL + "/end_of_event.php", EventEndingUpdate);
	}
	
	function EventEndingUpdate(response){ // Finish the event response
		if(response == "success")
		{
			alert("האירוע הסתיים בהצלחה");
			$('#ActiveEventDiv').hide();
			$('#MainPageDiv').show();
		}
		else 
		{
			alert("יש בעיה בעדכון סיום האירוע");
		}
	}
	
	function sendPicToServer(){ // Send picture to server to add to event images
		var pic = new FormData();
		pic.append('eventID', event_id);
		pic.append('session_id', ActiveSession);
		pic.append('imageUpload', document.getElementById('currentImage').src);
		pic.append('imageUploadName', document.getElementById('currentImage').value);
		$('#eventPicUpload').val("");
		ajaxRequest(pic, webURL + "/img_upload.php", sendPicSuccess, false, false);
	}
	
	function sendPicSuccess(response){ // Response of the image uploading
		response = response.trim();
		response = response.replace(/['"]+/g, '');
		alert(response);
	}
	
	function getImagesEvent() // Get images from the server related to the event
	{ 
		var MyImages = {event_id : event_id, session_id : ActiveSession};
		ajaxRequest(MyImages, webURL + "/img_download.php", imageResult);
	}
	
	function imageResult(response) // show the images on the event page
	{ 
		if(response)
		{
			response = response.trim();
			response = response.replace(/\\\//g, "/");
			imgModalArr = JSON.parse(response);
			for(var i = 0; i < imgModalArr.length; i++)
			{
				imgModalArr[i] = imgModalArr[i].replace("img", "/img");
				imgModalArr[i] = webURL + imgModalArr[i];
			}
			currentEventImage = imgModalArr[0];
			rescueImage.src = currentEventImage;
			rescueImage.onload = function(){
				rescueImageOnload();
			}
			$('#eventImagesModal').modal('show');
		}
	}

	function rescueImageOnload(){
		if(currentEventImage == imgModalArr[imgModalArr.length-1])
		{
			document.getElementById('nextImage').disabled = true;
			document.getElementById('prevImage').disabled = false;
		}
		else if(currentEventImage == imgModalArr[0])
		{
			document.getElementById('prevImage').disabled = true;
			document.getElementById('nextImage').disabled = false;
		}
		else
		{
			document.getElementById('nextImage').disabled = false;
			document.getElementById('prevImage').disabled = false;
		}
	}
	
	
	
	$("document").ready(function(){
		$('#LoginPageDiv').show();
		$('#MainPageDiv').hide();
		$('#NewEventDiv').hide();
		$('#JoinEventDiv').hide();
		$('#ActiveEventDiv').hide();
		webURL = serverURL();
		rescueImage = document.getElementById("currentEventImage");
		
		document.getElementById('prevImage').disabled = true;
		document.getElementById('nextImage').disabled = true;
		
		$('#SignInForm').submit(function(event){ // enter the homescreen page
			event.preventDefault();
			LoginForm();
		});
		
		$(document).on("click", "#newEventBtn", function(){ // Create a new event
			event.preventDefault();
			$('#MainPageDiv').hide();
			$('#NewEventDiv').show();
			GetLocations();
			initializeMap();
		});
		
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
				google.maps.event.trigger(NewEventMapCenter, 'resize');
			});
		});
		
		$(document).on("click", "#BackBtnNew", function(){ // Go back to the main menu from event create page
			event.preventDefault();
			$('#NewEventDiv').hide();
			$('#MainPageDiv').show();
		});
		
		$(document).on("click", "#BackBtnJoin", function(){ // Go back to the main menu from join event page
			event.preventDefault();
			$('#JoinEventDiv').hide();
			$('#MainPageDiv').show();
		});

		$(document).on("click", "#joinEventBtn", function(){ // Return to active event
			event.preventDefault();
			$("#Events").html('');
			$("#BackBtnJoin").hide();
			$('#MainPageDiv').hide();
			$('#JoinEventDiv').show();
			GetEventProperties();
		});
		
		$(document).on("click", "#logoutBtn", function(){ // Logout from system
			event.preventDefault();
			LogOut();
		});

		$(document).on("click", ".list-group-item", function(){ // Choose the event to manage
			ChosenEvent['event_id'] = $(this).attr("id");
			ChosenEvent['event_name'] = $(this).children()[0].textContent;
			ChosenEvent['s_time'] = $(this).children()[1].textContent;
			$('#JoinEventDiv').hide();
			$('#ActiveEventDiv').show();
			EventInfo();
		});
		
		$(document).on("click", "#endEvent", function(){ // Finish the event
			event.preventDefault();
			var answer = confirm("אתה בטוח שאתה רוצה לסיים את האירוע?");
			if(answer)
			{
				if(locationInterval)
					clearInterval(locationInterval);
				if(areaInterval)
					clearInterval(areaInterval);
				EventEnd();
			}
		});
		
		$(document).on("click", "#eventPictures", function(){ // Show all the images of the event
			event.preventDefault();
			getImagesEvent();
		});
		
		$(document).on("click", "#nextImage", function(){ // Go to the next image
			event.preventDefault();
			document.getElementById('nextImage').disabled = true;
			document.getElementById('prevImage').disabled = true;
			if(currentEventImage != imgModalArr[imgModalArr.length-1])
			{
				ImageIndex++;
				currentEventImage = imgModalArr[ImageIndex];
				rescueImage.src = currentEventImage;
			}
			rescueImage.onload = function(){
				rescueImageOnload();
			}	
		});
		
		$(document).on("click", "#prevImage", function(){ // Go to the previews image
			event.preventDefault();
			document.getElementById('prevImage').disabled = true;
			document.getElementById('nextImage').disabled = true;
			if(currentEventImage != imgModalArr[0])
			{
				ImageIndex--;
				currentEventImage = imgModalArr[ImageIndex];
				rescueImage.src = currentEventImage;
			}
			rescueImage.onload = function(){
				rescueImageOnload();
			}	
		});
		
		$(document).on("click", "#CloseImages", function(){ // Close the image gallery
			event.preventDefault();
			currentEventImage = imgModalArr[0];
			document.getElementById('prevImage').disabled = true;
			document.getElementById('nextImage').disabled = true;
			ImageIndex = 0;
			
		});
		
		$(document).on("change", "#eventPicUpload", function(){ // Show image before uploading it
			event.preventDefault();
			var file = this.files[0];
			var reader = new FileReader();
			document.getElementById("currentImage").value = file.name;
			reader.onload = function (e) {   
				document.getElementById("currentImage").src = e.target.result;
				$('#imageModal').modal('show');
			}
			if(file)
			{
				reader.readAsDataURL(file);
			}
		});
		
		$(document).on("change", "#NewEventPicBtn", function(){ // Show image before uploading it
			event.preventDefault();
			var file = this.files[0];
			var reader = new FileReader();
			document.getElementById("NewEventPic").value = file.name;
			reader.onload = function (e) {   
				document.getElementById("NewEventPic").src = e.target.result;
				$('#imageNewEventModal').modal('show');
			}
			if(file)
			{
				reader.readAsDataURL(file);
			}
		});
		
		$(document).on("click", "#sendPic", function(){ // Take a picture and send it to the database
			event.preventDefault();
			sendPicToServer();
		});
		
		$(document).on("click", "#deletePic", function(){ // Remove Picture from "open file"
			event.preventDefault();
			$('#eventPicUpload').val("");
		});
	});
}());