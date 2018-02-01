<?php

// This page is responsible for the event ending to the manager and the client

include 'data_operations.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Max-Age: 1728000');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers:  Content-Type, *');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=iso-8859-1');
date_default_timezone_set('Asia/Jerusalem');

$endEvent_client = false; // Bit form manager
$endEvent_manager = false; // Bit from client

// If the user session ID is set
if(isset($_POST['session_id']))
{
	// Set the user session ID
	session_id($_POST['session_id']);
	
	endEvent_client = true;
}
else if(isset($_POST['EndEventObject']))
{
	// Set the user session ID
	$endEvent_manager = true;
}
include 'head.php';

$user_id = read_from_session('session_user_id');

$event_id = read_from_session('event_id');

if(endEvent_client)
{
	
}

if(endEvent_manager)
{	
	// Set the time stamp object
	$end_event_object = $_POST['EndEventObject'];
	
	// Set the actuall time from last transmition;
	$confirm_end = $end_event_object['confirmEnd'];

	if( == true)
	{
		$date = date("Y-m-d H:i:s");
		
		$update_event_end_time_command_text = "UPDATE events 			
											   SET e_time = '$date'
											   WHERE event_id = '$event_id'";

		$response = execute_sql_command($update_event_end_time_command_text);
		if($response[1])
		{
			echo json_encode('success');
		}
		else
		{
			echo json_encode('error ending event');	
		}			
	}
}

?>