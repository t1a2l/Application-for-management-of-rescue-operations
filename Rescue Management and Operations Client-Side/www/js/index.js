var mainFunction = (function()
{
	document.addEventListener("deviceready", onDeviceReady, false);
	var ActiveSession; // the active session
	var Events = null; // Events to show in the choose event screen
	var webURL = "http://d4db17c4.ngrok.io"; // Server URL
	var inEvent = false;
	var bgGeo; // init inside getLocation function
	var ChosenEvent = []; // Array that holds the chosen event properties
	var imageArr = []; // Array that holds all images of the lost perosn
	var currentImage; // The active image the is showen in the active event page currrently
	var BackGroundColorArr = []; // Color array to background of the events to choose from
	var foundPoint = 0; // Person was found bit
	
	function SubForm() // Send login info to server and recieve a session to work with
	{ 
		var EntranceType = 2; // 1 = Web entrance, 2 = Mobile entrance 
		var userLoginDetailsData = {
			username : document.getElementById('InputUserName').value,
			password : document.getElementById('InputPassword').value,
			source : EntranceType
		};
		var SignInFrom = {userLoginDetails : userLoginDetailsData};
		ajaxRequest(SignInFrom, webURL + "/index.php", getEvents);
	}
		
	function getEvents(response) // Send my session to the server and recieve active events
	{ 
		response = response.trim();
		response = response.replace(/['"]+/g, '');
		if(response.startsWith("success"))
		{
			response = response.replace('success','');
			$('#LoginForm').hide();
			ActiveSession = response;
			setNotification();
			var MySession = {session_id : ActiveSession};
			ajaxRequest(MySession, webURL + "/rejoin_event.php", connectedToEvent);
		}
		else
		{
			alert(response);
		}
	}
	
	function connectedToEvent(response)
	{
		if(typeof response === 'string')
		{
			response = response.trim();
			response = response.replace(/['"]+/g, '');
			if(response == "failed")
			{
				var MySession = {session_id : ActiveSession};
				ajaxRequest(MySession, webURL + "/show_events.php", checkExistingEvents);
			}
			else
			{
				alert(response);
			}
		}
		else
		{
			$('.collapse').collapse('hide');
			$("#NavigationBar").show();
			ChosenEvent["event_id"] = response["event_id"];
			ChosenEvent["event_name"] = response["event_name"];
			ChosenEvent["event_location"] = response["place"];
			ChosenEvent["event_description"] =  response["description"];
			joinEvent(response["event_id"]);
		}
	}
	
	
	function checkExistingEvents(response) // Check for string error or events object
	{
		if(typeof response === 'string')
		{
			alert(response); // Show error
		}
		else
		{
			showEvents(response); // Show events
		}
	}
		
	function showEvents(response) // Show on going events table
	{
		$("#Events").html('');
		Events = response;
		$('.collapse').collapse('hide');
		$("#NavigationBar").show();
		NumOfEvents = Events.length; // Number of events
		var container = $('<div class="contianer">');
		var row = $('<div class="row">');
		var listGroup = $('<div class="col-xs-8 col-xs-offset-2 list-group">');
				
		for(var i = 0; i < NumOfEvents; i++) // Go through all event s and show them
		{
			var eventId = Events[i].event_id; // Event id number
			var eventName = Events[i].event_name; // Event name
			var eventLocation = Events[i].place; // Event location
			var eventDescription = Events[i].description; // Event description
			var buttonInfo = $('<button type="button" class="list-group-item" id="'+ eventId +'"><label class="list-group-item-heading">' + eventName + '</label><br><label class="list-group-item-heading eventLocStyle">' + eventLocation+ '</label><br><p class="list-group-item-text">'+ eventDescription + '</p></button>');
			var bgcolor = chooseBtnColor(); // Choose acolor for button background
			buttonInfo.css('backgroundColor', bgcolor);
			buttonInfo.css('margin-top', '20px');
			var rgb = buttonInfo.css('backgroundColor'); // Get rgb color
			var brightness = lightOrDark(rgb); // Check color brightness
			if(brightness == "light") // Set text acorrding
			{
				buttonInfo.children()[0].style.color = "black";
				buttonInfo.children()[2].style.color = "black";
				buttonInfo.children()[4].style.color = "black";
			}
			else
			{
				buttonInfo.children()[0].style.color = "white";
				buttonInfo.children()[2].style.color = "white";
				buttonInfo.children()[4].style.color = "white";
			}
			BackGroundColorArr.push(bgcolor); // Save color to avoid repeat
			listGroup.append(buttonInfo);
		}
		row.append(listGroup);
		container.append(row);
		$('#Events').append(container);
		$("#Events").show();
		$('.nav li.Settings').removeClass('disabled');
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
	
	function joinEvent(id) // Send the id of the event to join
	{ 
		var eventID = id;
		var sendInfo = { event_id : eventID, session_id : ActiveSession};
		ajaxRequest(sendInfo, webURL + "/join_event.php", joinResults);
	}
	
	function joinResults(response) // if joind event successfully show event detailes
	{
		response = response.trim();
		response = response.replace(/['"]+/g, '');
		if(response.startsWith("success"))
		{
			response = response.replace('success','');
			alert(response);
			$("#Events").hide();
			$("#ActiveEventDiv").show();
			inEvent = true; // for pause and resume of app
			showActiveEvent();
		}
		else
		{
			alert(response);
		}
	}
		
	function showActiveEvent() // show event detailes and send locations to manager
	{ 
		document.getElementById('eventName').innerHTML = ChosenEvent["event_name"];
		document.getElementById('eventLocation').innerHTML = ChosenEvent["event_location"];
		document.getElementById('eventDescription').innerHTML = ChosenEvent["event_description"];
		getImages();
		$("#showLocation").show();
		$('.nav li.EndEvent').removeClass('disabled');
		$('.nav li.LogOut').addClass('disabled');
		$('.nav li.TryAgain').addClass('disabled');
		getLocation();
	}
	
	function getImages() // Get images from the server related to the event
	{ 
		var MyImages = {session_id : ActiveSession};
		ajaxRequest(MyImages, webURL + "/img_download.php", imageResult);
	}
	
	function imageResult(response) // show the images on the event page
	{ 
		if(response)
		{
			response = response.trim();
			response = response.replace(/\\\//g, "/");
			imageArr = JSON.parse(response);
			for(var i = 0; i < imageArr.length; i++)
			{
				imageArr[i] = imageArr[i].replace("/wamp64/www", "");
				imageArr[i] = webURL + imageArr[i];
			}
			currentImage = imageArr[0];
			document.getElementById("eventPicture").src = currentImage;
		}
	}
	
	function ChangePicture() // Change the displayed picture of the current event
	{
		var ImageIndex = imageArr.indexOf(currentImage);
		if(ImageIndex == imageArr.length - 1) // The last picture
		{
			currentImage = imageArr[0];
		}
		else // Other pictures
		{
			ImageIndex++;
			currentImage = imageArr[ImageIndex];
		}
		document.getElementById("eventPicture").src = currentImage;
	}
	
	function TakePicture(){ // Take a picture and send to manager
		navigator.getPicture(picSuccessCallback, picErrorCallback, options)
	}
	
	function picSuccessCallback(imageData){
		var imageCamera = document.getElementById('cameraImage');
		imageCamera.src = "data:image/jpeg;base64," + imageData;
		$('#cameraModal').modal('show');
	}
	
	function picErrorCallback(response){
		alert("Error: " + response);
	}
		
	function sendPicToServer(){
		var pic = new FormData();
		pic.append('imageCamera', document.getElementById('cameraImage').src);
		pic.append('session_id', ActiveSession);
		ajaxRequest(pic, webURL + "/img_upload.php", sendPicSuccess, false, false);
	}
	
	function sendPicSuccess(response){
		response = response.trim();
		response = response.replace(/['"]+/g, '');
		alert(response);
	}
		
	function getLocation()
	{
		if(!bgGeo)
		{
			bgGeo = window.BackgroundGeolocation;
			bgGeo.configure({
				desiredAccuracy: 0,
				distanceFilter: 30,
				locationUpdateInterval: 15000,
				fastestLocationUpdateInterval: 5000,
				url: webURL + "/receive_data.php",
				method: "POST",
				headers:{
					crossDomain: true,
					beforeSend: function(xhr){
						xhr.withCredentials = true;
					}
				},
				params:{
					session_id : ActiveSession
				},
				httpRootProperty: 'data',
				locationTemplate: '{"time":"<%= timestamp %>", "lat":<%= latitude %>, "lng":<%= longitude %>}',
				extras: {
					foundBit : foundPoint
				},
				batchSync: true,
				maxBatchSize: 10,
				httpTimeout: 20000,
				debug: true
			}, 
			function(state)
			{
			  if (!state.enabled) {  // current state provided to callback
				bgGeo.start();
			  }
			});
		}
		bgGeo.on("http", ajaxSuccess, ajaxFailure);
		bgGeo.on("location", successFn, failureFn);
	}
		
	function ajaxSuccess(response) // ajax response success
	{
		var status = response.status;
		var responseText = response.responseText;
		responseText = responseText.replace(/(\r\n|\n|\r)/gm,"");
		responseText = responseText.trim();
		//alert(responseText);
		if(foundPoint == 1)
		{
			foundPoint = 0;
		}
		if(responseText == "EventEnded")
		{
			alert("יצאת מהאירוע בהצלחה");
			EventEndResult("success")
		}
	}
	
	function ajaxFailure(response) // ajax response failure
	{ 
		var status = response.status;
		var responseText = response.responseText;
		responseText = responseText.replace(/(\r\n|\n|\r)/gm,"");
		responseText = responseText.trim();
		alert(responseText);
	}
		
	function successFn(location) // location retrived success
	{ 
		var coords = location.coords;
		var timestamp = location.timestamp;
		var latitude = coords.latitude;
		var longitude = coords.longitude;
		var speed = coords.speed;
		var userLocation = "lat: " + latitude + ", lon: " + longitude + ", time: " + timestamp;
		//alert(userLocation);
		// testing:
		//document.getElementById("userLocation").innerHTML = "";
		//document.getElementById("userLocation").innerHTML = "lat: " + latitude + ", lon: " + longitude + ", time: " + timestamp;
	}
		
	function failureFn(errorCode) // location retrived failure
	{ 
		document.getElementById("userLocation").innerHTML = "location failure";
		if(errorCode == 0) 
		{
		   alert("Failed to retrieve location", alertDismissed);
		}
		else if(errorCode == 1) 
		{
		   alert("You must enable location services in Settings", alertDismissed);
		}
		else if(errorCode == 2) 
		{
		   alert("Network error", alertDismissed);
		}
		else
		   alert("Location timeout", alertDismissed);
	}
	
	function EventEnd(){ // Event end - exit event
		var endEvent = {session_id : ActiveSession};
		ajaxRequest(endEvent, webURL + "/end_of_event.php", EventEndResult);
	}
	
	function EventEndResult(resposne)
	{
		if(response == "Success")
		{
			alert("יצאת מהאירוע בהצלחה");
			bgGeo.stop();
			$('.nav li.EndEvent').addClass('disabled');
			$('.nav li.LogOut').removeClass('disabled');
			$('.nav li.TryAgain').removeClass('disabled');
			$("#ActiveEventDiv").hide();
			$("#showLocation").hide();
			$("#Events").show();
			inEvent = false;
		}
		else
		{
			alert("שגיאה בעזיבת האירוע");
		}
	}
	
	function LogOut() // Request to log out from app
	{
		var logout = {session_id : ActiveSession};
		ajaxRequest(logout, webURL + "/logout.php", LogOutResult);
	}
	
	function LogOutResult(response) // Log out response from server
	{ 
		if(response == "Success")
		{
			alert("התנתקת בהצלחה");
			$("#Events").hide();
			$("#ActiveEventDiv").hide();
			$("#showLocation").hide();
			$("#NavigationBar").hide();
			$('#LoginForm').show();
		}
		else
		{
			alert("בעיה בהתנתקות");
		}
		
	}
	
	function onDeviceReady() // Control the phone buttons
	{ 
		document.addEventListener("pause", onPause, false);
		document.addEventListener("resume", onResume, false);
		document.addEventListener("menubutton", onMenuKeyDown, false);
		document.addEventListener("backbutton", onBackKeyDown, false);
		window.FirebasePlugin.hasPermission(function(data){
			console.log(data.isEnabled);
		});
	}
	
	function setNotification(){
		window.FirebasePlugin.onTokenRefresh(function(token) { // Generates a token for the device
			SendTokenToServer(token);
		}, function(error) {
			console.error(error);
		});
		window.FirebasePlugin.subscribe("Rescue-New-Event");
	}
	
	function SendTokenToServer(token){ // Send the token to the database
		var TokenData = {session_id : ActiveSession, my_token : token};
		ajaxRequest(TokenData, webURL + "/token.php", tokenResult);
	}
	
	function tokenResult(response){ // Get database insert result
		response = response.trim();
		response = response.replace(/['"]+/g, '');
		if(response == "Success")
		{
			alert("device is in the database");
		}
		else
		{
			alert(response);
		}
	}
	
	function onPause()
	{
		
	}
	
	function onResume() // when the app returns to main screen
	{
		if(inEvent == true)
		{
			$("#Events").hide();
			$("#ActiveEventDiv").show();
		}
	}
	
	function onMenuKeyDown() // Ignore the back button
	{ 
		
	}
	
	function onBackKeyDown() // Ignore the back button
	{ 
		
	}
	
	$("document").ready(function()
	{
		$("#Events").hide();
		$("#NavigationBar").hide();
		$("#ActiveEventDiv").hide();
		$("#showLocation").hide();
						
		$('#LoginForm').submit(function(event){ // Send login info to the server
			event.preventDefault();
			SubForm();
		});
		
		$(document).on("click", "#MenuTryAgainBtn", function(){ // Refresh events page
			event.preventDefault();
			BackGroundColorArr = [];
			var tryagain = "success" + ActiveSession;
			getEvents(tryagain);
		});
		
		$(document).on("click", "#MenuEndEventBtn", function(){ // Finish the participating in the event
			event.preventDefault();
			var myanswer = confirm("אתה בטוח שאתה רוצה לסיים את האירוע?");
			if(myanswer)
			{
				EventEnd();
			}
		});
				
		$(document).on("click", "#MenuSettingsBtn", function(){ // Change app settings (in the future)
			event.preventDefault();
		});
				
		$(document).on("click", "#MenuLogOutBtn", function(){ // Log out form the app and back to the login screen
			event.preventDefault();
			var answer = confirm("אתה בטוח שאתה רוצה להתנתק?");
			if(answer)
			{
				LogOut();
			}
		});
		
		$(document).on("click", "#ChangePic", function(){ // Change Displayed picture
			event.preventDefault();
			ChangePicture();
		});
				
		$(document).on("click", ".list-group-item", function(){ // Choose an event to participate in
			var id = $(this).attr("id"); 
			ChosenEvent["event_id"] = id;
			ChosenEvent["event_name"] = $(this).children()[0].textContent;
			ChosenEvent["event_location"] = $(this).children()[2].textContent; 
			ChosenEvent["event_description"] = $(this).children()[4].textContent; 
			joinEvent(id);
		});
		
		$(document).on("click", "#found", function(){ // Send found person coordinates
			event.preventDefault();
			foundPoint = 1;
			document.getElementById("found").disabled = true;
		});
		
		$(document).on("click", "#TakePic, #anotherPic", function(){ // Take a picture and send it to the database
			event.preventDefault();
			TakePicture();
		});
		
		$(document).on("click", "#sendPic", function(){ // Take a picture and send it to the database
			event.preventDefault();
			sendPicToServer();
		});
		
		$(document).on("click", "#eventPicture", function(){ // Enlarge picture
			event.preventDefault();
			var MyPic = document.getElementById('eventPicture');
			var currentImg = document.getElementById("currentImage");
			currentImg.src = MyPic.src;
			$('#imageModal').modal('show');
		});

	});	
	
}());



