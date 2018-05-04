<?php

// This page hanles the sending of events to choose from to the client
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Content-Type: application/json; charset=iso-8859-1');

if(isset($_POST['session_id']))
{
	$session_id=$_POST['session_id'];
	session_id($session_id);
}
include 'head.php';
include 'data_operations.php';

$user_id = read_from_session('session_user_id');
//$user_id = 7;

if(isset($_SESSION['session_user_id']) && $_SESSION['session_user_id'] == $user_id)
{
	//Getting all the events
	$events_command_text = "SELECT *
							FROM events
							WHERE e_time IS NULL";

	// Initialize an array for the events column names
	$events_names_array = array('event_id', 'event_name', 'description', 'place');
									
	// Set the events retrived data array
	$events_retrived_data_array = retrive_sql_data($events_command_text, $events_names_array);

	if(!$events_retrived_data_array)
	{
		// Notify the user about no connection to database
		echo json_encode('אין חיבור לבסיס הנתונים');
		// Exit the operation ...
		exit();
	}
	
	// Get the number of the events retrived data array
	$events_arr_length = count($events_retrived_data_array);

	// check that the number of events is greater then zero
	if($events_arr_length > 0)
	{
		// Array that contains a number of array according to the number of events
		$all_events_data_arr = array();
				
		// Go through all objects and get all events
		for($data_array_index = 0; $data_array_index < $events_arr_length; $data_array_index++)
		{
			// Get the current event object from the array
			$events_object = $events_retrived_data_array[$data_array_index];
		
			// Push the event object to an events array
			array_push($all_events_data_arr, $events_object);
		}
		
		// Send the array of events to the clients to show all events
		echo json_encode($all_events_data_arr);
	}
	else
	{
		echo json_encode("אין אירועים");
	}
}
else
{
	echo json_encode("המשתמש לא מזוהה");
}
?>