<?php

// This page handels the sms sending to the users when new event is starting

include 'data_operations.php';
// Getting all the phone numbers and domians of the users that are participating in the event
$phone_data_command_text = "SELECT phone_number, phone_domain
							   FROM Users
							   WHERE permissions == 2";

// Initialize an array for the phone data column names
$phone_data_column_names_array = array("phone_number", "phone_domain");
								
// Set the phone data retrived data array
$phone_data_retrived_data_array = retrive_sql_data($phone_data_command_text, $phone_data_column_names_array);

// Get the length of the active phone data retrived data array
$phone_data_arr_length = count($phone_data_retrived_data_array);

if($phone_data_arr_length > 0)
{
		// Go through all object and get all phone numbers and phone domains from the users
		for($data_array_index = 0; $data_array_index < $phone_data_arr_length; $data_array_index++)
		{
			// Get the phone number and phone domain from the database
			$phone_data_object = $phone_data_retrived_data_array[data_array_index];
			if(!$send_to)
				$send_to = $phone_data_object['phone_number'] . "@" . $phone_data_object['phone_domain'];
			else
				$send_to .= ", " . $phone_data_object['phone_number'] . "@" . $phone_data_object['phone_domain'];
		}
		$from = a; // Need to set up an amazon domain - cost money
		$message = "New event available"; // Actuall message
		$headers = "From: $form\n"; // Message headers
		$subject = "Rescue Management Operations"; // Message subject
		$mail($send_to, $subject, $message, $headers); // Send an sms to the users
}		

?>
