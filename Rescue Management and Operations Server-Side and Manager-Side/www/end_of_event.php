<?php

// This page is responsible for the event ending to the manager

include 'head.php';
include 'reconnect.php';
header('Access-Control-Allow-Origin: *');
date_default_timezone_set('Asia/Jerusalem');

$user_id = read_from_ses('user_id');

$event_id = read_from_ses('event_id');

if(isset($_POST['EndEventObject']))
{	
	// Set the time stamp object
	$end_event_object = $_POST['EndEventObject'];
	
	// Set the actuall time from last transmition;
	$confirm_end = $end_event_object['confirmEnd'];

	if(bit == true)
	{
		$date = date("Y-m-d H:i:s");
		
		$update_event_end_time_command_text = "UPDATE events 			
											   SET e_time = '$date'
											   WHERE event_id = '$event_id'";

		$response = execute_sql_command($update_event_end_time_command_text);
		if($response[1] != null)
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