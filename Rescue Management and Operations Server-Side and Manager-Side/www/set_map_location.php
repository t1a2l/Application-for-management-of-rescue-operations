<?php

// This page handles what location the map will show

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=iso-8859-1');

// If the user session ID is set
if(isset($_POST['session_id']))
{
	// Get the user session ID
	$session_id=$_POST['session_id'];
	
	// Set the user session ID
	session_id($session_id);
}

include 'head.php';
include 'data_operations.php';

// Get the user belongs to the session
$user_id = read_from_session('session_user_id');

if(isset($_SESSION['session_user_id']) && $_SESSION['session_user_id'] == $user_id && isset($_POST['eventID']))
{	
	// Get the event id
	$event_id = $_POST['eventID'];
		
	//Getting the place according to the event id
	$map_location_command_text = "SELECT place 
								  FROM events
								  WHERE event_id = '$event_id'";

	// Initialize an array for column name of the location on the map
	$map_location_column_names_array = array("place");
								
	// Get the location from the database
	$map_location_retrived_data_array = retrive_sql_data($map_location_command_text, $map_location_column_names_array);

	// Location array length
	$map_location_arr_length = count($map_location_retrived_data_array);

	// If there is one location
	if($map_location_arr_length > 0)
	{
		// Get the array map object
		$map_location_object = $map_location_retrived_data_array[0];
		
		// Get the actual plcae name
		$place = $map_location_object['place'];
		
		// Send the place name back to the manager
		echo json_encode($place);
	}
	else
	{
		// No locations
		echo json_encode("location error");	
	}
	
}
?>