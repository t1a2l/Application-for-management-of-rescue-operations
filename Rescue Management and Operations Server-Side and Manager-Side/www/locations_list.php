<?php 
	// Get the locations list from the excel file to pinpoint the event location
	include 'head.php';
	include 'data_operations.php';
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: text/html; charset=utf-8');
	
	require '../apps/phpsysinfo3.2.7/vendor/autoload.php';
	
	use PhpOffice\PhpSpreadsheet\Spreadsheet;
	use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
	
	error_reporting(E_ALL);
	ini_set('display_errors','On');
	
	if(isset($_POST['targetFile']))
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
