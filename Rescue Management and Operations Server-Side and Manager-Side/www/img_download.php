<?php

// This page handles the sending images from the server to the user

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Origin: *');

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
	// Get the event id
	$event_id = $_POST['event_id'];

	// Get all images that belongs to the event into an array
	$image_arr = download_file($event_id);

	// send the array to the user
	echo json_encode($image_arr);
}
?>