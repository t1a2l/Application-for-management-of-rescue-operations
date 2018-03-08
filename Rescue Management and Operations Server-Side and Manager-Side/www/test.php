<?php

header('Access-Control-Allow-Origin: *');

$hostname = "localhost";

// Server username
$dbuser = "root";

// Server password
$dbpass = "";

$db = "Food_Chains";

// Initialize the SQL connection instance 
$mysql_connection = mysqli_connect($hostname,$dbuser,$dbpass,$db);

if(!$mysql_connection)
{
	printf("Connection failed: ",mysqli_connect_error());
	exit();
}

if(isset($_POST['location']))
{
	$myPositionX = $_POST['latitude'];
	
	$myPositionY = $_POST['longitude'];
	
	
	$get_address_rami_levi = "select * 
							  from Rami_Levi";
	$get_address_mega = "select * 
						 from Mega";
	$get_address_shupersal = "select * 
							  from Shupersal";
	$get_address_coop = "select * 
						 from Coop";
	
	$address_rami_levi = mysqli_query($mysql_connection,$get_address_rami_levi);
	$address_mega = mysqli_query($mysql_connection,$get_address_mega);
	$address_shupersal = mysqli_query($mysql_connection,$get_address_shupersal);
	$address_coop = mysqli_query($mysql_connection,$get_address_coop);
	
	$dist_arr = array();
	
	if($address_rami_levi)
	{
		getDistance($dist_arr,$address_rami_levi);
	}
	if($address_mega)
	{
		getDistance($dist_arr,$address_mega);
	}
	if($address_shupersal)
	{
		getDistance($dist_arr,$address_shupersal);
	}
	if($address_coop)
	{
		getDistance($dist_arr,$address_coop);
	}
	
	usort($dist_arr, "cmp");
	echo json_encode($dist_arr);
	
}

function getDistance($arr,$sql)
{
	while($data_row = mysqli_fetch_array($sql, MYSQLI_ASSOC))
	{
		$address = $data_row["address"];
		
		$name = $data_row["branch"];
		
		$address = str_replace(" ", "+", $address);

		$url = "http://maps.google.com/maps/api/geocode/json?sensor=false&address=$address";
		 
		$response = file_get_contents($url);
		 
		$json = json_decode($response,TRUE); 
		 
		$branchX = $json['results'][0]['geometry']['location']['lat'];
		
		$branchY = $json['results'][0]['geometry']['location']['lng'];
		
		$tempX = $myPositionX - $branchX;
		
		$tempY = $myPositionY - $branchY;
		
		$distance = sqrt(pow(tempX, 2) + pow(tempY, 2));
		
		array_push($arr, $name, $distance);
	}

}

function cmp($a, $b)
{
    return strcmp($a->branch, $b->branch);
}










?>