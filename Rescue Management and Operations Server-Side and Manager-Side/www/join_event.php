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
	$event_id = $_POST["event_id"];
	
	// Write the event id to the active session of the client
	write_to_session('event_id',$event_id);
	
	// The user id from the session
	$user_id = read_from_session('session_user_id');
	
	// Get The event id from the users table according to the user id
	$user_name_event_id_command_text = "SELECT event_id
										FROM users 
										WHERE user_id = '$user_id'";
	
	// Initialize an array for the event id column names
	$user_event_id_column_names_array = array("event_id");
									
	// The event id retrived data array
	$user_event_id_retrived_data_array = retrive_sql_data($user_event_id_command_text, $user_event_id_column_names_array);

	// Get the length of the event id retrived data array
	$user_event_id_arr_length = count($user_event_id_retrived_data_array);	
	
	// Set the table name
	$table_name = "locations";
	
	// Check if the table exist already in the database
	$locations_table_check_arr_length = tableExist($table_name);
		
	// If the locations table don't exist
	if($locations_table_check_arr_length == 0)
	{
		$create_locations_table_command_text = "CREATE TABLE `rmo_database`.`locations`
												   ( `location_id` INT(30) NOT NULL AUTO_INCREMENT,
													 `user_id` VARCHAR(30) NOT NULL ,
													 `user_name` VARCHAR(30) NOT NULL ,
													 `event_id` INT(30) NOT NULL ,
													 `latitude` VARCHAR(50) NOT NULL ,
													 `longitude` VARCHAR(50) NOT NULL ,
													 `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
													 `found_point` tinyint(1) NOT NULL ,
													 PRIMARY KEY (`location_id`)
												   ) ENGINE = MyISAM";
		
		// Check if the user locations table has been created succesfully
		$response_table_arr = execute_sql_command($create_locations_table_command_text);
		
		
		// If unable to create table
		if($response_table_arr[1] == false)
		{
			echo json_encode("נכשל ביצירת טבלת המיקומים");
			exit();
		}
	}
	
	if($user_event_id_arr_length > 0)
	{
		echo json_encode("success אתה כבר חלק מהאירוע");
	}
	else
	{
		// Update the users table with the event id
		$insert_event_id_command_text = "UPDATE Users
									     SET event_id = '$event_id'
									     WHERE user_id = '$user_id'";
		// Execute the query
		$result = execute_sql_command($insert_event_id_command_text);
		
		// Check if the query succesfully updated the table
		if($result[1] == false)
		{
			echo json_encode("הוספת משתמש לאירוע נכשלה");
			exit();
		}
		else
		{
			echo json_encode("success הצטרפת לאירוע");
		}
	}
}
else
{
	echo json_encode("אין מספר אירוע");
}
?>









