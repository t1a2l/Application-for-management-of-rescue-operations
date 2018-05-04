<?php

// This page handels the setting of colors in the database

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
include 'head.php';
include 'data_operations.php';

if(isset($_POST['currentUsersColors']))
{	
	// Set the time stamp object
	$users_color_object = $_POST['currentUsersColors'];
	
	// Set the actuall time from last transmition
	$users_color_arr = $users_color_object['usersColors'];
	
	$event_id = $users_color_arr[0]['event_id'];
	
	for($i = 1; $i < count($users_color_arr); $i++)
	{
		$current_color = $users_color_arr[$i]['color'];
		
		$current_user_name = $users_color_arr[$i]['username'];
		
		$update_color_command_text = "UPDATE users
									  SET color = '$current_color'
									  WHERE user_name = '$current_user_name'";
		// insert the user id execute
		$result = execute_sql_command($update_color_command_text);
		
		if($result[1] == false)
		{
			echo json_encode("adding color property to ".$current_user_name." failed");
			exit();
		}
	}
	echo json_encode("success");
}
?>