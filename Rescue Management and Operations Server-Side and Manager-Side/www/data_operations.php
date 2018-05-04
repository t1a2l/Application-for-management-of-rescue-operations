<?php

// This page has all the general functions used by the diffrent pages

// Connect to SQL server database
function connect_to_database()
{
	// Set the database server name
	$hostname = "localhost";
	// Server username
	$dbuser = "root";
	// Server password
	$dbpass = "";
	
	// Database name
	$database = "RMO_database";
	// Initialize the SQL connection instance 
	$mysql_connection = mysqli_connect($hostname,$dbuser,$dbpass,$database);
	
	// Returns the SQL connection instance
	return $mysql_connection;
	
}

// *** Returns an array that contains the required SQL data.              *** //
// *** Parameters: SQL command text string, SQL table column names array. *** //
function retrive_sql_data($command_text, $column_names_array)
{		
	// Connect to database
	$sql_connection = connect_to_database();
	
	// If connection to database succeeded
	if($sql_connection) 
	{
		mysqli_set_charset($sql_connection,"utf8");
		// Initialize the SQL command
		$sql_command = mysqli_query($sql_connection, $command_text);
		
		// If the SQL command succeed
		if($sql_command)
		{
			// Initialize a new array of objects for the SQL data
			$data_array = array();
			
			// Rows of data were retrived by the SQL command
			if(mysqli_num_rows($sql_command) > 0)
			{
				// Initialize the data array index to 0
				$data_array_index = 0;
				
				// As long as there are available rows of SQL data to read
				while($data_row = mysqli_fetch_array($sql_command, MYSQLI_ASSOC))
				{
					// Initialize a new array for the current object properties
					$current_object = array();
					
					// Set the column names array length
					$column_names_array_length = count($column_names_array);
					
					// Iterate through each property\column name of the current object\row
					for($properties_index = 0; $properties_index < $column_names_array_length; $properties_index++)
					{
						// Set the current property name\column name
						$column_name = $column_names_array[$properties_index];
						
						// Insert the current data field into the current property
						$current_object[$column_name] = $data_row[$column_name];
					}
					
					// Insert the current object into the data array
					$data_array[$data_array_index] = $current_object;
					// Increase the data array index by 1
					$data_array_index++;
				}
			}
			// Return the SQL data array 
			return $data_array;
		}
		else
		{
			return false;
		}
	}
}

// *** Executes an SQL command (Insert, Update or Delete). *** //
// *** Parameters: SQL command text.                       *** //
function execute_sql_command($sql_command_text)
{	
	// Connect to the database
	$sql_connection = connect_to_database();

	// If connection to database succeeded
	if($sql_connection) 
	{
		mysqli_set_charset($sql_connection,"utf8");
		// Set the SQL command
		$sql_command = mysqli_prepare($sql_connection, $sql_command_text);

		// Execute the SQL command and get and answer on success or failure
		$answer = mysqli_stmt_execute($sql_command);
		
		// Get id from command (event id on event creation)
		$id = mysqli_insert_id($sql_connection);
		
		// put the id and the answer in an array;
		$id_answer_arr = array();
		
		array_push($id_answer_arr, $id);
		
		array_push($id_answer_arr, $answer);
		
		return $id_answer_arr;
	}
}

// *** Upload a picture to the server returns true on success or false on failure *** //
// *** Parameters: the event id, the file to be uploaded *** //
function upload_file($event_id, $file)
{
		// Set the file target path
		$target_dir = "/wamp64/www/img/$event_id/";
		
		// Add the file name to the target path - basename takes the end of the path of the file, the actuall name
		$target_file = $target_dir . basename($file["name"]);
		
		// Get the file type (picture, exe, etc)
		$imageFileType = pathinfo($target_file,PATHINFO_EXTENSION);
		
		// Move the file to the target path
		$result = move_uploaded_file($file["tmp_name"], $target_file);
		
		// Return the uploading result
		return $result;
}

// *** Download a picture from the server to the client mobile device *** //
// *** Parameters: the event id *** //
function download_file($event_id)
{
		// Set the file target path
		$dir = "/wamp64/www/img/$event_id/";
		
		$image_arr = array();

		$images = glob($dir."*.jpg");
		
		foreach($images as $image) {
			array_push($image_arr, $image); 
		}
				
		// Return the uploading result
		return $image_arr;
}

// *** Connect the last point of the previous batch to the current set of points to connect the path *** //
// *** Parameters: the event id, the user name *** //
function connectPoints($event_id, $user_name, $time_stamp)
{
	// The query to get the last point of the previous batch
	$previous_batch_last_point_command_text = "SELECT *
											   FROM locations
											   WHERE event_id = '$event_id' AND
													 location_id = ( SELECT max(location_id)
																	 FROM locations
																	 WHERE user_name = '$user_name' AND
																		   event_id = '$event_id' AND 
																		   timestamp <= '$time_stamp' )";
					
	// Initialize an array for the  last point of the previous batch of all users column names
	$previous_batch_last_point_column_names_array = array("location_id", "user_id", "user_name", "event_id", "latitude", "longitude", "timestamp", "found_point");

	// Get the last point of the previous batch retrived data array
	$previous_batch_last_point_retrived_data_array = retrive_sql_data($previous_batch_last_point_command_text, $previous_batch_last_point_column_names_array);
	
	// The array length of the last point of the previous batch
	$previous_batch_last_point_arr_length = count($previous_batch_last_point_retrived_data_array);
	
	// If there is a last point return it
	if($previous_batch_last_point_arr_length > 0)
	{
		return $previous_batch_last_point_retrived_data_array[0];
	}
	else
	{
		return 0;
	}
}

// *** Check if a certain table exists in the database *** //
// *** Parameters: the table name *** //
function tableExist($table_name)
{
	// Command text
	$locations_table_check_command_text = "SHOW TABLES LIKE '$table_name'";
	
	// Initialize an array for the locations table column name
	$locations_table_check_command_text_column_names_array = array("Tables_in_rmo_database(".$table_name.")");

	// Get an array that has the table name in it if it exists
	$locations_table_check_retrived_data_array = retrive_sql_data($locations_table_check_command_text, $locations_table_check_command_text_column_names_array);
	
	// Return the array length, if it is greater then zero it means the table exists
	return count($locations_table_check_retrived_data_array);
}

?>