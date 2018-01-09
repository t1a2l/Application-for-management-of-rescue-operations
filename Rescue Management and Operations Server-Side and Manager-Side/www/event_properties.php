<?php

// Get the event properties from the database and send them to the manager 

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=iso-8859-1');
include 'head.php';
include 'data_operations.php';

$user_id = read_from_session('session_user_id');

if(isset($_POST['EventProperties']))
{
	$event_properties = $_POST['EventProperties'];

	// Getting the properties of the active event
	$event_properties_command_text = "SELECT event_id, event_name ,s_time
									  FROM events
									  WHERE e_time IS NULL AND manager_id = '$user_id'";

	// Initialize an array for the check signed user column names
	$event_properties_column_names_array = array("event_id", "event_name", "s_time");
									
	// Get the event properties information from the database
	$event_properties_retrived_data_array = retrive_sql_data($event_properties_command_text, $event_properties_column_names_array);

	// Get the length of the event properties retrived data array
	$event_properties_arr_length = count($event_properties_retrived_data_array);
	
	if($event_properties_arr_length == 1)
	{
		// Set the signed user object that was found in the retrived data array
		$event_properties_object = $event_properties_retrived_data_array[0];
		
		$event_properties_arr = array();
		
		array_push($event_properties_arr, $event_properties_object);
	
		echo json_encode($event_properties_arr);
		
	}
	else if($event_properties_arr_length > 1)
	{
		echo json_encode($event_properties_retrived_data_array);
	}
	else
	{
		echo json_encode("Failed");
	}
}	
		

//}
?>

