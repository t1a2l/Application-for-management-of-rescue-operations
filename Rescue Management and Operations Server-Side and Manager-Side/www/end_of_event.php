<?php

// This page is responsible for the event ending of the manager and the client

header('Access-Control-Allow-Origin: *');
header('Access-Control-Max-Age: 1728000');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers:  Content-Type, *');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=iso-8859-1');

// User event ending
$endEvent_client = false;

// Manager event ending
$endEvent_manager = false;

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

if(isset($_SESSION['session_user_id']) && $_SESSION['session_user_id'] == $user_id && isset($_POST['event_id']))
{
	// Get the event id
	$event_id = $_POST['event_id'];
		
	// Getting the permissions of the user
	$permissions_command_text = "SELECT permissions
								 FROM users
								 WHERE user_id = '$user_id'";

	// Initialize an array for the permissions column names
	$permissions_column_names_array = array("permissions");
									
	// Get the permissions from the database
	$permissions_retrived_data_array = retrive_sql_data($permissions_command_text, $permissions_column_names_array);

	// Get the length of the permissions retrived data array
	$permissions_arr_length = count($permissions_retrived_data_array);

	// If the permissions has been recived from the database
	if($permissions_arr_length == 1)
	{
		// Get the permissions object
		$permissions_object = $permissions_retrived_data_array[0];
		
		// Get the permissions of the user
		$permissions = $permissions_object['permissions'];
		
		if($permissions == 2)
		{
			// The user is a client
			$endEvent_client = true;
		}
		else if($permissions == 1)
		{
			// The user is a manager	
			$endEvent_manager = true;
		}
		else
		{
			// Unknowen user
			echo json_encode("Permissions error");
		}
	}

	// Client user
	if($endEvent_client)
	{
		// Set the user to have no event connected to him and set the event to past events participation
		$user_event_id_command_text =  "UPDATE users
										SET event_id = 0,
											past_events_id = IF(past_events_id IS NOT NULL, 
																CONCAT_WS(',', past_events_id,'$event_id'), '$event_id')
										WHERE user_id = '$user_id' AND event_id = '$event_id'";

		// Execute the command text
		$response_arr = execute_sql_command($user_event_id_command_text);
		
		if($response_arr[1])
		{
			echo json_encode("success");
		}
		else
		{
			echo json_encode("failed");
		}
	}

	// Manager user
	if($endEvent_manager)
	{	
		// Get the current date
		$date = date("Y-m-d H:i:s");
		
		// Set all the users to have no event connected to them and set their event to past events participation and set // an end time to the event
		$event_end_command_text = "UPDATE events
								   SET  e_time = '$date'
								   WHERE event_id = '$event_id'";
								   
		$users_event_end_command_text = "UPDATE users
										 SET  event_id = 0,
										      past_events_id = IF(past_events_id IS NOT NULL, 
																  CONCAT_WS(',', past_events_id,'$event_id'), '$event_id')
										 WHERE event_id = '$event_id'";
				
		// Execute the event end command text
		$response_arr = execute_sql_command($event_end_command_text);
		
		if($response_arr[1])
		{
			// Execute the event end for all users in event command text
			$response_arr1[1] = execute_sql_command($users_event_end_command_text);
			if($response_arr1[1])
			{
				echo json_encode('success');
			}
			else
			{
				echo json_encode('failed to end event for clients');
			}
			
		}
		else
		{
			echo json_encode('failed to end event');	
		}			
	}
}
?>