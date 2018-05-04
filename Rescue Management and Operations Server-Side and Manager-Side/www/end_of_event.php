<?php

// This page is responsible for the event ending of the manager and the client

include 'data_operations.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Max-Age: 1728000');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers:  Content-Type, *');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=iso-8859-1');
date_default_timezone_set('Asia/Jerusalem');

$endEvent_client = false; // Bit from manager
$endEvent_manager = false; // Bit from client

// If the user session ID is set
if(isset($_POST['session_id']))
{
	// Set the user session ID
	session_id($_POST['session_id']);
	
	$endEvent_client = true;
}
else if(isset($_POST['EndEventObject']))
{
	// Set the user session ID
	$endEvent_manager = true;
}
include 'head.php';

$user_id = read_from_session('session_user_id');

$event_id = read_from_session('event_id');

if($endEvent_client)
{
	// Set the user to have no event connected to it and set event to past events participation
	$user_event_id_command_text =  "UPDATE users
									SET event_id = 0,
										past_events_id = IF(past_events_id IS NOT NULL, 
															CONCAT_WS(',', past_events_id,'$event_id'), '$event_id')
									WHERE user_id = '$user_id' AND event_id = '$event_id'";

	// Execute the update user event id
	$response = execute_sql_command($user_event_id_command_text);
	if($response[1])
	{
		echo json_encode("success");
	}
	else
	{
		echo json_encode("failed");
	}
}

if($endEvent_manager)
{	
	// Set the time stamp object
	$end_event_object = $_POST['EndEventObject'];
	
	// Set the actuall time from last transmition;
	$confirm_end = $end_event_object['confirmEnd'];

	if($confirm_end)
	{
		$date = date("Y-m-d H:i:s");
		
		$event_end_command_text = "UPDATE users u, events e
								   SET  u.event_id = 0, 
										e.e_time = '$date',
										u.past_events_id = IF(u.past_events_id IS NOT NULL, 
															  CONCAT_WS(',', u.past_events_id,'$event_id'), '$event_id')
								   WHERE e.event_id = '$event_id' AND u.event_id = '$event_id'";
		
		$response = execute_sql_command($event_end_command_text);
		
		if($response)
		{
			echo json_encode('success');
		}
		else
		{
			echo json_encode('failed');	
		}			
	}
}

?>