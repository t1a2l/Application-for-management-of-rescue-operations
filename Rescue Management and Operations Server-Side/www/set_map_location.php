<?php

// This page handles what location the map will show

header('Access-Control-Allow-Origin: *');
include 'head.php';
include 'reconnect.php';

$event_id = read_from_ses('event_id');
$user_id = read_from_ses('user_id');

if(isset($_POST['GetMapLocation']))
{	
	// Set the time stamp object
	$map_location = $_POST['GetMapLocation'];
	
	// Set the actuall time from last transmition;
	$bit = $map_location['MapLocationBit'];
	
	if(bit == true)
	{
		//Getting all the user_id of users that are participating in the event
		$map_location_command_text = "SELECT E.place 
								      FROM events E
									  WHERE E.event_id = '$event_id'";

		// Initialize an array for column name of the location on the map
		$map_location_column_names_array = array("place");
									
		// Set the check signed user retrived data array
		$map_location_retrived_data_array = retrive_sql_data($map_location_command_text, $map_location_column_names_array);

		$map_location_arr_length = count($map_location_retrived_data_array);

		// check number of participants in the event
		if($map_location_arr_length == 1)
		{
			
			// Set the signed user object that was found in the retrived data array ...
			$map_location_object = $map_location_retrived_data_array[0];
			
			// Set the signed user ID for the login operation ...
			$place = $map_location_object['place'];
					
			echo json_encode($place);
		}
		else
		{
			echo json_encode("location error");	
		}
	}
}
?>