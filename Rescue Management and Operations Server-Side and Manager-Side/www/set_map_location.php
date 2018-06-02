<?php

// This page handles what location the map will show

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=iso-8859-1');
include 'head.php';
include 'data_operations.php';

$user_id = read_from_session('session_user_id');

if(isset($_POST['MyMapLocation']))
{	
	// Get the map bit object
	$map_location = $_POST['MyMapLocation'];
	
	// Set the bit
	$bit = $map_location['MapLocationBit'];
	
	if(bit == true)
	{
		// Getting the event id of the user
		$event_id_command_text = "SELECT event_id
								  FROM users
								  WHERE user_id = '$user_id'";

		// Initialize an array for the event id
		$event_id_column_names_array = array("event_id");
										
		// Get the event id from the database
		$event_id_retrived_data_array = retrive_sql_data($event_id_command_text, $event_id_column_names_array);

		// Get the length of the event id retrived data array
		$event_id_arr_length = count($event_id_retrived_data_array);
		
		// If the event id exist
		if($event_id_arr_length == 1)
		{
			$event_id_object = $event_id_retrived_data_array[0];
			$event_id = $event_id_object["event_id"];
		}
		else
		{
			echo json_encode("problem in getting event id of the user");
			exit();
		}
		
		
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
		if($map_location_arr_length == 1)
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
			// More then 1 location or no locations
			echo json_encode("location error");	
		}
	}
}
?>