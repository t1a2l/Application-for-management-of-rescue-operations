<?php

// The client rejoin an event he is already part of

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=iso-8859-1');

if(isset($_POST['session_id'])) 
{
	$session_id = $_POST['session_id'];
	session_id($session_id);
}
else
{
	echo json_encode("failed");
}
include 'head.php';
include 'data_operations.php';

// Get user id from session
$user_id = read_from_session('session_user_id');

// Get the event id from the users table that match the current user
$event_id_command_text = "SELECT event_id
						  FROM users
						  WHERE user_id = '$user_id'";

// Initialize an array for the user id column names
$event_id_column_names_array = array("event_id");
								
// event id retrived data array
$event_id_array = retrive_sql_data($event_id_command_text, $event_id_column_names_array);

// event id array length
$event_id_arr_length = count($event_id_array);

// The event id from the event id array
$event_id = $event_id_array["event_id"];

// Check if the current user is part of an event
if($event_id != 0)
{
	$event_info_command_text = "SELECT * 
								FROM events
								WHERE event_id = '$event_id'";

	// Initialize an array for the events column names
	$event_info_array = array('event_id', 'event_name', 'description', 'place');
								
	// Set the events retrived data array
	$event_info_retrived_data_array = retrive_sql_data($event_info_command_text, $event_info_array);					
	
	// The event array length
	$event_info_arr_length = count($event_info_retrived_data_array);
	
	// If the event exists
	if($event_info_arr_length > 0)
	{
		$event_info_object = $event_info_retrived_data_array[0];
		echo json_encode($event_info_object);
	}
	else
	{
		echo json_encode("failed");
	}
}
else
{
	echo json_encode("failed");
}

?>