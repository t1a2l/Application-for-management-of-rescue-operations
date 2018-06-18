<?php

if(isset($_POST['event_id']))
{
		$event_id = $_POST['event_id']
	
		// Creating a table of all user ids related to the event that was created query		
		$delete_event_table = "DELETE
							   FROM events E
							   WHERE E.event_id = '$event_id'";

		// Query execution
		$response = execute_sql_command($delete_event_table);

		// Return result of event delete
		echo json_encode($response[1]);
}

?>