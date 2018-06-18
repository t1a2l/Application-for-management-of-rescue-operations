<?php

// This page handels the reciveing of areas corrdinates from the database

header('Access-Control-Allow-Origin: *');

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
	
	// Getting the area objects from the database
	$area_objects_command_text = "SELECT area_id, type, properties, geometry
								  FROM areas
								  WHERE event_id = '$event_id'";

	// Initialize an array for the area objects column names
	$area_objects_column_names_array = array("area_id", "type", "properties", "geometry");
									
	// The area objects retrived data array
	$area_objects_retrived_data_array = retrive_sql_data($area_objects_command_text, $area_objects_column_names_array);

	// Get the length of the search areas retrived data array
	$area_objects_arr_length = count($area_objects_retrived_data_array);

	// Check if the search areas array exist
	if($area_objects_arr_length > 0)
	{
		$area_object_arr = [];
		
		for($i = 0; $i < $area_objects_arr_length; $i++)
		{
			// Area object
			$area_object_db = $area_objects_retrived_data_array[$i];
		
			// Type of the area
			$area_object_arr[$i]['type'] = json_decode($area_object_db['type']);
			
			// Properties of the area
			$area_object_arr[$i]['properties'] = json_decode($area_object_db['properties']);
			
			// Coordinates of the area
			$area_object_arr[$i]['geometry'] = json_decode($area_object_db['geometry']);
		}
		
		echo json_encode($area_object_arr);
	}
}
?>