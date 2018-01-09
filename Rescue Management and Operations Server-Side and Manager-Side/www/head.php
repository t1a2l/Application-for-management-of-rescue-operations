<?php

// This page is responsible for managing the sessions

// If the current session was not started already
if(session_status() == PHP_SESSION_NONE) 
{
   // Start the current session
   session_start();
}

// Include this header
header('Access-Control-Allow-Origin: *');

// Set the error reporting function
error_reporting(0);

// Write the given ID to the current session
function write_to_session($session_type_id, $type_id)
{
	$_SESSION[$session_type_id] = $type_id;
}

// Read the given ID from the current session
function read_from_session($session_type_id)
{
	// If the current ID is set
	if(isset($_SESSION[$session_type_id]))
	{
		// Return the current ID
		return $_SESSION[$session_type_id];
	}
	// If the current ID is not set
	else
	{
		// Notify the user that this is not his session
		return false;
	}
}

?>



















