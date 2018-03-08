<?php

// The client rejoin an event he is part of already

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

$user_id = read_from_session('session_user_id');

// Get user id from the event the user joined
$event_id_command_text = "SELECT event_id
						 FROM events";

// Initialize an array for the user id column names
$event_id_column_names_array = array("event_id");
								
// event id retrived data array
$event_id_array = retrive_sql_data($event_id_command_text, $event_id_column_names_array);

// event id array length
$event_id_arr_length = count($event_id_array);

// If a table of the current user has been found
$found = false;

for($index = 0; $index < $event_id_arr_length; $index++)
{
	// The event id from the event id array
	$event_id = $event_id_array[$index]["event_id"];
	
	// Phrase the table name for the database
	$table_name = 'event__'.$event_id.'__'.$user_id;
	
	// Initialize an array for the existing table name check
	$active_event_id_column_names_array = array("table_name");
	
	// Query for the table with the current event id and user id existing check
	$active_event_id_command_text = "SELECT table_name 
									 FROM information_schema.tables, events 
									 WHERE table_schema='rmo_database' 
										   AND TABLE_NAME like '$table_name'
										   AND events.e_time IS NULL
										   AND events.event_id = '$event_id'";
	
	// Check if the a table with the current event id and user id exist
	$active_table_name_retrived_data_array = retrive_sql_data($active_event_id_command_text, $active_event_id_column_names_array);							
	
	// Check if the table exist by size of the array
	$active_table_name_arr_length = count($active_table_name_retrived_data_array);
	
	// If table exist in database set found to true and return the event id
	if($active_table_name_arr_length == 1)
	{
		$found = true;
		
		$event_info_command_text = "SELECT * 
									FROM events
									WHERE event_id='$event_id'";

		// Initialize an array for the events column names
		$event_info_array = array('event_id', 'event_name', 'description', 'place');
									
		// Set the events retrived data array
		$event_info_retrived_data_array = retrive_sql_data($event_info_command_text, $event_info_array);							
		
		// Check if the table exist by size of the array
		$event_info_arr_length = count($event_info_retrived_data_array);
		
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
}
// If no table found that match to the current user id
if($found == false)
{
	echo json_encode("failed");
}


    

?>