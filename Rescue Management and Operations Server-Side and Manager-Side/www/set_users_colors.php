<?php

// This page handels the setting of colors in the database

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

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

if(isset($_SESSION['session_user_id']) && $_SESSION['session_user_id'] == $user_id && isset($_POST['currentUsersColors']))
{	
	// Set the time stamp object
	$users_color_object = $_POST['currentUsersColors'];
	
	// Set the actuall time from last transmition
	$users_color_arr = $users_color_object['usersColors'];
	
	// Get the event id
	$event_id = $users_color_arr[0]['event_id'];
	
	// Go through the users color array
	for($i = 1; $i < count($users_color_arr); $i++)
	{
		// Get a user color
		$current_color = $users_color_arr[$i]['color'];
		
		// Get a user name
		$current_user_name = $users_color_arr[$i]['username'];
		
		// command text to update color to user in the database
		$update_color_command_text = "UPDATE users
									  SET color = '$current_color'
									  WHERE user_name = '$current_user_name'";
									  
		// Execute the command text
		$result_arr = execute_sql_command($update_color_command_text);
		
		// If adding a color to a user has failed
		if($result_arr[1] == false)
		{
			echo json_encode("adding color property to ".$current_user_name." failed");
			exit();
		}
	}
	
	// If all colors to users where updated
	echo json_encode("success");
}
?>