<?php

// This page control the connection to the system, permissions, etc

// *** Include files and headers *** //
include 'head.php';
include 'data_operations.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Max-Age: 1728000');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers:  Content-Type, *');
header('Access-Control-Allow-Credentials: true');
//header('Content-Type: application/json; charset=iso-8859-1');
//header('Content-Type: application/x-www-form-urlencoded; charset=utf-8');

// Check if the user login details object is set ...
if(isset($_POST['userLoginDetails']))
{
	// Set the user login details object properties ...
	$user_login_details = $_POST['userLoginDetails'];

	// Set the typed EMail parameter ...
	$user_name = $user_login_details['username'];
	// Set the typed password parameter ...
	$password = $user_login_details['password'];

	$entrance_type = $user_login_details['source'];
	
	$response = $user_login_details["recaptcha"];

	// Check that all the required fields are not empty ...
	foreach(array($user_name, $password) as $user_login_details_property)
	{
		// If one or more of the required fields is empty ...
		if(empty($user_login_details_property))
		{
			// Notify the user about one or more empty required fields ...
			echo json_encode('אנא מלא את כל השדות');
			// Exit the operation ...
			exit();
		}
	}

	// Set the check signed user command text
	$check_signed_user_command_text = "SELECT U.user_id, U.permissions
									   FROM users U
									   WHERE U.user_name = '$user_name' AND U.password = '$password'";

	// Initialize an array for the check signed user column names
	$check_signed_user_column_names_array = array("user_id", "permissions");

	// Set the check signed user retrived data array
	$check_signed_user_retrived_data_array = retrive_sql_data($check_signed_user_command_text, $check_signed_user_column_names_array);
	
	if(!$check_signed_user_retrived_data_array)
	{
		// Notify the user about no connection to database
		echo json_encode('אין חיבור לבסיס הנתונים');
		// Exit the operation ...
		exit();
	}

	// Get the length of the check signed user retrived data array
	$check_signed_user_arr_length = count($check_signed_user_retrived_data_array);

	// If the user login details exist on database
	if($check_signed_user_arr_length > 0)
	{
		// Set the signed user object that was found in the retrived data array
		$signed_user_object = $check_signed_user_retrived_data_array[0];

		// Set the signed user ID for the login operation
		$user_id = $signed_user_object['user_id'];

		// Write the current user id to the current session ...
		if(($signed_user_object["permissions"] == 1 && $entrance_type == 1) ||  ($signed_user_object["permissions"] == 2 && $entrance_type == 2))
		{
			// Set the update user connection status command text ...
			$update_user_connection_status_command_text = "UPDATE users
														   SET IsConnected = 1
														   WHERE user_id = '$user_id'";

			// Execute the update user connection status SQL command ...
			$response_arr = execute_sql_command($update_user_connection_status_command_text);

			// If updated successfully
			if($response_arr[1])
			{
				if($signed_user_object["permissions"] == 1 && $entrance_type == 1)
				{
					$secret = get_captcha($signed_user_object["permissions"]);
					if($secret == "Failed")
					{
						echo json_encode("Error verifing user");
						exit();
					}
					$post = http_build_query(
						array (
							'response' => $response,
							'secret' => $secret
						)
					);
					$opts = array('http' => 
						array (
							'method' => 'POST',
							'header' => 'application/x-www-form-urlencoded',
							'content' => $post
						)
					);
					$context = stream_context_create($opts);
					$serverResponse = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);

					$captcha_success = json_decode($serverResponse);

					if ($captcha_success->success == false) 
					{
						// This user was not verified by recaptcha
						echo json_encode('User not verified');
					}
					else if ($captcha_success->success == true) 
					{
						// This user is verified by recaptcha
						write_to_session('session_user_id', $user_id);
						echo json_encode("success" . session_id());	
					}
				}
				else if($signed_user_object["permissions"] == 2 && $entrance_type == 2)
				{
					write_to_session('session_user_id', $user_id);
					echo json_encode("success" . session_id());	
				}
				else
				{
					echo json_encode("ההרשאות אינן תואמות");
				}
			}
			else
			{
				echo json_encode('בעיה בעדכון חיבור למערכת');	
			}
		}
		else
		{
			echo json_encode("ההרשאות אינן תואמות");
			exit();
		}
		
	}
	// If the user login details do not exist on database or one or more of the typed details is incorrect ...
	else
	{
		// Notify the user about operation failed ...
		echo json_encode("משתמש לא קיים במערכת");
	}
}
else
{
	echo json_encode("תקלה בהתחברות");
}
?>



