<?php

// This page handles the sending of images to the server from the user

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Origin: *');

$client = false;
if(isset($_POST['session_id']))
{
	$session_id=$_POST['session_id'];
	session_id($session_id);
	$client = true;
}
include 'head.php';
include 'data_operations.php';

if($client)
{
	// Read the event id from the session
	$event_id = read_from_session('event_id');

	// The picture taken by the client
	$picture = $_FILES['imageCamera'];
}
else
{
	// Read the event id
	$event_id = $_POST['eventID'];

	// The picture taken uploaded by the manager
	$picture = $_FILES['imageUpload'];
}


// Upload the image from the user to the server
if(!upload_file($event_id, $picture))
{
	// Notify the user about uploading failure
	echo json_encode("No connection");
}
else
{
	// Notify the user that the uploading was a success
	echo json_encode("Success");
}



?>