<?php

// This page hanles the saving of token for devices in the database

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=iso-8859-1');

if(isset($_POST['session_id']))
{
	$session_id = $_POST['session_id'];
	session_id($session_id);
}
include 'head.php';
include 'data_operations.php';

if(isset($_POST['my_token']))
{
	// The token from the client device
	$token = $_POST["my_token"];
	
	// The user id from the session
	$user_id = read_from_session('session_user_id');
	
	$token_date = date('Y-m-d');
	
	// Update the device token to the current user in the database
	$token_command_text = "UPDATE users
						   SET device_token = '$token', token_create_date = '$token_date'
						   WHERE user_id = '$user_id'";
	
	// Check if the token has been inserted succesfully
	$response_token_arr = execute_sql_command($token_command_text);
			
	// If unable to update token
	if($response_token_arr[1] == false)
	{
		echo json_encode("נכשל בהוספת המכשיר");
		exit();
	}
	else
	{
		echo json_encode("Success");
	}
}
else
{
	echo json_encode("אין זיהוי מכשיר");
}
?>









