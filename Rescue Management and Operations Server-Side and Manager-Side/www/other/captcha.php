<?php

// This page handles the captcha verfication

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
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
	//Getting all the events
	$captcha_command_text = "SELECT value
							FROM captcha
							WHERE Id = 1";

	// Initialize an array for the events column names
	$captcha_names_array = array('value');
									
	// Set the events retrived data array
	$captcha_retrived_data_array = retrive_sql_data($captcha_command_text, $captcha_names_array);

	if(!$captcha_retrived_data_array)
	{
		// Notify the user about no connection to database
		echo json_encode('אין חיבור לבסיס הנתונים');
		// Exit the operation ...
		exit();
	}
	
	// Get the number of the events retrived data array
	$captcha_arr_length = count($captcha_retrived_data_array);

	// check that the number of events is greater then zero
	if($captcha_arr_length > 0)
	{
		$captcha_object = $captcha_retrived_data_array[0];
		
		$value = $captcha_object['value'];
		
		// Send the array of events to the clients to show all events
		echo json_encode($value);
	}
}
else
{
		echo json_encode("failed");
}
?>