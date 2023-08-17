<?php
	
	class User{
		var $dataIndex = array("password"=>0, "name"=>1, "surname"=>2, "lastname"=>3, "email"=>4, "login"=>5, "usertype"=>6);
		var $publicFields = array("name"=>1, "surname"=>2, "lastname"=>3, "email"=>4, "login"=>5, "usertype"=>6);	
		var $index = null;
		var $_salt = 'fewf123f';
		function __construct(){
			
		}
	
		public function isUserExists($login){
			if($this->isLoginExists($login))
				return true;
			if($this->isEmailExists($login))
				return true;
			return false;		
		}
		
		protected function getLoginIndex($login){
			$flogins = fopen(DB."logins.txt", "r");
			$i = 0;
			while($rlogin = trim(fgets($flogins))){
				if(strcmp($login,$rlogin)==0){
					$this->index = $i;
					fclose($flogins);
					return $i;
				}
				$i++;
			}
			fclose($flogins);
			return false;	
		}
		
		public function isLoginExists($login){
			if($this->getLoginIndex($login)!==false)
				return true;
			
			return false;						
		}
		
		public function isEmailExists($login){
			if($this->getEmailIndex($login)!==false)
				return true;
			
			return false;		
		}
		
		protected function getEmailIndex($email){
			$femails = fopen(DB."emails.txt", "r");
			$i = 0;
			while($rEmail = trim(fgets($femails))){
				if($email==$rEmail){
					$this->index = $i;
					fclose($femails);
					return $i;
				}
				$i++;
			}
			fclose($femails);
			return false;		
		}
		
		protected function getUserIndex($login){
			if($this->index!=null)
				return $this->index;
			$indx = $this->getLoginIndex($login);
			if($indx!==false)
				return $indx;
			$indx = $this->getEmailIndex($login);
			if($indx!==false)
				return $indx;
			return false;		
		}
		
		// works only after execution getUserIndex() or getUserData()
		public function getUserId(){
			return $this->index;		
		}
		
		public function getField($field){
			if($this->userdata!=null){
				return $this->userdata[$field];
				}		
		}
		
		public function getUserDataByIndex($indx){
			$fuserData = fopen(DB."userdata.txt", "r");
			$i = 0;
			while($dataline = trim(fgets($fuserData))){	
				if($i==$indx){
					$data = explode(";", $dataline);
					$this->userdata = $data;
					fclose($fuserData);
					return true;
					}		
				}
			fclose($fuserData);
			return false;
		}
		
		public function getUserData($login, $field = false){
			if($this->userdata!=null){
				if($field===false)
					return $this->userdata;
				else
					return $this->userdata[$field];			
				}
			$loginIndex	= $this->getUserIndex($login);
			$i = 0;
			$fuserData = fopen(DB."userdata.txt", "r");
			while($dataline = trim(fgets($fuserData))){	
				if($i==$loginIndex){
					$data = explode(";", $dataline);
					$this->userdata = $data;
					if($field===false)
						return $data;
					else if(array_key_exists($field, $this->dataIndex)){
						return $data[$this->dataIndex[$field]];					
					}
					else
						return false;
				}
				$i++;
			}
		}
		
		public function getUsers(){
			$fuserData = fopen(DB."userdata.txt", "r");
			$users = array();
			$i = 0;
			while($dataline = trim(fgets($fuserData))){
				if($dataline=="" || $dataline==null)
					break;
				$data = explode(";", $dataline);
				foreach($this->dataIndex as $key=>$val){
					$users[$i][$key] = $data[$val];				
				}
				$i++;
			}
			fclose($fuserData);
			return $users;		
		}
		
		protected function getConcat($arr){
			$array = [];
			foreach($arr as $row) $array[] = $row;
			return implode(";", $array);		
		}
		
		protected function save($data){
			$fuserData = fopen(DB."userdata.txt", "w");
			foreach($data as $line){
				//$cp = $line;
				$dataToWrite = $this->getConcat($line) . "\r\n";
				//echo $dataToWrite."\r\n";
				fputs($fuserData, $dataToWrite);
			}
			fclose($fuserData);	
		}
		
		public function addUser($user){
			$fLogins = fopen(DB."logins.txt", "a");
			$fuserData = fopen(DB."userdata.txt", "a");
			$hashPass = hash("sha256", $user->password . $this->_salt);
			$userRecord = $hashPass.";".$user->name.";".$user->surname.";".$user->lastname.";".$user->email.";".$user->login.";".$user->usertype.PHP_EOL;
			fputs($fLogins, $user->login.PHP_EOL);
			fputs($fuserData, $userRecord);
			fclose($fLogins);
			fclose($fuserData);		
		}
		
		public function removeUser($index){
			$logins = file(DB."logins.txt", FILE_IGNORE_NEW_LINES);
			$userdata = file(DB."userdata.txt", FILE_IGNORE_NEW_LINES);
			$fLogins = fopen(DB."logins.txt", "w");
			$fuserData = fopen(DB."userdata.txt", "w");
			for($i=0;$i<count($logins);$i++){
				if($i!=$index){
					fputs($fLogins, trim($logins[$i]).PHP_EOL);
					fputs($fuserData, trim($userdata[$i]).PHP_EOL);				
				}			
			}
			fclose($fLogins);
			fclose($fuserData);		
		}
				
		public function editUser($data){
			$users = $this->getUsers();
			$fuserData = fopen(DB."userdata.txt", "r");
			$data->password = $this->getUserData($data->login, "password");
			//$data->login = $this->getUserData($data->login, "login");
			$indx = $data->index;
			unset($data->index);
			$users[$indx] = $data;
			//$users[$indx]
			$this->save($users);
			//echo $data->password;
			//$data->password = $this->getUserData("password");
			$i = 0;
			return $users;
			/*while($dataline = trim(fgets($fuserData))){	
				if($i==($data->index)){	
				}
				$i = 0;
			}*/
			fclose($fuserData);		
		}
		
		public function verify_password($login, $password){
			$passw = $this->getUserData($login, "password");
			$hashPass = hash("sha256", $password . $this->_salt);
			//echo $hashPass;
			//$hashPass = md5($password . $this->_salt);
		   //echo $passw;
			//echo json_encode( mb_strtoupper( trim("admin465") ) == mb_strtoupper(trim($passw)));
			//echo json_encode(preg_match('/'.$hashPass.'/iu', $passw));
			if(preg_match('/'.$hashPass.'/iu', $passw)==true)
				return true;
			else
				return false;		
		}
	}
?>