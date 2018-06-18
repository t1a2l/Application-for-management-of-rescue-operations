<?php

// This page handles the sending of images to the server from the user or manager locally

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

if(isset($_SESSION['session_user_id']) && $_SESSION['session_user_id'] == $user_id)
{
	// Get event id
	$event_id = $_POST['eventID'];

	// Get uploaded image data
	$picture_data = $_POST['imageUpload'];
	
	// Get uploaded image name
	$picture_name = $_POST['imageUploadName'];
	
	// Set save directory
	$dir = "img/$event_id";

	// Save Image to database
	$result = file_put_contents("$dir/$picture_name", file_get_contents("data://".$picture_data));
	
	if(!$result)
	{
		echo json_encode("Upload image failure");
	}
	else
	{
		echo json_encode("Image uploaded successfully");
	}
}
?>