var mainFunction = (function()
{
	document.addEventListener("deviceready", onDeviceReady, false);
	var ActiveSession; // the active session
	var Events = null;
	var webURL = "http://e734e372.ngrok.io"; // server url
	var inEvent = false;
	var bgGeo = null; // init inside getLocation()
	var EventNum;
	var ChosenEvent = [];
	var imageArr = [];
	var currentImage;
	
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
			var MySession = {session_id : ActiveSession}
			ajaxRequest(MySession, webURL + "/show_events.php", checkExistingEvents);
		}
		else
		{
			alert(response);
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
		Events = response;
		$('.collapse').collapse('hide');
		$("#NavigationBar").show();
		NumOfEvents = Events.length; // Number of events
		var listGroup = $('<div class="list-group">');
				
		for(var i = 0; i < NumOfEvents; i++) // Go through all event s and show them
		{
			var eventId = Events[i].event_id; // Event id number
			var eventName = Events[i].event_name; // Event name
			var eventLocation = Events[i].place; // Event location
			var eventDescription = Events[i].description; // Event description
			var buttonInfo = $('<button type="button" class="list-group-item" id="'+ eventId +'"><h3 class="list-group-item-heading">' + eventName + '</h3><h4 class="list-group-item-heading">' + eventLocation+ '</h4><p class="list-group-item-text">'+ eventDescription + '</p></button>');

			listGroup.append(buttonInfo);
		}
		$('#Events').append(listGroup);
		$("#Events").show();
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
		document.getElementById('eventID').innerHTML = "מספר אירוע: " + ChosenEvent["event_id"];
		document.getElementById('eventLocation').innerHTML = "מיקום: " + ChosenEvent["event_location"];
		document.getElementById('eventDescription').innerHTML = "תיאור: " + ChosenEvent["event_description"];
		getImages();
		$("#showLocation").show();
		getLocation();
	}
	
	function getImages() // Get images from the server related to the event
	{ 
		var MySession1 = {session_id : ActiveSession};
		ajaxRequest(MySession1, webURL + "/img_download.php", imageResult);
	}
	
	function imageResult(response) // show the images on the event page
	{ 
		if(response)
		{
			response = response.trim();
			response = response.replace(/\\\//g, "/");
			imageArr = JSON.parse(response);
			currentImage = imageArr[0];
			document.getElementById("eventPicture").src = imageArr[0];
		}
	}
	
	function ChangePicture() // Change the displayed picture of the current event
	{
		var ImageIndex = imageArr.indexOf(currentImage);
		if(ImageIndex == imageArr.length - 1)
		{
			currentImage = imageArr[0];
			document.getElementById("eventPicture").src = imageArr[0];
		}
		else
		{
			document.getElementById("eventPicture").src = imageArr[ImageIndex++];
			currentImage = imageArr[ImageIndex++];
		}
	}
		
	function getLocation()
	{
		if(bgGeo == null)
		{
			bgGeo = window.BackgroundGeolocation;
			bgGeo.configure({
				desiredAccuracy: 0,
				distanceFilter: 30,
				locationUpdateInterval: 15000,
				fastestLocationUpdateInterval: 5000,
				url: webURL + "/receive_data.php",
				headers:{
					crossDomain: true,
					beforeSend: function(xhr){
						xhr.withCredentials = true;
					}
				},
				httpRootProperty: 'data',
				params:{
					session_id : ActiveSession
				},
				locationTemplate: '{"time":"<%= timestamp %>", "lat":<%= latitude %>, "lng":<%= longitude %>}',
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
		var responseText = responseText.trim();
		if(responseText == "Event ended")
			EventEnd();
	}
	
	function ajaxFailure(response) // ajax response failure
	{ 
		var status = response.status;
		var responseText = response.responseText;
	}
		
	function successFn(location, taskId) // location retrived success
	{ 
		var coords = location.coords;
		var timestamp = location.timestamp;
		var latitude = coords.latitude;
		var longitude = coords.longitude;
		var speed = coords.speed;
		bgGeo.finish(taskId);
		// testing:
		document.getElementById("userLocation").innerHTML = "";
		document.getElementById("userLocation").innerHTML = "lat: " + latitude + ", lon: " + longitude + ", time: " + timestamp;
	}
		
	function failureFn(errorCode) // location retrived failure
	{ 
		document.getElementById("userLocation").innerHTML = "location failure";
		if(errorCode == 0) 
		{
		   navigator.notification.alert("Failed to retrieve location", alertDismissed);
		}
		else if(errorCode == 1) 
		{
		   navigator.notification.alert("You must enable location services in Settings", alertDismissed);
		}
		else if(errorCode == 2) 
		{
		   navigator.notification.alert("Network error", alertDismissed);
		}
		else
		   navigator.notification.alert("Location timeout", alertDismissed);
	}
	
	function EventEnd(){ // Event ended by manager
		bgGeo.stop();
		$("#ActiveEventDiv").hide();
		$("#showLocation").hide();
		$("#Events").show();
		inEvent = false;
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
		document.addEventListener("backbutton", onMenuKeyDown, false);
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
			showEvent();
		}
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
			getEvents(ActiveSession);
		});
		
		$(document).on("click", "#MenuEndEventBtn", function(){ // Finish the participating in the event
			event.preventDefault();
		});
				
		$(document).on("click", "#MenuSettingsBtn", function(){ // Change app settings (in the future)
			event.preventDefault();
		});
				
		$(document).on("click", "#MenuLogOutBtn", function(){ // Log out form the app and back to the login screen
			event.preventDefault();
			LogOut();
		});
		
		$(document).on("click", "#ChangePic", function(){ // Change Displayed picture
			event.preventDefault();
			ChangePicture();
		});
				
		$(document).on("click", ".list-group-item", function(){ // Choose an event to participate in
			var id = $(this).attr("id"); 
			ChosenEvent["event_id"] = id;
			ChosenEvent["event_name"] = $(this).children("h3").text();
			ChosenEvent["event_location"] = $(this).children("h4").text(); 
			ChosenEvent["event_description"] = $(this).children("p").text(); 
			joinEvent(id);
		});

	});	
	
}());



