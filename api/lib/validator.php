<?php
	class Validator{
		
		public static $test_actions = array("addVpnUser"=>array("vpnName", "newUser"));

		public static function check_length($value = "", $min, $max) {
		    $result = (mb_strlen($value) < $min || mb_strlen($value) > $max);
		    return !$result;
		}
				
		public static function clean($value = "") {
		    $value = trim($value);
		    $value = stripslashes($value);
		    $value = strip_tags($value);
		    $value = htmlspecialchars($value);
		    return $value;
		}

		public static function checkRequestData($reqData){
			if(in_array($reqData->action, Validator::$test_actions)){
				$data = $reqData->data;
				foreach(Validator::test_actions[$reqData->action] as $dataField){
					if($data[$dataField]=="" || $data[$dataField]==null)
						return false;
				}
			}
			return true;
		}
		
		public static function cleanAll($values){
			foreach ($values as $property => $argument) {
             $values->{$property} = Validator::clean($values->{$property});
           }		
		}
		
		public static function valid($values){
			foreach($values as $value){
				if(!Validator::check_length($value, 0, 50000))
					return false;			
			}	
			return true;	
		}
			
	}
?>