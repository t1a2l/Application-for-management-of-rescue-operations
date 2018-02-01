<?php

// This page hanles the event joining of the different clients: 
// On the first joining - create a table for the client
// On rejoin - point the client to the correct table

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

if(isset($_POST['event_id']))
{
	// The event id from the client
	$ev = $_POST["event_id"];
	
	// The event id phrasing in the database
	$event_id = '__'.$ev;
	
	// Write the event id to the active session of the client
	write_to_session('event_id',$ev);
	
	// The user id from the session
	$us = read_from_session('session_user_id');
	
	// The user id phrasing in the database
	$user_id = '__'.$us;

	// Get user id from the event the user joined
	$user_id_command_text = "SELECT user_id
							 FROM event$event_id
							 WHERE user_id = '$us'";

	// Initialize an array for the user id column names
	$user_id_column_names_array = array("user_id");
									
	// user id retrived data array
	$user_id_retrived_data_array = retrive_sql_data($user_id_command_text, $user_id_column_names_array);

	// Get the length of the user id retrived data array
	$user_id_arr_length = count($user_id_retrived_data_array);

	// check if the user id is registered in the event
	if($user_id_arr_length == 0)
	{
		// insert the user id to the event table command
		$insert_user_id_command_text = "INSERT INTO event$event_id (`user_id`) 
										VALUES ($us)";
		// insert the user id execute
		$result = execute_sql_command($insert_user_id_command_text);
		
		if($result[1] == false)
		{
			echo json_encode("הוספת משתמש לאירוע נכשלה");
			exit();
		}
	}
	
	// Get id of user to check if the locations table is empty
	$id_command_text = "SELECT id
					    FROM event$event_id$user_id";
						
	// Check if the user locations table exist
	$response_id_arr = execute_sql_command($id_command_text);	
	
	// If the location table don't exist
	if($response_id_arr[1] == false)
	{
		$create_user_location_table_command_text = "CREATE TABLE `rmo_database`.`event$event_id$user_id`
												   ( `id` INT(30) NOT NULL AUTO_INCREMENT,
													 `user_name` VARCHAR(20) NOT NULL ,
													 `latitude` VARCHAR(50) NOT NULL ,
													 `longitude` VARCHAR(50) NOT NULL ,
													 `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
													 PRIMARY KEY (`id`)
												   ) ENGINE = MyISAM";
		
		// Check if the user locations table has been created succesfully
		$response_table_arr = execute_sql_command($create_user_location_table_command_text);
		
		
		// If unable to create table
		if($response_table_arr[1] == false)
		{
			echo json_encode("נכשל ביצירת טבלת משתמש אירוע חדשה");
		}
		// If table creation was succesfull
		else
		{
			echo json_encode("success הצטרפת לאירוע");
		}
	}
	// If table already exist
	else
	{
		echo json_encode("success אתה כבר חלק מהאירוע");
	}
}
else
{
	echo json_encode("אין מספר אירוע");
}
?>









