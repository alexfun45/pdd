<?php
	include_once LIB."jwt.conf.php";
	include_once LIB.'BeforeValidException.php';
	include_once LIB.'ExpiredException.php';
	include_once LIB.'SignatureInvalidException.php';
	include_once LIB.'JWT.php';
	use \Firebase\JWT\JWT;
	global $confjwt;
	
	class tokenHandler{
		
		public static $code = 200;
		public static $info = '';
		public static $tokenData = array();
		public static $refreshToken = '';
		public static $jwt = false;

		public static function generate_string($strength = 10) {
			$input = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		    $input_length = strlen($input);
		    $random_string = '';
		    for($i = 0; $i < $strength; $i++) {
		        $random_character = $input[mt_rand(0, $input_length - 1)];
		        $random_string .= $random_character;
		    	}
    		return $random_string;
			}
		
		// validate refresh token
		public static function verifyRefreshToken($jwt, $refreshToken){
			return (substr($jwt, -6) == substr($refreshToken, -6));		
		}
		
		public static function setCode($code){
			self::$code = $code;		
		}
		
		public static function getRequestInfo(){
			if(self::$jwt!==false)
				self::$info->token = self::$jwt;
			self::$info->code = self::$code;
			return self::$info;		
		}
		
		public static function verify_token($token){
			//ini_set('display_errors', TRUE);
			global $confjwt;
			//$decoded = JWT::decode($token, $confjwt['key'], array('HS256'));
			//echo "decoded=".json_encode($decoded);
			try {
				$decoded = JWT::decode($token, $confjwt['key'], array('HS256'));
				self::$tokenData = $decoded;
				//echo "decoded=".json_encode($decoded);
				//if(isset($refreshToken)){
					if($decoded->exp<time() ){
						tokenHandler::$refreshToken = tokenHandler::refreshToken($decoded);
						if(!tokenHandler::$refreshToken){
							tokenHandler::setCode(50001);
							self::$info = array(
								"message" => "Токен просрочен и не может быть продлен",
								"data"=>$decoded->exp,
								"error"=>true,
								"code" => 50001
							);
							return false;					
						}
						 else{
						 	tokenHandler::setCode(500);
						 	return true;
						 	}			
						}
					if($decoded->exp>time())
						return true;
					else{
						tokenHandler::setCode(50001);
					  	self::$info = array(
							"message" => "Токен просрочен или неверен",
							"data"=>$decoded->exp,
							"current_time"=>time(),
							"error"=>true,
							"code" => 50001
		        		);
		        		return false;							
					}				
				//}
				
				return $decoded->data->id; 
				}
			 catch (Exception $e){
				//echo "error=".json_encode($e);
				 if($e->getMessage()=="Expired token"){
					list($header, $payload, $signature) = explode(".", $token);
    				$payload = json_decode(base64_decode($payload));
					$newjwt = tokenHandler::refreshToken($payload->data);		       
			      if($newjwt===false){ 
						self::$info = array(
							"message" => "токен не верен",
							"error" => $e->getMessage(),
							"code"=> 50003
						);
					tokenHandler::setCode(300);
			        return false;
			        }
			        else{
						tokenHandler::setCode(201);
			        	self::$refreshToken = $newjwt;
			        	return true;
			        	}
		         }
				 else{
				 	tokenHandler::setCode(50004);	
					 self::$info = array(
						"message" => "токен не верен",
						"error" => $e->getMessage(),
						"code"=> 50004
					);
					return false;
				 }
		   	 }	
		}
		
		public static function refreshToken($token){
			//if(isset($_COOKIE["refreshToken"])){
				//$refreshToken = $_COOKIE["refreshToken"];
				if($token->id){
					$jwt = tokenHandler::getJWT($token);
					return $jwt;
					}
				else								
					return false;		
			}
		
		// generate a new refresh token
		public static function setNewRefreshToken($jwt){
			//$userId = $userId + 10000;
			//$refreshToken = tokenHandler::generate_string() . $confjwt['refreshKey'] . substr($jwt, -6);
			return tokenHandler::generate_string() . $confjwt['refreshKey'];
			//setcookie("refreshToken", $refreshToken, time()+3600*24*7, '/', '', NULL, TRUE );		
		}
		
		public static function getJWT($user){
			global $confjwt;
			$user = (object) $user;
			$token = array(
		       "iat" => time(),
		       "exp"=>time()+(60*15),			// time of life token 15 minutes
		       "data" => array(
				   "login" => $user->login,
		           "name" => $user->name,
		           "surname" =>$user->surname,
		           "email" => $user->email,
		           "id" => $user->id
		       )
		    );
		    $jwt = JWT::encode($token, $confjwt['key']);
		    return $jwt;				
		}
		
	}
?>