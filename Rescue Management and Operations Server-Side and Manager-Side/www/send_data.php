<?php

// This page handels the locations and send them to the manager side

header('Access-Control-Allow-Origin: *');
include 'head.php';
include 'reconnect.php';

$event_id = read_from_ses('event_id');
$user_id = read_from_ses('user_id');

if(isset($_POST['TimeStampObject']))
{	
	// Set the time stamp object
	$time_stamp_location = $_POST['TimeStampObject'];
	
	// Set the actuall time from last transmition;
	$time_stamp = $time_stamp_location['timeStamp'];
	
	// Getting all the user_id of users that are participating in the event
	$active_users_in_event_command_text = "SELECT user_id 
										   FROM event__$event_id";

	// Initialize an array for the check signed user column names
	$active_users_in_event_column_names_array = array("user_id");
									
	// Set the active users in event retrived data array
	$active_users_in_event_retrived_data_array = retrive_sql_data($active_users_in_event_command_text, $active_users_in_event_column_names_array);

	// Get the length of the active users in event retrived data array
	$active_users_in_event_arr_length = count($active_users_in_event_retrived_data_array);

	// check number of participants in the event
	if($active_users_in_event_arr_length > 0)
	{
		// Go through all object and get coordinates of all users in the event
		for($data_array_index = 0; $data_array_index < $active_users_in_event_arr_length; $data_array_index++)
		{
			// The query is empty at start
			$all_users_coordinates = "";
			
			// The event id phrasing in the database
			$ev = "__".$event_id;
			
			// Get the current user_id object from the array
			$active_users_in_event_object = $active_users_in_event_retrived_data_array[$data_array_index];
			
			// Get the user_id number from the object and phrase it to the database
			$participant = "__".$active_users_in_event_object['user_id'];
			
			// The query it self with the phrasing from "above"
			$all_users_coordinates .= "SELECT user_name, latitude, longitude, timestamp
										 FROM event$ev$participant";
			
			// Union all coordinates togther
			if($data_array_index < $active_users_in_event_arr_length - 1)
			{		
				$all_users_coordinates .= " UNION ALL ";	
			}
		}
	
		// Initialize an array for the gps location of all users column names
		$event_users_coordinates_column_names_array = array("user_name", "latitude", "longitude", "timestamp");
										
		// Get all active users gps locations retrived data array
		$active_users_gps_locations_retrived_data_array = retrive_sql_data($all_users_coordinates, $event_users_coordinates_column_names_array);
		
		// Active users gps locations array length
		$active_users_gps_locations_arr_length = count($active_users_gps_locations_retrived_data_array);
		
		// Temp user id to put every specific user and its locations in a spereate array
		$temp_user_name = "";
		
		// Array that contains a specific user and all its locations
		$specific_user_locations_arr = array();
		
		// Array that contains a number of array according to the number of active users
		$all_users_locations_data_arr = array();
		
		// Go through all active users and locations in the event
		for($data_array_index = 0; $data_array_index < $active_users_gps_locations_arr_length; $data_array_index++)
		{
			// Get current user location object
			$active_users_gps_locations_object = $active_users_gps_locations_retrived_data_array[$data_array_index];
			
			// Check if the current location already been sent by checking the time stamp of the location
			if($active_users_gps_locations_object['timestamp'] > $time_stamp)
			{
				// Check if the temp user name never been set
				if($temp_user_name == "")
				{
					// Set the temp user name as the current object user name
					$temp_user_name = $active_users_gps_locations_object['user_name'];
				}
				// Check if the temp user name is diffrent from the current user name in the current object
				if($temp_user_name == $active_users_gps_locations_object['user_name'])
				{
					// Push the user location object into the array
					array_push($specific_user_locations_arr, $active_users_gps_locations_object);
				}
				else
				{
					// A diffrent user name recognized - push the current array to the all users locations array
					array_push($all_users_locations_data_arr,$specific_user_locations_arr);
					
					// Set the temp user name as the new user name
					$temp_user_name = $active_users_gps_locations_object['user_name'];
					
					// Reset the specific user array
					$specific_user_locations_arr = array();
					
					// Push the current location object to the new formated array
					array_push($specific_user_locations_arr, $active_users_gps_locations_object);
				}
			}
		}
		// Send to Mangar side to show on map
		echo json_encode($all_users_locations_data_arr);
	}
	else
	{
		echo json_encode('no participants yet');	
	}
}
?>