<?php

// This page handles the logout from the system on both sides

header('Access-Control-Allow-Origin: *');
header('Access-Control-Max-Age: 1728000');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers:  Content-Type, *');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=iso-8859-1');

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

if(isset($_SESSION['session_user_id']) && $_SESSION['session_user_id'] == $user_id)
{
	// Regenerate the current session ID
	session_regenerate_id(TRUE);
	
	// Unset the current session
	session_unset();
	
	// Destroy the current session
	session_destroy();

	// Set the update user connection status command text
	$update_user_connection_status_command_text = "UPDATE users
												   SET IsConnected = 0
												   WHERE user_id = '$user_id'";
												   
	// Execute the update user connection status SQL command
	$response_arr = execute_sql_command($update_user_connection_status_command_text);

	if($response_arr[1])
	{
		// Send response for the user logut operation
		echo json_encode("Success"); 
	}
	else
	{
		echo json_encode("Failed"); 
	}
}
?>