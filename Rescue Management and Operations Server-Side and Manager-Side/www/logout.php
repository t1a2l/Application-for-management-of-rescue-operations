<?php

// This page handles the logout from the system on both sides

include 'data_operations.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Max-Age: 1728000');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers:  Content-Type, *');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=iso-8859-1');

$logout_client = false; // Bit form manager
$logout_manager = false; // Bit from client

// If the user session ID is set
if(isset($_POST['session_id']))
{
	// Set the user session ID
	session_id($_POST['session_id']);
	
	$logout_client = true;
}
else if(isset($_POST['logout']))
{
	// Set the user session ID
	$logout_manager = $_POST['logout'];
}

include 'head.php';

if($logout_client || $logout_manager)
{
	// Get the session user id
	$user_id = read_from_session('session_user_id');

	// Regenerate the current session ID
	session_regenerate_id(TRUE);
	
	// Unset the current session
	session_unset();
	
	// Destroy the current session
	session_destroy();

	// Set the update user connection status command text
	$update_user_connection_status_command_text = "UPDATE Users
												   SET IsConnected = 0
												   WHERE user_id = '$user_id'";
												   
	// Execute the update user connection status SQL command
	$response = execute_sql_command($update_user_connection_status_command_text);

	if($response[1])
	{
		// Send response for the user logut operation
		echo json_encode("Success"); 
	}
}

?>