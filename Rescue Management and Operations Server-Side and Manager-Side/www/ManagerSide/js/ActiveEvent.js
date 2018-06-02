var mainFunction = (function()
{
	var webURL; // server url
	var TimeStampLocationValue = 0; // Default no location sent before
	var lastPointArr = []; // Array that save the lastest points 
	var mymap; // The map object
	var latitude;  // The map latitude
	var longitude; // The map longitude
	var zoom; // The map zoom
	var locationInterval; // send location evry minute or so
	var AreaNum = 0;
	var AreaColorArr = []; // array of all areas colors
	var PathColorArr = []; // array of all paths and markers colors
	var event_id;
	var Markers = [];
	var blackFoundIcon; // found marker
	var loader; // Page loading
	var imgModalArr = []; // Array of all images of the current event
	var currentImage; // The active image the is showen in the active event page currently
	var ImageIndex = 0;
	var areaObject;
	var shapeCreated = false;
	var content;
	var areaObjectArr = [];
	var ar1234 = [];
	
	function EventInfo(){ // Get event info from local storage set the map and locations interval
		var ChosenEvent = JSON.parse(localStorage.getItem("ChosenEvent"));
		document.getElementById("eventName").innerHTML = ChosenEvent[0].event_name;
		document.getElementById("eventId").innerHTML = "מספר אירוע: " + ChosenEvent[0].event_id;
		document.getElementById("eventStartTime").innerHTML = "האירוע התחיל ב: " + ChosenEvent[0].s_time;
		event_id = ChosenEvent[0].event_id;
		MapArea();
		locationInterval = setInterval(GetMarkers, 120000);
	}
		
	function MapArea(){ // Display map location according to place entered on event create
		var GetMapLocation = {
			MapLocationBit : true
		};
		var GetCurrentLocation = {MyMapLocation : GetMapLocation};
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
	
	function GetShapes(){
		ShowMap();
		// var GetAreasArr = {
			// eventID : event_id
		// };
		// var AreaArrObj = {AreaArr : GetAreasArr};
		// ajaxRequest(AreaArrObj, webURL + "/get_areas.php", ShowMap);
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
				
		if(!response) // No search areas for this event
		{
			alert("אין שטחי חיפוש לאירוע זה");
		}
		else // redraw the search areas on the map
		{
			response = response.trim();
			ShapesObjArr = JSON.parse(response);
			for(var t = 0; t < ShapesObjArr.length; t++) // Go through all the areas and draw them on the map
			{
				ShapesArr = ShapesObjArr[t]['shapelatLngs']; // Get latlng arr
				for(var x = 0; x < ShapesArr.length; x++)
				{
					templatlngs = [];
					for(var y = 0; y < ShapesArr[x].length; y++)
					{
						templatlngs[y] = [];
						templatlngs[y][0] = ShapesArr[x][y]['lat'];
						templatlngs[y][1] = ShapesArr[x][y]['lng'];
					}
					var tempPoly = L.polygon(templatlngs, {color: ShapesObjArr[t]['shapeColor']}).bindPopup(ShapesObjArr[t]['shapeName']);
					tempPoly.addTo(mymap);
				}
				AreaColorArr.push(ShapesObjArr[t]['shapeColor']);
			}
		}

		loader.style.display = "none";
		
		var editActions = [
			L.Toolbar2.EditAction.Popup.Edit,
			L.Toolbar2.EditAction.Popup.Delete,
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
			}),
			L.Toolbar2.Action.extendOptions({
				toolbarIcon: { 
					className: 'leaflet-control-button', 
					html: '<span class="glyphicon glyphicon-pencil"></span>' // Text Box 
				}, 
				subToolbar: new L.Toolbar2({ actions: [
					L.ShapeTitle.extendOptions()
				]})
			}),
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
		
		mymap.addControl(drawControl);

		var getPopupContent = function(layer){
			if (layer instanceof L.Polygon) {
				var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
				area = L.GeometryUtil.geodesicArea(latlngs);
				return "Area: "+L.GeometryUtil.readableArea(area, true);
			}
			return null;
		}
						
		drawnItems = new L.FeatureGroup().addTo(mymap);
		
		mymap.on('draw:created', function(evt){
			var	type = evt.layerType,
				layer = evt.layer;
			content = "area" + AreaNum;
			drawnItems.addLayer(layer);
			layer.bindPopup(content);
			var shapeId = layer._leaflet_id;
			var latLngs = layer.getLatLngs();
			var color = layer.options.color;
			var drawings = drawnItems.getLayers();  //drawnItems is a container for the drawn objects
			areaObject = {
				id : shapeId,
				shapelatLngs : latLngs,
				shapeName : content,
				shapeColor: color,
				eventID : event_id
			};
			areaObjectArr.push(areaObject);
			AreaNum++;
			//SendAreaToServer(areaObject);

			layer.on('click', function(event){
				new L.Toolbar2.EditToolbar.Popup(event.latlng,{
					actions: editActions
				}).addTo(mymap, layer);
			});
			
			
		});
		
		// editActions.on('change', function(event){
			// alert("hello");
		// });
		
		
		mymap.on('draw:edited', function(event) {
			var layers = event.layers;
			var it = event.layer;
			layers.eachLayer(function(layer) {
				if(areaObjectArr)
				{
					var editedAreaObj = areaObjectArr.find(function(element) {
						return element.id == layer._leaflet_id;
					});
					editedAreaObj.shapelatLngs = layer.getLatLngs();
					editedAreaObj.shapeName = layer._popup._content;
					editedAreaObj.shapeColor = layer.options.color;
				}
			});
		});
	}
	
	function SendAreaToServer(areaObject){ // Send the area object to save to the database
		var SetCurrentAreaObject = {currentAreaObject : areaObject};
		ajaxRequest(SetCurrentAreaObject, webURL + "/store_area.php", SaveAreaResults);
	}
	
	function SaveAreaResults(response){ // Get answer if the area has been saved successfully
		response = response.trim();
		if(response == "Success")
		{
			alert("Area saved to database");
		}
		else
			alert(response);
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
							pathColor = getRandomColor(PathColorArr);
							usersColorArr[index] = {};
							usersColorArr[index].username = userLocationObject['user_name'];
							usersColorArr[index].color = pathColor;
							index++;
						}
						PathColorArr.push(pathColor); // add path color to array to set distinctive color for each user
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
	
	function HexToRgb(hex){ // Turn a hex color code to rgb
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
	
	function sendPicToServer(){ // Send picture to server to add to event images
		var pic = new FormData();
		pic.append('eventID', event_id);
		pic.append('imageUpload', document.getElementById('currentImage').src);
		ajaxRequest(pic, webURL + "/img_upload.php", sendPicSuccess, false, false);
	}
	
	function sendPicSuccess(response){ // Response of the image uploading
		response = response.trim();
		response = response.replace(/['"]+/g, '');
		alert(response);
	}
	
	function getImagesEvent() // Get images from the server related to the event
	{ 
		var MyImages = {eventID : event_id};
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
				imgModalArr[i] = imgModalArr[i].replace("/wamp64/www", "");
				imgModalArr[i] = webURL + imgModalArr[i];
			}
			currentEventImage = imgModalArr[0];
			document.getElementById("currentEventImage").src = currentEventImage;
			document.getElementById('prevImage').disabled = true;
			$('#eventImagesModal').modal('show');
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
		$(document).on("click", "#eventPictures", function(){ // SHow all the images of the event
			event.preventDefault();
			getImagesEvent();
		});
		
		$(document).on("click", "#nextImage", function(){ // Go to the next image
			event.preventDefault();
			document.getElementById('prevImage').disabled = false;
			if(currentEventImage != imgModalArr[imgModalArr.length-1])
			{
				ImageIndex++;
				currentEventImage = imgModalArr[ImageIndex];
				document.getElementById("currentEventImage").src = currentEventImage;
				if(currentEventImage == imgModalArr[imgModalArr.length-1])
				{
					this.disabled = true;
				}
			}
		});
		
		$(document).on("click", "#prevImage", function(){ // Go to the previews image
			event.preventDefault();
			document.getElementById('nextImage').disabled = false;
			if(currentEventImage != imgModalArr[0])
			{
				ImageIndex--;
				currentEventImage = imgModalArr[ImageIndex];
				document.getElementById("currentEventImage").src = currentEventImage;
				if(currentEventImage == imgModalArr[0])
				{
					this.disabled = true;
				}
			}
		});
		
		$(document).on("click", "#CloseImages", function(){ // Close the image gallery
			event.preventDefault();
			currentEventImage = imgModalArr[0];
			document.getElementById('prevImage').disabled = true;
			document.getElementById('nextImage').disabled = false;
			
		});
		
		$(document).on("change", "#eventPicUpload", function(){ // log out from app
			event.preventDefault();
			var MyPic = document.getElementById('eventPicUpload');
			var file = this.files[0];
			var currentImg = document.getElementById("currentImage");
			var reader = new FileReader();
			reader.onload = function (e) {   
				document.getElementById("currentImage").src = e.target.result;
				$('#imageModal').modal('show');
			}        
			reader.readAsDataURL(file);
		});
		
		$(document).on("click", "#sendPic", function(){ // Take a picture and send it to the database
			event.preventDefault();
			sendPicToServer();
		});
		
	
	});
}());