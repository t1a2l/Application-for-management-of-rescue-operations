<?php

// This page handels the push notification sending to the users when a new event is starting

include 'data_operations.php';

define('SERVER_API_KEY', 'AIzaSyCgNGL67SfCkE9zsWZF0f4mSTxmKz4K13I');

// Getting all the phone numbers and domians of the users that are participating in the event
$device_token_command_text = "SELECT device_token
						      FROM Users
							  WHERE device_token != NULL";


// Initialize an array for the phone data column names
$device_token_column_names_array = array("device_token");
								
// Set the phone data retrived data array
$device_token_retrived_data_array = retrive_sql_data($device_token_command_text, $device_token_column_names_array);

// Get the length of the active phone data retrived data array
$device_token_arr_length = count($device_token_retrived_data_array);

// Array to send sms to clients
$send_to = array();

if($device_token_arr_length > 0)
{
	// Go through all object and get all device token of all the users
	for($data_array_index = 0; $data_array_index < $device_token_arr_length; $data_array_index++)
	{
		// Get the device token from the database
		$device_token_object = $device_token_retrived_data_array[$data_array_index];
		
		// Get the actuall token of the users device
		$token = $device_token_object['device_token'];
		
		// Add the token to the tokens array
		array_push($send_to, $token);
	}
	// Message header
	$header = [
		'Autorization: Key=' . SERVER_API_KEY,
		'Content-Type: Application/Json'
	];
	
	// The actuall message
	$message = [
		'title' => 'Rescue Management Operations', // Message title
		'body' => 'A new event is available', // Actuall message
	];
	
	$payload = [
		'registeration_ids' => $send_to,
		'data'				=> $message
	];

	$curl = curl_init();

	curl_setopt_array($curl, array(
	  CURLOPT_URL => "https://fcm.googleapis.com/fcm/send",
	  CURLOPT_RETURNTRANSFER => true,
	  CURLOPT_CUSTOMREQUEST => "POST",
	  CURLOPT_POSTFIELDS => json_encode($payload),
	  CURLOPT_HTTPHEADER => $header
	));

	$response = curl_exec($curl);
	$err = curl_error($curl);

	curl_close($curl);

	if ($err) {
	  echo "cURL Error #:" . $err;
	} else {
	  echo $response;
	}
}

?>
