<?php

// This page handels the reciving of the recent locations from the user and insert to the database 
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

// Get the location array from the client with the session id
$data = json_decode(file_get_contents("php://input"),true);

if(isset($data['session_id']))
{
	// Get the session from the array
	$session_id = $data['session_id'];
	
	// set the current session as the one to work with
	session_id($session_id);
	
	include 'head.php';
	include 'data_operations.php';

	// Read the event id from the current session
	$event_id = read_from_session('event_id');

	// Read the user id from the current session
	$user_id = read_from_session('session_user_id');
	
	// Command text to check if current event has ended by manager
	$event_check_command_text = "SELECT event_id 
								 FROM users 
								 WHERE user_id = '$user_id'";
	
	// Initialize an array for the event check column names
	$event_check_column_names_array = array("event_id");
									
	// The event check retrived data array
	$event_check_array = retrive_sql_data($event_check_command_text, $event_check_column_names_array);
	
	// If the event id was found
	if(count($event_check_array) > 0)
	{
		// Set the event check object that was found in the retrived data array
		$event_check_object = $event_check_array[0];

		// Set the current event id of the current user
		$current_event_id = $event_check_object['event_id'];
		
		// Check if the user is still participating in an event
		if($current_event_id == 0)
		{
			// If not end the event for the user
			echo json_encode("EventEnded");
			exit();
		}
	}

	// The user name sql query
	$username_command_text = "SELECT username
							  FROM users
							  WHERE user_id = '$user_id'";

	// Initialize an array for the user name column names
	$username_column_names_array = array("username");
									
	// The user name retrived data array
	$username_array = retrive_sql_data($username_command_text, $username_column_names_array);

	// If the user name has been found
	if(count($username_array) > 0)
	{
		// Set the user name object that was found in the retrived data array
		$username_object = $username_array[0];

		// Set the user name
		$username = $username_object['username'];
	}
	else
	{
		echo json_encode("error in retriving username");
		exit();
	}

	// Insert all locations to the user table
	$insert_locations_command_text = "INSERT INTO `locations` (user_id, user_name, event_id, latitude,longitude,timestamp, found_point) VALUES ";

	// array that includes all the recent locations from the user after removing bad points
	$location_value_arr = array();

	// connectio to the database
	$sql_connection = connect_to_database();

	// add all locations from user to a location array - every index is a location object
	$location_arr = array();
	
	foreach($data['data'] as $row)
	{
		// Check if found bit flag has been raised
		$found_point = $row['foundBit'];
		
		if(count($location_arr) > 0 && $found_point == 1)
		{
			$found_point = 0;
		}
		
		// Object that includes latitude, longitude, timestamp and found_point
		$locationObject = array();
		
		// Get the location and time without special charcaters
		$latitude = mysqli_real_escape_string($sql_connection,$row['lat']);
		$longitude = mysqli_real_escape_string($sql_connection,$row['lng']);
		$timestamp = mysqli_real_escape_string($sql_connection,$row['time']);
		
		// Show timestamp correctly
		$date =  new DateTime($timestamp);
		$timestamp = date_format($date, 'Y/m/d H:i:s');
		
		// Push current row of data to the location object
		array_push($locationObject, $latitude, $longitude, $timestamp, $found_point);
		
		// Push the location object to the location array
		array_push($location_arr, $locationObject);
	}
	
	// A loop for checking and removing bad points
	for($i = 1; $i < count($location_arr); $i++)
	{
		// First location object data
		$pointA_lat = $location_arr[i-1][0];
		$pointA_long = $location_arr[i-1][1];
		$pointA_time = $location_arr[i-1][2];
		
		// Turn the timestamp string to a datetime object format
		$pointA_datetime = new DateTime($pointA_time);
		
		// Second location object data
		$pointB_lat = $location_arr[i][0];
		$pointB_long = $location_arr[i][1];
		$pointB_time = $location_arr[i][2];
		
		// Turn the timestamp string to a datetime object format
		$pointB_datetime = new DateTime($pointB_time);
		
		// Get the absolute value of the seconds between the two points
		$seconds_between_points = abs(date_timestamp_get($pointA_datetime) - date_timestamp_get($pointB_datetime));

		// Average walking speed of a human in meters per seconds
		$person_walk_speed = 1.25;
		
		// The max distance a person can go according to the speed and time provided
		$max_distance = $person_walk_speed * $seconds_between_points;
		
		// Get the actual distance between the two points
		$actual_distance = distanceInMetersBetweenEarthCoordinates($pointA_lat, $pointA_long, $pointB_lat, $pointB_long);
		
		// If the max distance is smaller then the actual distance it is a bad point
		if($max_distance < $actual_distance)
		{
			// Remove the bad point object from the array
			array_splice($location_arr, $i, 1);
			
			// Go down one index - because splice function remove the object
			// and remap the indexes in the array so for example 2 turns to 1
			// because 1 was removed for being bad point and we need to check 0 
			// with the new 1 (that was 2 before)
			$i--;
		}
	}

	// Set the string array of the locations as empty
	$location_value_arr[] = "";
	
	for($x = 0; $x < count($location_arr); $x++)
	{
		// Get the objects from the location array after removing all the bad points
		$latitude = $location_arr[$x][0];
		$longitude = $location_arr[$x][1];
		$timestamp = $location_arr[$x][2];
		$found_point = $location_arr[$x][3];
		
		// Insert the current location to the locations value array
		$location_value_arr[] .= "('$user_id', '$username', '$event_id', '$latitude', '$longitude', '$timestamp', '$found_point')";
	}

	// Add the location value array to the query for inserting in the database
	$insert_locations_command_text .= implode(", ", $location_value_arr);

	// Save what was trying to be inserted to the database
	file_put_contents('text1.txt', var_export($insert_locations_command_text, TRUE));
	
	// Execute the location insert to the database
	$response_id_arr = execute_sql_command($insert_locations_command_text);

	// Check if the user locations table exist
	if($response_id_arr[1])
	{
		echo json_encode('recieved locations');
	}
	else
	{
		echo json_encode('problems in recieving locations');
	}
}
else
{
	echo json_encode('no session');
}	

?>