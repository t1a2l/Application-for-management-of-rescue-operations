<?php 

	// Get the locations list from the excel file to pinpoint the event location
	
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

require '../apps/phpsysinfo3.2.5/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;

error_reporting(E_ALL);
ini_set('display_errors','On');

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

if(isset($_SESSION['session_user_id']) && $_SESSION['session_user_id'] == $user_id && isset($_POST['targetFile']))
{
	$excel = $_POST['targetFile'];
	$reader = new Xlsx();
	$spreadsheet = $reader->load($excel);

	$CityArr = array();
	$j = 0;
	
	for($i = 2; $i < 1262; $i++)
	{
		$CityRow = array();
		$cellValue = $spreadsheet->getActiveSheet()->getCellByColumnAndRow(1, $i)->getValue();
		if(!$cellValue)
				break;
		$CityRow['id'] = $j;
		$CityRow['text'] = $cellValue;
		
		array_push($CityArr,$CityRow);
		$j++;
	}
	echo json_encode($CityArr);
}
	
?>
