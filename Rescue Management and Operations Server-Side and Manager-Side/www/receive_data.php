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
			echo json_encode("EventEnded")
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

	// array that iclude all the recent locations from the user
	$location_value_arr = array();

	// connectio to the database
	$sql_connection = connect_to_database();

	foreach($data['data'] as $row)
	{
		// Check if found bit flag has been raised
		$found_point = $row['foundBit'];
		if(count($location_value_arr) > 0 && $found_point == 1)
		{
			$found_point = 0;
		}
		
		// Get the location and time without special charcaters
		$latitude = mysqli_real_escape_string($sql_connection,$row['lat']);
		$longitude = mysqli_real_escape_string($sql_connection,$row['lng']);
		$timestamp = mysqli_real_escape_string($sql_connection,$row['time']);
		
		// Show timestamp correctly
		$timestamp = strtotime($timestamp);
		$timestamp = date('Y/m/d H:i:s', $timestamp + 3 * 3600);
		
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