<?php

// This page handels the reciving of the recent locations from the user and insert to the database 
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

// Get the location array from the client with the session id
$data = json_decode(file_get_contents("php://input"),true);

// Get the session from the array
$session_id = $data['session_id'];

// set the current session as the one to work with
session_id($session_id);

include 'head.php';
include 'data_operations.php';

// Read the event id from the current session
$ev = read_from_session('event_id');

// Phrase the event id for the database
$event_id= '__'.$ev;

// Read the user id from the current session
$us = read_from_session('user_id');

// Phrase the user id for the database
$user_id = '__'.$us;

// Get the username from the current session
$user_name = read_from_session('username');

// Initialize an array for the check signed user column names
$active_users_in_event_column_names_array = array("user_id");

// Insert all locations to the user table
$insert_locations_command_text = "INSERT INTO event$event_id$user_id (user_name,latitude,longitude,timestamp) VALUES ";		

// array that iclude all the recent locations from the user
$location_value_arr = array();

// connectio to the database
$sql_connection = connect_to_database();

foreach($data['data'] as $row)
{
	// Get the location and time without special charcaters
	$latitude = mysqli_real_escape_string($sql_connection,$row['lat']);
	$longitude = mysqli_real_escape_string($sql_connection,$row['lng']);
	$timestamp = mysqli_real_escape_string($sql_connection,$row['time']);
	
	// Show timestamp correctly
	$timestamp = strtotime($timestamp);
	$timestamp = date('Y/m/d H:i:s', $timestamp + 3 * 3600);
	
	// Insert the current location to the locations value array
	$location_value_arr[] .= "('$user_name', '$latitude', '$longitude', '$timestamp')";
}

// Add the location value array to the query for inserting in the database
$insert_locations_command_text .= implode(", ", $location_value_arr);

// Save what was trying to be inserted to the database
file_put_contents('text1.txt', var_export($insert_locations_command_text, TRUE));

// Execute the location insert to the database
$response_id_arr = $execute_sql_command($insert_locations_command_text);

// Check if the user locations table exist
if($response_id_arr[1])
{
	echo json_encode('recieved');
}
else
{
	echo json_encode('problems in recieving');
}
	

?>