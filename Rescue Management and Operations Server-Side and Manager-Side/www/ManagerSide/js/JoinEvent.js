var mainFunction = (function()
{
	var webURL; // server url
	var Events = [];
	var ChosenEvent = [];
	var myEvent = new Object();
	
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
			if(response.length == 1)
			{
				myEvent.event_id = response[0]["event_id"];
				myEvent.event_name = response[0]["event_name"];
				myEvent.s_time = response[0]["s_time"];
				joinEvent(myEvent);
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
	
	function joinEvent(myEvent){
		ChosenEvent.push(myEvent);
		localStorage.setItem("ChosenEvent", JSON.stringify(ChosenEvent));
		window.location.href = "ActiveEvent.html";
	}
	
	$("document").ready(function(){
		webURL = serverURL(); // server url
		GetEventProperties();
		$(document).on("click", ".list-group-item", function(){ // Choose the event to manage
			myEvent.event_id = $(this).attr("id");
			myEvent.event_name = $(this).children()[0].textContent;
			myEvent.s_time = $(this).children()[1].textContent;
			joinEvent(myEvent);
		});
	});
}());