<?php
    //ini_set('display_errors', TRUE);
    require_once("../init.php");
    include_once LIB."tokenHandler.php";

    $IMAGE_PATH = __DIR__ . '/img/';
    $PAGE_DIR = __DIR__ . 'pages/';
    const PAGE_NUM = 30;

    class Application{

        var $PAGE_DIR = __DIR__ . 'pages/';
        var $data = array();

        private function getTokenFromHeaders(){
			$headers = getallheaders();
			return $headers["X-Token"];		
		}

        private function verify_token(){
			if(($this->action=="login" || $this->action=="refreshToken"))
				return true;
			$token = $this->getTokenFromHeaders();
			if($id = tokenHandler::verify_token($token)){
                $this->userId = $id;
				return true;
            }
			else
				return false;		
		}		

        public function __construct(){
            session_start();
            $reqBody = file_get_contents("php://input");
            $reqData = (!empty($reqBody)) ? json_decode($reqBody): (object) $_REQUEST;
            $this->action = $reqData->action;
            $this->data = $reqData->data;
            //$this->db = new SQLite3(DB."db.sqlite");
        }

        protected function getRole(){
            $db = new SQLite3(DB."db.sqlite");
            //return tokenHandler::$tokenData;
            if($this->verify_token()){
                $sql = "SELECT role FROM users WHERE id=:id";
                $userId = tokenHandler::$tokenData->data->id;
                $stmt = $db->prepare($sql);
                $stmt->bindParam(':id', $userId);
                $result = $stmt->execute();
                
                if($result!=false && $result!=null){
                    $user = $result->fetchArray(SQLITE3_ASSOC);
                    $db->close();
                    return $user['role'];
                }
                else
                    return false;    
            }
            else
               return false;        
        }

        protected function signIn(){
            //ini_set('display_errors', TRUE);
            if(isset($this->data->login) && isset($this->data->password) && strlen($this->data->login)<128 && strlen($this->data->password)<128){
                $db = new SQLite3(DB."db.sqlite");
                $password = md5($this->data->password);
                $sql = "SELECT id, login, role, name, email, confirmed FROM users WHERE login=:login AND password=:password";
                $stmt = $db->prepare($sql);
                $stmt->bindParam(':login', $this->data->login);
                $stmt->bindParam(':password', $password);
                $result = $stmt->execute();
                
                if($result!=false && $result!=null){
                    $user = $result->fetchArray(SQLITE3_ASSOC);
                    $auth_date = time();
                    $db->exec("UPDATE users SET last_auth={$auth_date} WHERE id={$user['id']}");
                    $stmt->close();
                    $jwt = tokenHandler::getJWT($user);
				    $refreshToken = tokenHandler::setNewRefreshToken($jwt);
                    return array("accessToken"=>$jwt, "id"=>$user['id']);
                }
                else
                    return false;
            }
            else
                return false;
        }

        public function google_auth(){
            //ini_set('display_errors', TRUE);
            if(isset($this->data->gtoken) && isset($this->data->user)){
                $db = new SQLite3(DB."db.sqlite");
                $email = $this->data->user->emailAddress;
                $name = $this->data->user->displayName;
                $result = $db->query("SELECT * FROM users WHERE email='$email'");
                $res = $result->fetchArray(SQLITE3_ASSOC);
                if($res!=false && $res!=null){
                    $jwt = tokenHandler::getJWT($res);
                    return array("accessToken"=>$jwt, "id"=>$res['id']);
                }
                $reg_date = time();
                $db->exec("INSERT INTO users(login, name, password, email, role, token, confirmed, reg_date) VALUES('$email', '$name', '', '$email', '3', '', 1, {$reg_date})");
                $userId = $db->lastInsertRowID();
                $user['login'] = $email;
                $user['name'] = $name;
                $user['surname'] = '';
                $user['email'] = $email;
                $user['id'] = $userId;
                $jwt = tokenHandler::getJWT($user);
                $db->close();
                return array("accessToken"=>$jwt, "id"=>$userId);
            }
        }

        public function log(){
            $db = new SQLite3(DB."db.sqlite");
            if($_COOKIE['userid'] && ($this->action=="getSettings" || $this->action=="getPage")){
                $current_time = time();
                $db->exec("UPDATE users SET action_time='{$current_time}' WHERE id={$_COOKIE['userid']}");
                $db->close();
            }
        }

        public function run(){
            if($this->action!='signup')
                $this->verify_token();
            $newToken = tokenHandler::$refreshToken;
            $tokenError = tokenHandler::$code;
            $result = call_user_method($this->action, $this);
            echo json_encode(array("data"=>$result, "code"=>$tokenError, "info"=>tokenHandler::$info, "newToken"=>$newToken));
        }

        protected function getPage(){
            $db = new SQLite3(DB."db.sqlite");
            $id = $this->data->page_id;
            $res = $db->query("SELECT title, private from pages WHERE name='$id'");
            $page = $res->fetchArray(SQLITE3_ASSOC);
            $page_filename = PAGES . $id . ".html";
            $db->close();
            return array("private"=>$page["private"], "title"=>$page["title"], "content"=>file_get_contents($page_filename));
        }

        protected function getFooter(){
            return file_get_contents(PAGES . "footer.html");
        }

        protected function saveFooter(){
            $files = $_FILES;
            foreach($files as $file){
                $uploadFile = array("file"=>$file);
                $this->uploadFile($uploadFile);
            }
            $pageContent = $_POST['content'];
            file_put_contents(PAGES."footer.html", $pageContent);
            echo PAGES."footer.html";
        }   

        protected function editPage(){
            $page_name = $_POST['page'];
            $page_filename = PAGES . $page_name . ".html";
            $files = $_FILES;
            foreach($files as $file){
                $uploadFile = array("file"=>$file);
                $this->uploadFile($uploadFile);
            }
            file_put_contents($page_filename, $_POST['content']);
        }

        protected function privatePage(){
            $db = new SQLite3(DB."db.sqlite");
            $page_id = $this->data->page_id;
            $private_status = $this->data->private_status;
            $db->exec("UPDATE pages SET private=$private_status WHERE id=$page_id");
            $db->close();
        }

        protected function removePage(){
            $page_id = $this->data->page_id;
            $page_name = $this->data->page_name;
            $page_filename = PAGES . $page_name . ".html";
            unlink($page_filename);
            $db = new SQLite3(DB."db.sqlite");
            $db->exec("DELETE FROM pages WHERE id=$page_id");
        }

        protected function removeMenu(){
            $menu_id = $this->data->menu_id;
            $db = new SQLite3(DB."db.sqlite");
            $db->exec("DELETE FROM menus WHERE id=$menu_id");
        }
        
    protected function getTickets(){
        $db = new SQLite3(DB."db.sqlite");
        //$recommended = $this->data->recommended;
        $withStat = (isset($this->data->withStat))?true:false;
        //if(!$recommended)
            $sql = "SELECT * FROM tickets";
        //else
            //$sql = "SELECT t1.*, COUNT(t2.*) as num FROM tickets as t1 LEFT JOIN statistic ON t1.id=t2.ticket_id";
        $res = $db->query($sql);
        $tickets = array();
        while ($v = $res->fetchArray(SQLITE3_ASSOC)){
            array_push($tickets, $v);
        }
        $db->close();
        if($this->data->shuffle==1)
            shuffle($tickets);
        return $tickets;
    }

    protected function getSubjects(){
        $db = new SQLite3(DB."db.sqlite");
        $sql = "SELECT t1.id, t1.name, AVG(t2.estimate) as estimate FROM subjects as t1 LEFT JOIN estimatesSubjects as t2 ON t1.id=t2.subject_id GROUP BY t1.id";
        $res = $db->query($sql);
        $subjects = array();
        while ($v = $res->fetchArray(SQLITE3_ASSOC)){
            $v['estimate'] = round($v['estimate'], 2);
            array_push($subjects, $v);
        }
        $db->close();
        return $subjects;
    }

    protected function addRating(){
        $db = new SQLite3(DB."db.sqlite");
        $subject_id = $this->data->subjectId;
        $rating = $this->data->rating;
        $db->exec("INSERT INTO estimatesSubjects(subject_id, estimate) VALUES({$subject_id}, {$rating})");
    }

    protected function getQuestions2($data){
        $db = new SQLite3(DB."db.sqlite");
        $current_page = $this->data->page;
        $offset = ($current_page-1) * PAGE_NUM;
        $res = $db->query("SELECT COUNT(*) as num FROM tickets");
        $page_num = $res->fetchArray(SQLITE3_ASSOC);
        $page_num = ceil($page_num["num"]/PAGE_NUM);
        $page_num = ($page_num==0) ? 1:$page_num;
        $sql = "SELECT * FROM tickets LIMIT ".PAGE_NUM." OFFSET $offset";
        $res = $db->query($sql);
        $data = array();
        while ($v = $res->fetchArray(SQLITE3_ASSOC)){
            array_push($data, $v);
        }
        $db->close();
        return array("data"=>$data, "page_num"=>$page_num);
}

    function getQuestions(){
        $ticket = ($this->data->settings)?null:$this->data->selectedTicket;
        $num = $this->data->num;
        //return $this->getTicketQuestions($ticket);
        if(!$this->data->subject)
            $questions = array_splice($this->getTicketQuestions($ticket, $this->data->recommended), 0, $num);
        else
            $questions = array_splice($this->getSubjectQuestions($this->data->selectedSubject), 0, $num);
        if($this->data->random=="on" || $this->data->random)
                shuffle($questions);
        return $questions;
    }

    function getTickets_2_Questions(){
        $db = new SQLite3(DB."db.sqlite");
        $res = $db->query("SELECT * FROM tickets");
        $tickets = array();
        $i = 0;
        while ($_t = $res->fetchArray(SQLITE3_ASSOC)){
            $tickets[$i] = array("name"=>$_t['name']);
            $res2 = $db->query("SELECT t2.* FROM ticket_2_question as t1 INNER JOIN questions as t2 ON t1.q_id=t2.id WHERE t1.tickets_id={$_t['id']}");
            while ($q = $res2->fetchArray(SQLITE3_ASSOC)){
                $tickets[$i]['questions'][] = $q;
            }
        }
        $db->close();
        return $tickets;
    }

    function getTicketQuestions($ticketId=null, $recommended = false){
        $db = new SQLite3(DB."db.sqlite");
        $ticketId = ($ticketId===null)?$this->data->ticketId:$ticketId;
        if($ticketId!=0)
            $sql = "SELECT t1.indx, t1.tickets_id, t2.* FROM ticket_2_question as t1 INNER JOIN questions as t2 ON t1.q_id=t2.id WHERE t1.tickets_id=$ticketId ORDER BY t1.indx";
        else if($recommended==true){
            $userId = $this->data->user_id;
            if(isset($userId))
                $sql = "SELECT t2.* FROM recommended_questions as t1 INNER JOIN questions as t2 ON t1.q_id=t2.id WHERE t1.user_id={$userId}";
        }
        else
            $sql = "SELECT * FROM questions"; 
        $res = $db->query($sql);
        $questions = array();
        $i = 0;
        while ($_q = $res->fetchArray(SQLITE3_ASSOC)){
            $_v = array();
            $questions[$i] = $_q;
            $sql = "SELECT * FROM variants WHERE q_id='{$_q['id']}'";
            $res2 = $db->query($sql);
            while ($v = $res2->fetchArray(SQLITE3_ASSOC)){
                $_v[] = $v;
            }
            $questions[$i]["variants"] = $_v;
            $i++;
        }
        $db->close();
        return $questions;
    }

    function getSubjectQuestions($subjectId=null){
        $db = new SQLite3(DB."db.sqlite");
        $subjectId = ($subjectId===null)?$this->data->subjectId:$subjectId;
        if($subjectId!=0)
            $sql = "SELECT t1.indx, t1.subject_id, t2.* FROM subject_2_question as t1 INNER JOIN questions as t2 ON t1.q_id=t2.id WHERE t1.subject_id=$subjectId ORDER BY t1.indx";
        else
            $sql = "SELECT * FROM questions"; 
        $res = $db->query($sql);
        $questions = array();
        $i = 0;
        while ($_q = $res->fetchArray(SQLITE3_ASSOC)){
            $_v = array();
            $questions[$i] = $_q;
            $sql = "SELECT * FROM variants WHERE q_id='{$_q['id']}'";
            $res2 = $db->query($sql);
            while ($v = $res2->fetchArray(SQLITE3_ASSOC)){
                $_v[] = $v;
            }
            $questions[$i]["variants"] = $_v;
            $i++;
        }
        $db->close();
        return $questions;
    }

    protected function removeQuestion(){
        $db = new SQLite3(DB."db.sqlite");
        $qId = $this->data->qId;
        $db->exec("DELETE FROM questions WHERE id=$qId");
        $db->exec("DELETE FROM ticket_2_question WHERE q_id=$qId");
        $db->close();
    }

    function getAllTicketQuestions(){
        $db = new SQLite3(DB."db.sqlite");
        $num = $this->data->num;
        $max = $this->data->max;
        $sql = "SELECT * FROM tickets LIMIT $num";
        $res = $db->query($sql);
        $tickets = array();
        $i = 0;
        while ($_t = $res->fetchArray(SQLITE3_ASSOC)){
            $sql = "SELECT * FROM variants WHERE ticket_id='{$_t['id']}'";
            $tickets[$i] = $_t;
            $_v = array();
            $res2 = $db->query($sql);
            while ($v = $res2->fetchArray(SQLITE3_ASSOC)){
                $_v[] = $v;
            }
            $tickets[$i]["variants"] = $_v;
            if($this->data->random=="on" || $this->data->random)
                shuffle($tickets);
            array_splice($tickets, $num);
            $i++;
        }
        return $tickets;
    }

    protected function changeTicketPos(){
        $db = new SQLite3(DB."db.sqlite");
        $tableName = $this->data->table;
        $firstItemQId = $this->data->firstItem->id;
        $secondItemQId = $this->data->secondItem->id;
        $firstTicketId = $this->data->secondItem->tickets_id;
        $secondTicketId = $this->data->secondItem->tickets_id;
        $firstItemIndx = $this->data->firstItem->indx;
        $secondItemIndx = $this->data->secondItem->indx;
        $menu_id = $this->data->menu_id;
        $sql1 = "UPDATE ticket_2_question SET indx=$firstItemIndx WHERE q_id=$firstItemQId AND tickets_id=$firstTicketId";
        $sql2 = "UPDATE ticket_2_question SET indx=$secondItemIndx WHERE q_id=$secondItemQId AND tickets_id=$secondTicketId";
        $db->query($sql1);
        $db->query($sql2);
        $db->close();
        return $sql1;
    }

    protected function getTicket(){
        $db = new SQLite3(DB."db.sqlite");
        $ticket_id = $this->data->ticket_id;
        $sql = "SELECT * FROM tickets WHERE id='$ticket_id'";
        $res = $db->query($sql);
        $ticket = null;
        if($res!==false)
            $ticket = $res->fetchArray(SQLITE3_ASSOC);
        $variants = array();
        $sql = "SELECT * FROM variants WHERE ticket_id='$ticket_id'";
        $res = $db->query($sql);
        while ($v = $res->fetchArray(SQLITE3_ASSOC)){
            array_push($variants, $v);
        }
        $db->close();
        return array("ticket"=>$ticket, "variants"=>$variants);
    }

    protected function uploadFile($fileUpload, $input_name = 'file'){
        $IMAGE_PATH = __DIR__ . '/img/';
        if (!isset($fileUpload[$input_name])) {
            $error = 'Не удалось загрузить файл.';
        } else {
            $file = $fileUpload[$input_name];
        }
        $allow = array('jpg', 'jpeg', 'png', 'svg', 'gif');

         if (!empty($file['error']) || empty($file['tmp_name'])) {
            $error = 'Не удалось загрузить файл.';
        } elseif ($file['tmp_name'] == 'none' || !is_uploaded_file($file['tmp_name'])) {
            $error = 'Не удалось загрузить файл.';
        } else {
            // Оставляем в имени файла только буквы, цифры и некоторые символы.
            $pattern = "[^a-zа-яё0-9,~!@#%^-_\$\?\(\)\{\}\[\]\.]";
            $name = mb_eregi_replace($pattern, '-', $file['name']);
            $name = mb_ereg_replace('[-]+', '-', $name);
            $parts = pathinfo($name);
     
            if (empty($name) || empty($parts['extension'])) {
                $error = 'Недопустимый тип файла';
            } elseif (!empty($allow) && !in_array(strtolower($parts['extension']), $allow)) {
                $error = 'Недопустимый тип файла';
            }
            else {
                // Перемещаем файл в директорию.
                if (move_uploaded_file($file['tmp_name'], IMG . $name)) {
                    return array("success"=>true, "filename"=>$name);
                } else {
                    $error = $_FILES[$input_name]["error"];
                }
            }
        }
        return array("success"=>false, "error"=>$error);
    }

    protected function addTicket(){
        $db = new SQLite3(DB."db.sqlite");
        $ticket_name = $this->data->ticket_name;
        $db->exec("INSERT INTO tickets(name) VALUES('$ticket_name')");
        $id = $db->lastInsertRowID();
        $db->close();
        return $id;
    }

    protected function addSubject(){
        $db = new SQLite3(DB."db.sqlite");
        $subject_name = $this->data->subject_name;
        $db->exec("INSERT INTO subjects(name) VALUES('$subject_name')");
        $id = $db->lastInsertRowID();
        $db->close();
        return $id;
    }

    protected function addQuestion(){
        $uploadResult = $this->uploadFile($_FILES);
        $image_name = ($uploadResult['success']) ? $uploadResult['filename'] : "";
        $text = $_POST['text'];
        $code_id = $_POST['codeId'];
        $ticket_id = $_POST['ticket_id'];
        $correct = $_POST['correct'];
        $variants = json_decode($_POST['variants']);
        sleep(1);
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("INSERT INTO questions(code_id, title, image, correct) VALUES('$code_id', '$text', '$image_name', '$correct')");
        $QId = $db->lastInsertRowID();
        //$db->exec("INSERT INTO ticket_2_question(ticket_id, q_id) VALUES($ticket_id, $QId)");
        for($i=0;$i<count($variants);$i++){
            $label = $variants[$i]->answer;
            $comment = $variants[$i]->comment;
            $db->exec("INSERT INTO variants(q_id, answer, comment) VALUES('$QId', '$label', '$comment')");  
        }
        $db->close();
        return $QId;
    }

    protected function editQuestion(){
        $db = new SQLite3(DB."db.sqlite");
        $uploadResult = $this->uploadFile($_FILES);
        $image_name = ($uploadResult['success']) ? $uploadResult['filename'] : "";
        $text = $_POST['text'];
        $codeId = $_POST['codeId'];
        $q_id = $_POST['qId'];
        $correct = $_POST['correct'];
        $variants = json_decode($_POST['variants']);
        sleep(1);
        $variants = json_decode($_POST['variants']);
        if($uploadResult['success']!==false)
            $db->exec("UPDATE questions SET code_id='$codeId', title='$text', image='$image_name', correct='$correct' WHERE id=$q_id");
        else
            $db->exec("UPDATE questions SET code_id='$codeId',title='$text', correct='$correct' WHERE id=$q_id"); 
        if(count($variants)>0)
            $db->exec("DELETE FROM variants WHERE q_id='$q_id'");
        for($i=0;$i<count($variants);$i++){
            $label = $variants[$i]->answer; 
            $comment = $variants[$i]->comment;
            $var_id = $variants[$i]->id;

            //if(array_key_exists("id", $variants[$i]))
                //$db->exec("UPDATE variants SET answer='$label', comment='$comment' WHERE q_id='$q_id' AND id='$var_id'");  
            //else
                $db->exec("INSERT INTO variants(q_id, answer, comment) VALUES('$q_id', '$label', '$comment')");
            }
        $db->close();
    }

    protected function addQueToTicket(){
        $db = new SQLite3(DB."db.sqlite");
        $ticketId = $this->data->ticketId;
        $questionId = $this->data->qId;
        $next_indx = $this->data->next_indx;
        $db->exec("INSERT INTO ticket_2_question(tickets_id, q_id, indx) VALUES($ticketId, $questionId, $next_indx)");
        $db->close();
    }

    protected function addQueToSubject(){
        $db = new SQLite3(DB."db.sqlite");
        $subjectId = $this->data->subjectId;
        $questionId = $this->data->qId;
        $next_indx = $this->data->next_indx;
        $db->exec("INSERT INTO subject_2_question(subject_id, q_id, indx) VALUES($subjectId, $questionId, $next_indx)");
        $db->close();
    }

    protected function removeQuestionicket(){
        $db = new SQLite3(DB."db.sqlite");
        $ticketId = $this->data->ticketId;
        $questionId = $this->data->qId;
        $db->exec("DELETE FROM ticket_2_question WHERE tickets_id=$ticketId AND q_id=$questionId");
        $db->close();
    }

    protected function removeQuestionSubject(){
        $db = new SQLite3(DB."db.sqlite");
        $subjectId = $this->data->subjectId;
        $questionId = $this->data->qId;
        $db->exec("DELETE FROM subject_2_question WHERE subject_id=$subjectId AND q_id=$questionId");
        $db->close();
    }

    protected function editTicket(){
        $db = new SQLite3(DB."db.sqlite");
        $text = $_POST['text'];
        $correct_id = $_POST['correct'];
        $ticketId = $_POST['ticket_id'];
        $uploadResult = $this->uploadFile($_FILES);
        $image_name = ($uploadResult['success']) ? $uploadResult['filename'] : "";
        $variants = json_decode($_POST['variants']);
        if($uploadResult['success']!==false)
            $db->exec("UPDATE tickets SET text='$text', image='$image_name', correct_id='$correct_id' WHERE id=$ticketId");
        else
            $db->exec("UPDATE tickets SET text='$text', correct_id='$correct_id' WHERE id=$ticketId"); 
        
        for($i=0;$i<count($variants);$i++){
            $label = $variants[$i]->answer;
            $comment = $variants[$i]->comment;
            $var_id = $variants[$i]->id;
            if(array_key_exists("id", $variants[$i]))
                $db->exec("UPDATE variants SET answer='$label', comment='$comment' WHERE ticket_id='$ticketId' AND id='$var_id'");  
            else
                $db->exec("INSERT INTO variants(ticket_id, answer, comment) VALUES('$ticketId', '$label', '$comment')");
            }
        $db->close();
        return true;
    }

    protected function removeTicket(){
        $db = new SQLite3(DB."db.sqlite");
        $ticketId = $this->data->ticket_id;
        $db->exec("DELETE FROM tickets WHERE id=$ticketId");
        $db->exec("DELETE FROM variants WHERE ticket_id='$ticketId'");
        $db->close();
    }

    protected function removeSubject(){
        $db = new SQLite3(DB."db.sqlite");
        $sId = $this->data->subject_id;
        $db->exec("DELETE FROM subjects WHERE id=$sId");
        $db->close();
        //$db->exec("DELETE FROM variants WHERE ticket_id='$ticketId'");
    }

    protected function getConfig(){
        $config_file = "./config/config.xml";
        $configs = array();
        $dom = new domDocument("1.0", "utf-8");
        $dom->load($config_file);
        $root = $dom->documentElement;
        $childs = $root->childNodes;
        foreach ($childs as $item)
            $configs[$item->nodeName] = $item->nodeValue;
        return $configs;
    }

    protected function saveConfig(){
        $configs = $_POST['configs'];
        $config_file = "./config/config.xml";
        $dom = new domDocument("1.0", "utf-8");
        $root = $dom->createElement("configs");
        $dom->appendChild($root);
        foreach($configs as $configName=>$configValue){
            $config = $dom->createElement($configName, $configValue);
            $root->appendChild($config);
        }
        $dom->save($config_file);
    }

    protected function getUserRole($data){
        if(isset($_SESSION['logged']))
            return array("logged"=>true, "id"=>$_SESSION['userId'], "confirmed"=>$_SESSION['confirmed'], "role"=>$_SESSION['role'], "login"=>$_SESSION["login"], "name"=>$_SESSION["name"], "email"=>$_SESSION["email"]);
        if(isset($_COOKIE["login"]) && isset($_COOKIE["password"])){
            $db = new SQLite3(DB."db.sqlite");
            $sql = "SELECT id, login, name, email, role, confirmed FROM users WHERE login=:login AND password=:password";
            $stmt = $db->prepare($sql);
            $login = $_COOKIE["login"];
            $stmt->bindParam(':login', $login);
            $stmt->bindParam(':password', $_COOKIE["password"]);
            $result = $stmt->execute();
            $row = $result->fetchArray(SQLITE3_ASSOC);
            $_SESSION['logged'] = 1;
            $_SESSION['role'] = $row['role'];
            $_SESSION['login'] = $row['login'];
            $_SESSION['name'] = $row['name'];
            $_SESSION['email'] = $row['email'];
            $_SESSION['confirmed'] = $row['confirmed'];
            $_SESSION['id'] = $row['id'];
            $stmt->close();
            return array("logged"=>($row['login']!=null), "id"=>$row["id"], "role"=>$row["role"], "login"=>$row["login"], "name"=>$row["name"], "email"=>$row["email"], "confirmed"=>$row['confirmed']);
        }
        else
            return false;
    }

    protected function getProfile(){
        //ini_set('display_errors', TRUE);
        $db = new SQLite3(DB."db.sqlite");
        $id = $_SESSION['userId'];
        $sql = "SELECT id, login, name, email, role, confirmed FROM users WHERE id=$id";
        $res = $db->query($sql);
        $result = $res->fetchArray(SQLITE3_ASSOC);
        $db->close();
        echo 'user_id='.$_SESSION['userId'];
        return $result;
    }

    function addNewUser($token = ''){
        $login = $this->data->login2;
        $name = $this->data->name2;
        $email = $this->data->email2;
        $role = $this->data->role2;
        $confirmed = ($token=='') ? 1:0;
        $reg_date = time();
        $role = (array_key_exists("role", $_POST)) ? $_POST['role'] : 3;
        if(isset($login) && isset($this->data->password2) && isset($role)){
            $db = new SQLite3(DB."db.sqlite");
            $password = md5($this->data->password2);
            $sql = "INSERT INTO users(login, name, password, email, role, token, confirmed, reg_date) VALUES('$login', '$name', '$password', '$email', '$role', '$token', '$confirmed', {$reg_date})";
            $db->exec($sql);
            $userId = $db->lastInsertRowID();
            $db->close();
            $this->data->id = $userId;
            $jwt = tokenHandler::getJWT($this->data);
            return array("accessTooken"=>$jwt, "id"=>$userId);
        }
    }

    function editUser(){
        //ini_set('display_errors', TRUE);
        $login = $this->data->login2;
        $name = $this->data->name2;
        $email = $this->data->email2;
        $id = $this->data->id;
        $role = $this->data->role;
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("UPDATE users SET login='$login', name='$name', role=$role, email='$email' WHERE id={$id}");
        $sql = "UPDATE users SET login='$login', name='$name', role=$role, email='$email' WHERE id={$id}";
        $db->close();
        return $sql;
    }

    function removeUser(){
        $db = new SQLite3(DB."db.sqlite");
        $user_id = $this->data->user_id;
        $db->exec("DELETE FROM users WHERE id=$user_id");
        $db->close();
        return true;
    }

    protected function changePassword(){
        $db = new SQLite3(DB."db.sqlite");
        $isUserId = (array_key_exists("userId", $this->data));
        $id = ($isUserId) ? $this->data->userId : $this->data->email;
        $password = md5($this->data->password);
        if($isUserId)
            $sql = "UPDATE users SET password='$password' WHERE id=$id";
        else
            $sql = "UPDATE users SET password='$password', token='' WHERE email='$id'"; 
        $db->exec($sql);
        $db->close(); 
        return $password;
    }

    function logout(){
        setcookie("login", null, -1);
        setcookie("password", null, -1);
        unset($_SESSION['logged']);
        unset($_SESSION['role']);
        unset($_COOKIE["login"]);
        unset($_COOKIE["password"]);
    }

    function getUser(){
        //ini_set('display_errors', TRUE);
        $db = new SQLite3(DB."db.sqlite");
        $userId = tokenHandler::$tokenData->data->id;
        $result = $db->query("SELECT id, login, name, surname, role, email, action_time, reg_date, last_auth from users where id={$userId}");
        $row = $result->fetchArray(SQLITE3_ASSOC);
        $db->close();
        return $row;
    }

    function getUsers(){
        $db = new SQLite3(DB."db.sqlite");
        $sql = "SELECT id, name, login, email, role, action_time, reg_date, last_auth FROM users";
        $res = $db->query($sql);
        $currentTime = time();
        while($user = $res->fetchArray(SQLITE3_ASSOC)){
            $online = ($user['action_time']==0) ? -1 : (($currentTime-$user['action_time']>60*5)?0:1);
            $user['state'] = $online;
            $user['reg_date'] = ($user['reg_date']==0)?"":date("d-m-Y H:i", $user['reg_date']);
            $user['last_auth'] = ($user['last_auth']==0)?"":date("d-m-Y H:i", $user['last_auth']);
            $users[] = $user;
        }
        $db->close();
        return $users;
    }

    protected function login(){
        if(isset($this->data->login) && isset($this->data->password) && strlen($this->data->login)<128 && strlen($this->data->password)<128){
            $db = new SQLite3(DB."db.sqlite");
            $password = md5($this->data->password);
            $sql = "SELECT id, login, role, name, email, confirmed FROM users WHERE login=:login AND password=:password";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':login', $this->data->login);
            $stmt->bindParam(':password', $password);
            $result = $stmt->execute();
            
            if($result!=false && $result!=null){
                $user = $result->fetchArray(SQLITE3_ASSOC);
                setcookie("login", $_POST['login'], time() + 30*24*3600);
                setcookie("userid", $user['id'], time() + 30*24*3600);
                $auth_date = time();
                $db->exec("UPDATE users SET last_auth={$auth_date} WHERE id={$user['id']}");
                setcookie("password", $password, time() + 30*24*3600);
                $_SESSION['logged'] = 1;
                $_SESSION['role'] = $user['role'];
                $_SESSION['confirmed'] = $user['confirmed'];
                $_SESSION['login'] = $user['login'];
                $_SESSION['userId'] = $user['id'];
                $_SESSION['name'] = $user['name'];
                $_SESSION['email'] = $user['email'];
                $stmt->close();
                //return $password;
                //return ($user!==false);
                return $user;
            }
            else
                return false;
        }
    }

    protected function gen_token(){
        $token = md5(microtime() . 'salt' . time());
        return $token;
    }

    /*function signin(){
        if(login())
            header('Location: ./');
        else
            header('Location: ./auth.html');  
    }

    function authorize_confirmation(){

    }*/

    protected function signup(){
        //ini_set('display_errors', TRUE);
        $token = $this->gen_token();
        $data = $this->addNewUser($token);
        $link = "https://pddlife.ru/#/confirmation/".$data['id'] ."/".$token;
        $to      = $this->data->email2;
        $subject = 'Подтверждение регистрации';
        $message = 'Для подтверждения регистрации перейдите по ссылке:<br/>';
        $headers  = "From: robot@pddlife.ru\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $message = '<p>Спасибо за регистрацию на сайте www.pddlife.ru</p><p>Для подтверждения регистрации перейдите по ссылке: '.$link.' </p><p>Это письмо сформировано автоматически, отвечать на него не нужно.</p>';
        //mail($to, $subject, $message, $headers);
        return $data;
    }

    protected function email_recovery(){
        $token = $this->gen_token();
        $email = $this->data->email;
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("UPDATE users SET token='$token' WHERE email='$email'");
        $db->close();
        $link = "https://pddlife.ru/#/passwordrecovery/".$email ."/".$token;
        $to      = $email;
        $subject = 'Восстановление пароля';
        $headers  = "From: robot@pddlife.ru\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $message = '<p>Для восстановления пароля перейдите по ссылке: '.$link.' </p><p>Это письмо сформировано автоматически, отвечать на него не нужно.</p>';
        mail($to, $subject, $message, $headers);
    }

    protected function checkEmailToken(){
        $token = $this->data->token;
        $email = $this->data->email;
        $db = new SQLite3(DB."db.sqlite");
        $sql = "SELECT id FROM users WHERE email=:email AND token=:token AND token!=''";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':token', $token);
        $result = $stmt->execute();
        $res = $result->fetchArray();
        if($res!=false && $res!=null){
            //$db->exec("UPDATE users SET token='' WHERE email=$email");
            $db->close();
            return true;
        }
        else{
            $db->close();
            return false;
        }
    }

    protected function checkToken(){
        $token = $this->data->token;
        $userId = $this->data->userId;
        $db = new SQLite3(DB."db.sqlite");
        $sql = "SELECT id FROM users WHERE id=:id AND token=:token";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $userId);
        $stmt->bindParam(':token', $token);
        $result = $stmt->execute();
        $res = $result->fetchArray();
        if($res!=false && $res!=null){
            $db->exec("UPDATE users SET confirmed='1' WHERE id=$userId");
            return true;
        }
        else
            return false;
    }

    protected function transliterate($value) {
        $converter = array(
            'а' => 'a',    'б' => 'b',    'в' => 'v',    'г' => 'g',    'д' => 'd',
            'е' => 'e',    'ё' => 'e',    'ж' => 'zh',   'з' => 'z',    'и' => 'i',
            'й' => 'y',    'к' => 'k',    'л' => 'l',    'м' => 'm',    'н' => 'n',
            'о' => 'o',    'п' => 'p',    'р' => 'r',    'с' => 's',    'т' => 't',
            'у' => 'u',    'ф' => 'f',    'х' => 'h',    'ц' => 'c',    'ч' => 'ch',
            'ш' => 'sh',   'щ' => 'sch',  'ь' => '',     'ы' => 'y',    'ъ' => '',
            'э' => 'e',    'ю' => 'yu',   'я' => 'ya',
     
            'А' => 'A',    'Б' => 'B',    'В' => 'V',    'Г' => 'G',    'Д' => 'D',
            'Е' => 'E',    'Ё' => 'E',    'Ж' => 'Zh',   'З' => 'Z',    'И' => 'I',
            'Й' => 'Y',    'К' => 'K',    'Л' => 'L',    'М' => 'M',    'Н' => 'N',
            'О' => 'O',    'П' => 'P',    'Р' => 'R',    'С' => 'S',    'Т' => 'T',
            'У' => 'U',    'Ф' => 'F',    'Х' => 'H',    'Ц' => 'C',    'Ч' => 'Ch',
            'Ш' => 'Sh',   'Щ' => 'Sch',  'Ь' => '',     'Ы' => 'Y',    'Ъ' => '',
            'Э' => 'E',    'Ю' => 'Yu',   'Я' => 'Ya','0'=>'0','1'=>'1','2'=>'2','3'=>'3',
            '4'=>'4','5'=>'5','6'=>'6','7'=>'7','8'=>'8','9'=>'9', '('=>'(', ')'=>')', '-'=>'-', ' '=>' '
             );
     
        $value = strtr(str_replace(" ", "", $value), $converter);
        return $value;
    }

    protected function createPage(){
        $files = $_FILES;
        foreach($files as $file){
            $uploadFile = array("file"=>$file);
            $this->uploadFile($uploadFile);
        }
        $pageContent = $_POST['content'];
        $pageTitle = $_POST['page'];
        $pageName = $this->transliterate($_POST['page']);
        $pageName = substr($pageName, 0, 64);
        file_put_contents(PAGES.$pageName.".html", $pageContent);
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("INSERT INTO pages(name, title) VALUES('$pageName', '$pageTitle')");
        $db->close();
    }

    protected function update(){
        $db = new SQLite3(DB."db.sqlite");
        //$db->exec("INSERT INTO settings(config_name, value) values('exam_title', 'Выбор билета')");
        //$db->exec("ALTER TABLE ticket_2_question ADD COLUMN indx");
        //$res = $db->query("SELECT * FROM ticket_2_question");
        $res = $db->query("SELECT * FROM menu_2_page");
        $i = 0;
        $tickets = array();
        while($row = $res->fetchArray(SQLITE3_ASSOC)){
            $i++;
            //if(!isset($tickets[$row['tickets_id']]))
                //$page[$row['tickets_id']] = 1;
            //else
                //$page[$row['tickets_id']]++;
            $db->exec("UPDATE menu_2_page SET indx={$i} WHERE page_id={$row['page_id']} AND menu_id={$row['menu_id']}");
        }
        $db->close();
    }

    // getting top menu
    protected function getMenu(){
        $db = new SQLite3(DB."db.sqlite");
        $res = $db->query("SELECT t1.name, t1.title as menu_title, t3.name as page_name, t3.title FROM menus as t1 LEFT JOIN menu_2_page as t2 ON t1.id=t2.menu_id LEFT JOIN pages as t3 ON t2.page_id=t3.id ORDER BY t1.indx, t2.indx");
        $menu = array();
        while($row = $res->fetchArray(SQLITE3_ASSOC)){
            if($row['page_name']!=null){
                $menu[$row['name']]['title'] = $row['menu_title'];
                $menu[$row['name']]['name'] = $row['name'];
                $menu[$row['name']]['submenu'][] = $row;
                
            }
            else{
               $menu[$row['name']]['title'] = $row['menu_title'];
               $menu[$row['name']]['name'] = $row['name'];
            }
        }
        $db->close();
        return $menu;
    }

    protected function createMenuItem(){
        $db = new SQLite3(DB."db.sqlite");
        $menu_name = $this->data->menu_name;
        $menu_title = $this->data->menu_title;
        $db->exec("INSERT INTO menus(name, title) VALUES('$menu_name', '$menu_title')");
        $menuId = $db->lastInsertRowID();
        $db->close();
        return array("title"=>$menu_title, "id"=>$menuId);
    }

    protected function renameMenu(){
        $db = new SQLite3(DB."db.sqlite");
        $new_name = $this->data->newName;
        $menuId = $this->data->id;
        $db->exec("UPDATE menus SET title='$new_name' WHERE id=$menuId");
        $db->close();
    }

    protected function renamePage(){
        $db = new SQLite3(DB."db.sqlite");
        $new_name = $this->data->newName;
        $id = $this->data->id;
        $db->exec("UPDATE pages SET title='$new_name' WHERE id=$id");
        $db->close();
    }

    protected function getMenuItems(){
        $db = new SQLite3(DB."db.sqlite");
        // query for getting all menu items
        $res = $db->query("SELECT * FROM menus ORDER BY indx");
        $menus = array();
        $pages = array();
        while($row = $res->fetchArray(SQLITE3_ASSOC))
            $menus[] = $row;
        // query for getting all pages
        $res = $db->query("SELECT * FROM pages");
        while($row = $res->fetchArray(SQLITE3_ASSOC))
            $pages[] = $row;
        $db->close();
        return array("menus"=>$menus, "pages"=>$pages);
    }

    protected function getMenuPages(){
        $db = new SQLite3(DB."db.sqlite");
        $menu_id = $this->data->menu_id;
        $res = $db->query("SELECT t1.indx, t1.menu_id, t2.* FROM menu_2_page as t1 INNER JOIN pages as t2 ON t1.page_id=t2.id WHERE t1.menu_id=$menu_id ORDER BY t1.indx");
        $pages = array();
        while($row = $res->fetchArray(SQLITE3_ASSOC))
            $pages[] = $row;
        $db->close();
        return $pages;
    }

    protected function changePos(){
        $db = new SQLite3(DB."db.sqlite");
        $tableName = $this->data->table;
        $firstItemId = $this->data->firstItem->id;
        $secondItemId = $this->data->secondItem->id;
        $firstItemIndx = $this->data->firstItem->indx;
        $secondItemIndx = $this->data->secondItem->indx;
        $menu_id = $this->data->menu_id;
        if($tableName=="menu_2_page"){
            $sql1 = "UPDATE {$tableName} SET indx=$firstItemIndx WHERE page_id=$firstItemId AND menu_id=$menu_id";
            $sql2 = "UPDATE {$tableName} SET indx=$secondItemIndx WHERE page_id=$secondItemId AND menu_id=$menu_id";
        }
        else{
            $sql1 = "UPDATE {$tableName} SET indx=$firstItemIndx WHERE id=$firstItemId";
            $sql2 = "UPDATE {$tableName} SET indx=$secondItemIndx WHERE id=$secondItemId"; 
        }
        $db->query($sql1);
        $db->query($sql2);
        $db->close();
        return $sql1;
    }

    protected function addPageMenu(){
        $db = new SQLite3(DB."db.sqlite");
        $menu_id = $this->data->menu_id;
        $page_id = $this->data->page_id;
        $indx = $this->data->indx;
        $db->exec("INSERT INTO menu_2_page(menu_id, page_id, indx) VALUES($menu_id, $page_id, $indx)");
        $db->close();
        return true;
    }

    protected function removeMenuItem(){
        $db = new SQLite3(DB."db.sqlite");
        $menu_id = $this->data->menu_id;
        $page_id = $this->data->page_id;
        $db->exec("DELETE FROM menu_2_page WHERE menu_id=$menu_id AND page_id=$page_id");
        $db->close();
        return true;
    }

    protected function getSettings(){
        $db = new SQLite3(DB."db.sqlite");
        $res = $db->query("SELECT * FROM settings");
        while($row = $res->fetchArray(SQLITE3_ASSOC)){
            if($row['config_name']=='start_page'){
                $res2 =  $db->query("SELECT * FROM pages WHERE id='{$row['value']}'");
                $row2 = $res2->fetchArray(SQLITE3_ASSOC);
                $settings[$row['config_name']] = $row2;
            }
            else
                $settings[$row['config_name']] = $row['value'];
        }
        $db->close();
        return $settings;
    }

    protected function setHomeIcon(){
        $db = new SQLite3(DB."db.sqlite");
        $uploadResult = $this->uploadFile($_FILES);
        $image_name = ($uploadResult['success']) ? $uploadResult['filename'] : "default_home.png";
        $db->exec("UPDATE settings SET value='$image_name' WHERE config_name='home_icon'");
        $db->close();
    }

    protected function getHomeIcon(){
        $db = new SQLite3(DB."db.sqlite");
        $res = $db->query("SELECT value FROM settings where config_name='home_icon'");
        $result = $res->fetchArray(SQLITE3_ASSOC);
        $db->close();
        if(!empty($result['value']))
            return './img/'.$result['value'];
        else
            return "./img/default_home.png";
    }


    protected function save_settings(){
        $db = new SQLite3(DB."db.sqlite");
        $uploadResult = $this->uploadFile($_FILES, 'file');
        $image_name = ($uploadResult['success']) ? $uploadResult['filename'] : "";
        $uploadResult2 = $this->uploadFile($_FILES, 'file_tickets');
        $uploadResult3 = $this->uploadFile($_FILES, 'file_titleimg');
        $uploadResultTicketMobile = $this->uploadFile($_FILES, 'file_tickets_mobile');
        $uploadResultTitleMobile =  $this->uploadFile($_FILES, 'file_titleimg_mobile');
        $image_name_tickets = ($uploadResult2['success']) ? $uploadResult2['filename'] : "";
        $image_title_exam = ($uploadResult3['success']) ? $uploadResult3['filename'] : "";
        $image_name_tickets_mobile = ($uploadResultTicketMobile['success']) ? $uploadResultTicketMobile['filename'] : "";
        $image_title_exam_mobile = ($uploadResultTitleMobile['success']) ? $uploadResultTitleMobile['filename'] : "";
        $showLogo = $_POST['showLogo'];
        $shuffle_tickets = $_POST['shuffle_tickets'];
        $bgcolor = $_POST['bgcolor'];
        $bgcolor_tickets = $_POST['bgcolor_tickets'];
        $examTitle = $_POST['exam_title'];
        $start_page = $_POST['start_page'];
        sleep(1);
        if($bgcolor)
            $db->exec("UPDATE settings SET value='$bgcolor' WHERE config_name='background-color'");
        if($image_name)
            $db->exec("UPDATE settings SET value='$image_name' WHERE config_name='background-image'");
        if($image_name_tickets)
            $db->exec("UPDATE settings SET value='$image_name_tickets' WHERE config_name='background-image-tickets'");
        if($image_name_tickets_mobile)
            $db->exec("UPDATE settings SET value='$image_name_tickets_mobile' WHERE config_name='background-image-tickets-mobile'");
        if($bgcolor_tickets)
            $db->exec("UPDATE settings SET value='$bgcolor_tickets' WHERE config_name='background-color-tickets'");
        if($image_title_exam)
            $db->exec("UPDATE settings SET value='$image_title_exam' WHERE config_name='image_title_exam'");
        if($image_title_exam_mobile)
            $db->exec("UPDATE settings SET value='$image_title_exam_mobile' WHERE config_name='image_title_exam_mobile'");
        if($showLogo=="0" || $showLogo=="1"){
            $db->exec("UPDATE settings SET value='$showLogo' WHERE config_name='showLogo'");
        }
        if($shuffle_tickets=="0" || $shuffle_tickets=="1")
            $db->exec("UPDATE settings SET value='$shuffle_tickets' WHERE config_name='shuffle_tickets'");
        
        if($start_page){
            $db->exec("UPDATE settings SET value='$start_page' WHERE config_name='start_page'");
        }
        if($examTitle){
            $db->exec("UPDATE settings SET value='$examTitle' WHERE config_name='exam_title'");
        }
        $db->close();
        echo $image_title_exam;
        }

    protected function removeBgImage(){
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("UPDATE settings SET value='' WHERE config_name='background-image'");
        $db->close();
        }

    protected function removeBgTicketsImage(){
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("UPDATE settings SET value='' WHERE config_name='background-image-tickets'");
        $db->close();
    }

    protected function removeBgImageMobile(){
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("UPDATE settings SET value='' WHERE config_name='background-image-tickets-mobile'");
        $db->close();
    }

    protected function removeImageTitleExam(){
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("UPDATE settings SET value='' WHERE config_name='image_title_exam'");
        $db->close();
    }

    protected function removeImageTitleExamMobile(){
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("UPDATE settings SET value='' WHERE config_name='image_title_exam_mobile'");
        $db->close();
    }

    protected function saveStatistic(){
        ini_set('display_errors', TRUE);
        $db = new SQLite3(DB."db.sqlite");
        $stats = json_decode($this->data->stats);
        $user_id = $this->data->user_id;
        foreach($stats as $q_id=>$stat){
            $elapsedTime = $stat->elapsed_time/1000;
            $time = time();
            $db->exec("INSERT INTO statistic(timecreated, ticket_id, q_id, user_id, elapsed_time, correct, test_session) VALUES('$time', {$stat->ticket_id}, $q_id, {$user_id}, {$elapsedTime}, {$stat->correct}, {$stat->testSession})");
        }
        $userId = $this->data->user_id;
        if($userId!=0){
            $results = json_decode($this->data->results);
            for($i=0;$i<count($results);$q_id=$results[$i]->q_id, $i++){
                if($results[$i]->success==1)
                    $db->exec("DELETE FROM recommended_questions WHERE user_id={$userId} AND q_id={$q_id}");
                else
                    $db->exec("INSERT OR IGNORE INTO recommended_questions(user_id, q_id) VALUES({$userId}, {$q_id})");
            }
        }
        $db->close();
    }

    protected function getGrade(){
        $db = new SQLite3(DB."db.sqlite");
        $userSql = (isset($this->data->user_id)) ? " WHERE t1.user_id={$this->data->user_id}" : "";
        $order = $this->data->order;
        $result = $db->query("SELECT t1.user_id AS user_id, t1.q_id AS q_id, t2.login AS login, t1.test_session as test_session, t3.name AS ticketname, t1.timecreated AS timefinished, MAX(t1.timecreated) as last_time, SUM(t1.correct) AS num FROM statistic AS t1 INNER JOIN tickets AS t3 ON t1.ticket_id=t3.id LEFT JOIN users AS t2 ON t1.user_id=t2.id {$userSql} GROUP BY t1.user_id, t1.ticket_id, t1.test_session ORDER BY last_time {$order}");
        $grades = array();
        while($res = $result->fetchArray(SQLITE3_ASSOC)){
            $user_id = $res['user_id'];
            $ticket_name = $res['ticketname'];
            $login = (!empty($res['login']))?$res['login']:$user_id;
            $time = date("d-m-Y H:i", $res['last_time']);
            $grades[$login][$ticket_name] = array("time"=>$time, 'failed'=>$res['num'], 'user_id'=>$user_id, 'session'=>$res['test_session']);
        }
        $db->close();
        return $grades;
    }

    protected function getUserGrade(){
        $db = new SQLite3(DB."db.sqlite");
        $user_id = $this->data->user_id;
        $order = $this->data->order;
        $result = $db->query("SELECT t1.user_id AS user_id, t1.q_id AS q_id, t2.login AS login, t1.test_session as test_session, t3.name AS ticketname, t1.timecreated AS timefinished, SUM(t1.correct) AS num FROM statistic AS t1 INNER JOIN tickets AS t3 ON t1.ticket_id=t3.id LEFT JOIN users AS t2 ON t1.user_id=t2.id where user_id={$user_id} GROUP BY t1.test_session ORDER BY t1.timecreated {$order}");
        $grades = array();
        while($res = $result->fetchArray(SQLITE3_ASSOC)){
            $user_id = $res['user_id'];
            $ticket_name = $res['ticketname'];
            $time = date("d-m-Y H:i", $res['timefinished']); 
            $grades[] = array("time"=>$time, 'ticket_name'=>$ticket_name, 'failed'=>$res['num'], 'user_id'=>$user_id, 'session'=>$res['test_session']);
        }
        return $grades;
    }

    protected function getFailedQuestions(){
        //ini_set('display_errors', TRUE);
        $db = new SQLite3(DB."db.sqlite");
        $user_id = $this->data->q_id;
        $test_session = $this->data->testSession;
        //$result = $db->query("SELECT t2.indx FROM statistic AS t1 INNER JOIN ticket_2_question AS t2 ON t1.ticket_id=t2.tickets_id AND t1.q_id=t2.q_id WHERE t1.test_session={$test_session} AND t1.correct=1");
        $result = $db->query("SELECT t2.indx FROM statistic AS t1 INNER JOIN ticket_2_question AS t2 ON t1.q_id=t2.q_id WHERE t1.test_session={$test_session} AND t1.correct=1");
        while($res = $result->fetchArray(SQLITE3_ASSOC)){
            $q[] = $res['indx'];
        }
        $db->close();
        return $q;
    }

    protected function getStatistic(){
        //ini_set('display_errors', TRUE);
        $db = new SQLite3(DB."db.sqlite");
        $ticketId = $this->data->ticketId;
        $avg_stat = array();
        $start_date = $this->data->start_date;
        $end_date = $this->data->end_date;
        $result = $db->query("SELECT t2.q_id as 'q_id', '1' as _correct, t1.indx as 'indx', COUNT(DISTINCT t2.test_session) as 'человек прошло', AVG(t2.elapsed_time) as 'среднее время' FROM ticket_2_question as t1 INNER JOIN statistic as t2 ON t1.q_id=t2.q_id AND t1.tickets_id={$ticketId} WHERE t2.correct=0 AND (DATETIME(t2.timecreated, 'unixepoch')>=datetime({$start_date}, 'unixepoch') AND DATETIME(t2.timecreated, 'unixepoch')<=datetime({$end_date}, 'unixepoch')) GROUP BY t2.q_id UNION ALL SELECT t2.q_id as 'q_id', '0' as correct, t1.indx as 'indx', COUNT(DISTINCT t2.test_session) as 'человек прошло', AVG(t2.elapsed_time) as 'среднее время' FROM ticket_2_question as t1 INNER JOIN statistic as t2 ON t1.q_id=t2.q_id WHERE t1.tickets_id={$ticketId} AND t2.correct=1 AND (DATETIME(t2.timecreated, 'unixepoch')>=datetime({$start_date}, 'unixepoch') AND DATETIME(t2.timecreated, 'unixepoch')<=datetime({$end_date}, 'unixepoch')) GROUP BY t2.q_id ORDER BY t1.indx");
        //$result = $db->query("SELECT * FROM (SELECT t2.q_id as 'q_id', '1' as _correct, t1.indx as 'indx', COUNT(DISTINCT t2.test_session) as 'человек прошло', AVG(t2.elapsed_time) as 'среднее время' FROM ticket_2_question as t1 INNER JOIN statistic as t2 ON t1.q_id=t2.q_id WHERE t1.tickets_id={$ticketId} AND t2.correct=0 AND (DATETIME(t2.timecreated, 'unixepoch')>=datetime({$start_date}, 'unixepoch') AND DATETIME(t2.timecreated, 'unixepoch')<=datetime({$end_date}, 'unixepoch')) GROUP BY t2.q_id UNION ALL SELECT t2.q_id as 'q_id', '0' as correct, t1.indx as 'indx', COUNT(DISTINCT t2.test_session) as 'человек прошло', AVG(t2.elapsed_time) as 'среднее время' FROM ticket_2_question as t1 INNER JOIN statistic as t2 ON t1.q_id=t2.q_id WHERE t1.tickets_id={$ticketId} AND t2.correct=1 AND (DATETIME(t2.timecreated, 'unixepoch')>=datetime({$start_date}, 'unixepoch') AND DATETIME(t2.timecreated, 'unixepoch')<=datetime({$end_date}, 'unixepoch')) GROUP BY t2.q_id) GROUP BY q_id");
        $i = 0;
        $correctIndx = 0;
        $incorrectIndx = 0;
        $arr = array();
        while($res = $result->fetchArray(SQLITE3_ASSOC)){
            $indx = $res['q_id'];
            
            //if(empty($correct_data[$indx]))
                //$avg_stat[$indx] = array('correct_avg'=>0, 'correct_num'=>0, 'incorrect_avg'=>0, 'incorrect_num'=>0);
            if($res['_correct']=='1'){
                $avg_stat[$indx]['correct_avg']  = round($res['среднее время'], 2);
                $avg_stat[$indx]['q_id'] = $res['q_id'];
                $avg_stat[$indx]['correct_num'] = $res['человек прошло'];
            }
            else{
                $avg_stat[$indx]['incorrect_avg'] = round($res['среднее время'], 2);
                $avg_stat[$indx]['incorrect_num'] = $res['человек прошло'];
                $avg_stat[$indx]['q_id'] = $res['q_id'];
            }
            //$avg_stat[$i] = $res;
            $i++;
        }
        $i = 0;
        foreach($avg_stat as $key=>$item){
            $avg_stat[$key]['name'] = $i+1;
            $i++;
        }
        $avg_stat = array_values($avg_stat);
        $i = 0;
        //$result = $db->query("SELECT t2.q_id, '0' as correct, t1.indx, COUNT(*) as 'человек прошло', AVG(t2.elapsed_time) as 'среднее время' FROM ticket_2_question as t1 INNER JOIN statistic as t2 ON t1.q_id=t2.q_id WHERE t2.ticket_id={$ticketId} AND t2.correct=1 AND (DATETIME(t2.timecreated, 'unixepoch')>=datetime({$start_date}, 'unixepoch') AND DATETIME(t2.timecreated, 'unixepoch')<=datetime({$end_date}, 'unixepoch')) GROUP BY t2.q_id ORDER BY t1.indx");
        $stat_data = array();
        for($j=0;$j<20;$j++){
            $stat_data[$j]['name'] = $j.'-'.($j+1);
            $stat_data[$j]['человек'] = 0;
        }
        $i = 0;
        $result = $db->query("SELECT user_id, test_session, SUM(elapsed_time) AS summary FROM statistic WHERE ticket_id=$ticketId GROUP BY test_session");
        while($res = $result->fetchArray(SQLITE3_ASSOC)){
            if(($res['summary']/60<=20)){
                $range = floor($res['summary']/60);
                $stat_data[$range]['человек']+=1;
            }
        }
        
        $db->close();
        return array("correct"=>$avg_stat, 'stat'=>$stat_data, 'baseIndex'=>$baseIndx);
    }

    protected function getSummaryStat(){
        $db = new SQLite3(DB."db.sqlite");
        $start_date = $this->data->start_date;
        $end_date = $this->data->end_date;
        $result = $db->query("SELECT t1.name AS name, COUNT(*) AS num, SUM(t2.correct) AS summ FROM tickets AS t1 LEFT JOIN statistic AS t2 ON t1.id=ticket_id WHERE (DATETIME(t2.timecreated, 'unixepoch')>=datetime({$start_date}, 'unixepoch') AND DATETIME(t2.timecreated, 'unixepoch')<=datetime({$end_date}, 'unixepoch')) GROUP BY t1.id, t2.test_session");
        $tickets = array();
        while($res = $result->fetchArray(SQLITE3_ASSOC)){
            if(empty($tickets[$res['name']])){
                $tickets[$res['name']]['success'] = 0;
                $tickets[$res['name']]['fail'] = 0;
                $tickets[$res['name']]['name'] = $res['name'];
            }
            if($res['summ']<=2)
                $tickets[$res['name']]['success']++;
            else
                $tickets[$res['name']]['fail']++;     
        }
        $db->close();
        return array('summaryStat'=>$tickets);
    }

    protected function resetStat(){
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("DELETE FROM statistic");
        $db->close();
    }

    protected function renameTicket(){
        $ticketId = $this->data->id;
        $newName = $this->data->newName;
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("UPDATE tickets SET name='{$newName}' WHERE id={$ticketId}");
        $db->close();
    }

    protected function renameSubject(){
        $subjetcId = $this->data->id;
        $newName = $this->data->newName;
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("UPDATE subjects SET name='{$newName}' WHERE id={$subjetcId}");
        $db->close();
    }

    }
    $app = new Application();
    $app->run();
?>