<?php

// This page handels the storing of areas to the database

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

if(isset($_SESSION['session_user_id']) && $_SESSION['session_user_id'] == $user_id && isset($_POST['AreaObjectArray']) && isset($_POST['eventID']))
{	
	// Get the area object
	$area_object_arr = $_POST['AreaObjectArray'];
	
	// Get the event id of the search areas
	$event_id = $_POST['eventID'];
	
	// The length of the area object array
	$area_object_arr_length = count($area_object_arr);
	
	// Go thorugh all areas and update or insert them to the database
	for($i = 0; $i < $area_object_arr_length; $i++)
	{
		// Area object
		$area_object = $area_object_arr[$i];
		
		// Id of the area
		$area_id = $area_object['properties']['id'];
		
		// Type of the area
		$type = json_encode($area_object['type']);
		
		// Properties of the area
		$properties = json_encode($area_object['properties']);
		
		// Coordinates of the area
		$geometry = json_encode($area_object['geometry']);
		
		// Check if the area exist sql command text
		$search_areas_check_command_text = "SELECT area_id
											FROM areas
											WHERE event_id = '$event_id' AND area_id = '$area_id'";

		// Initialize an array for the area id column names
		$search_areas_check_column_names_array = array("area_id");
										
		// The area id retrived data array
		$search_areas_check_retrived_data_array = retrive_sql_data($search_areas_check_command_text, $search_areas_check_column_names_array);

		// Get the length of the area id retrived data array
		$search_areas_check_arr_length = count($search_areas_check_retrived_data_array);

		// Check if the area id exist in the database
		if($search_areas_check_arr_length > 0)
		{
			// Update the area with the changes command text
			$updae_area_command_text = "UPDATE areas 
									    SET type = '$type', properties = '$properties', geometry = '$geometry'
									    WHERE event_id = '$event_id' AND area_id = '$area_id'";
			
			// Update area in the areas table
			$update_area_response_arr = execute_sql_command($updae_area_command_text);
			
			// If Updating area was not succesfull
			if(!$update_area_response_arr[1])
			{
				echo json_encode("Problem updating area number '$area_id'");
				exit();
			}
		}
		else
		{
			$insert_areas_command_text = "INSERT INTO `areas` (`event_id`, `area_id`, `type`, `properties`, `geometry`)
									      VALUES ('$event_id', '$area_id', '$type', '$properties', '$geometry')";
			
			// Insert area in the areas table
			$insert_area_response_arr = execute_sql_command($insert_areas_command_text);
			
			// If Inserting area was not succesfull
			if(!$insert_area_response_arr[1])
			{
				echo json_encode("Problem adding area number $area_id");
				exit();
			}
		}
	}

	// Update the area with the changes command text
	$updae_area_num_command_text = "UPDATE events 
									SET search_areas_num = '$area_object_arr_length'
									WHERE event_id = '$event_id'";
	
	// Update area in the areas table
	$update_area_num_response_arr = execute_sql_command($updae_area_num_command_text);
	
	// If Updating area was not succesfull
	if(!$update_area_num_response_arr[1])
	{
		echo json_encode("Problem updating number of areas");
		exit();
	}

	// Convert area object array to a string
	$area_info = json_encode($area_object_arr);
	
	// Export the string to a text file
	file_put_contents('areas.txt', var_export($area_info, TRUE));
	
	// Return success to manager
	echo json_encode("Success");
}
?>