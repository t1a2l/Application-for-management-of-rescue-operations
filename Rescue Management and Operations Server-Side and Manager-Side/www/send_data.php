<?php

// This page handels the locations and send them to the manager side

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

if(isset($_SESSION['session_user_id']) && $_SESSION['session_user_id'] == $user_id && isset($_POST['currentLocations']))
{	
	// Set the time stamp object
	$location_object = $_POST['currentLocations'];
	
	// Set the actuall time from last transmition
	$time_stamp = $location_object['TimeStampLocation'];
	
	// Get the active event id
	$event_id = $location_object['eventID'];
			
	// Getting all the user_id of users that are participating in the event
	$active_users_in_event_command_text = "SELECT user_id, user_name, color 
										   FROM users
										   WHERE event_id = '$event_id'";

	// Initialize an array for the check signed user column names
	$active_users_in_event_column_names_array = array("user_id", "user_name", "color");
									
	// Set the active users in event retrived data array
	$active_users_in_event_retrived_data_array = retrive_sql_data($active_users_in_event_command_text, $active_users_in_event_column_names_array);

	// Get the length of the active users in event retrived data array
	$active_users_in_event_arr_length = count($active_users_in_event_retrived_data_array);

	// check number of participants in the event
	if($active_users_in_event_arr_length > 0)
	{
		// The query is empty at start
		$event_users_locations_command_text = "SELECT * 
											   FROM locations
											   WHERE event_id = '$event_id'";
			
		file_put_contents('text2.txt', var_export($event_users_locations_command_text, TRUE));
		
		// Initialize an array for the gps location of all users column names
		$event_users_locations_column_names_array = array("location_id", "user_id", "user_name", "event_id", "latitude", "longitude", "timestamp", "found_point");

		// Get all active users gps locations retrived data array
		$event_users_locations_retrived_data_array = retrive_sql_data($event_users_locations_command_text, $event_users_locations_column_names_array);
		
		// The array length of the users locations in the event
		$event_users_locations_arr_length = count($event_users_locations_retrived_data_array);
		
		// Temp user name to put every specific user and its locations in a spereate array
		$temp_user_name = "";
		
		// Array that contains the event locations and users detailes
		$event_details = array();
		
		// Array that contains a specific user and all its locations
		$specific_user_locations_arr = array();
		
		// Array that contains a number of arrays according to the number of usres in the event
		$all_users_locations_data_arr = array();
		
		// A bit to connect the last point of the previous batch to the new set of points
		$user_first_point = true;
		
		// Go through all active users and locations in the event
		for($data_array_index = 0; $data_array_index < $event_users_locations_arr_length; $data_array_index++)
		{
			// Get current user location object
			$event_users_locations_object = $event_users_locations_retrived_data_array[$data_array_index];
			
			// Check if the current location already been sent by checking the time stamp of the location
			if($event_users_locations_object['timestamp'] > $time_stamp)
			{
				// Check if the temp user name never been set
				if($temp_user_name == "")
				{
					// Set the temp user name as the current object user name
					$temp_user_name = $event_users_locations_object['user_name'];
				}
				
				if($user_first_point && $time_stamp != 0)
				{
					$result_object = connectPoints($event_id, $temp_user_name, $time_stamp);
					if(is_object($result_object))
					{
						array_push($specific_user_locations_arr, $result_object);
					}
					$user_first_point = false;
				}
				
				// Check if the temp user name is diffrent from the current user name in the current object
				if($temp_user_name == $event_users_locations_object['user_name'])
				{
					// Push the user location object into the array
					array_push($specific_user_locations_arr, $event_users_locations_object);
				}
				else
				{
					// A diffrent user name recognized - push the current array to the all users locations array
					array_push($all_users_locations_data_arr,$specific_user_locations_arr);
					
					// Set the temp user name as the new user name
					$temp_user_name = $event_users_locations_object['user_name'];
					
					// Change the user first point to false to connect to the new set of points
					$user_first_point = true;
					
					// Reset the specific user array
					$specific_user_locations_arr = array();
					
					if($user_first_point  && $time_stamp != 0)
					{
						$result_object = connectPoints($event_id, $temp_user_name, $time_stamp);
						if(is_object($result_object))
						{
							array_push($specific_user_locations_arr, $result_object);
						}
						$user_first_point = false;
					}
					
					// Push the current location object to the new formated array
					array_push($specific_user_locations_arr, $event_users_locations_object);
				}
			}
		}
		array_push($all_users_locations_data_arr,$specific_user_locations_arr);
		
		array_push($event_details,$all_users_locations_data_arr);
		array_push($event_details,$active_users_in_event_retrived_data_array);
			
		// Send to Mangar side to show on map
		echo json_encode($event_details);
	}
	else
	{
		echo json_encode('no participants yet');	
	}
}
?>