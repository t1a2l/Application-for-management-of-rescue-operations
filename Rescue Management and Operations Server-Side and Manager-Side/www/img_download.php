<?php

// This page handles the sending images from the server to the user

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
}
else
{
	$event_id = $_POST['eventID'];
}


// Get all images that belongs to the event into an array
$image_arr = download_file($event_id);

// send the array to the user
echo json_encode($image_arr);


?>