<?php
    //ini_set('display_errors', TRUE);
    require_once("../init.php");
    $IMAGE_PATH = __DIR__ . '/img/';
    $PAGE_DIR = __DIR__ . 'pages/';
    const PAGE_NUM = 30;

    class Application{

        var $PAGE_DIR = __DIR__ . 'pages/';
        var $data = array();

        public function __construct(){
            session_start();
            $reqBody = file_get_contents("php://input");
            $reqData = (!empty($reqBody)) ? json_decode($reqBody): (object) $_REQUEST;
            $this->action = $reqData->action;
            $this->data = $reqData->data;
            //$this->db = new SQLite3(DB."db.sqlite");
        }

        public function run(){
            $db = new SQLite3(DB."db.sqlite");
            $result = call_user_method($this->action, $this);
            if($_COOKIE['userid'] && ($this->action=="getSettings" || $this->action=="getPage")){
                $current_time = time();
                $db->exec("UPDATE users SET action_time='{$current_time}' WHERE id={$_COOKIE['userid']}");
                $db->close();
            }
            echo json_encode(array("data"=>$result));
        }

        protected function getPage(){
            $db = new SQLite3(DB."db.sqlite");
            $id = $this->data->page_id;
            $sql = "SELECT private from pages WHERE name=$id";
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
        $sql = "SELECT * FROM tickets";
        $res = $db->query($sql);
        $tickets = array();
        while ($v = $res->fetchArray(SQLITE3_ASSOC)){
            array_push($tickets, $v);
        }
        $db->close();
        return $tickets;
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
        $questions = array_splice($this->getTicketQuestions($ticket), 0, $num);
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

    function getTicketQuestions($ticketId=null){
        $db = new SQLite3(DB."db.sqlite");
        $ticketId = ($ticketId===null)?$this->data->ticketId:$ticketId;
        if($ticketId!=0)
            $sql = "SELECT t1.indx, t1.tickets_id, t2.* FROM ticket_2_question as t1 INNER JOIN questions as t2 ON t1.q_id=t2.id WHERE t1.tickets_id=$ticketId ORDER BY t1.indx";
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
        $db->close();
        return $db->lastInsertRowID();
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

    protected function removeQuestionicket(){
        $db = new SQLite3(DB."db.sqlite");
        $ticketId = $this->data->ticketId;
        $questionId = $this->data->qId;
        $db->exec("DELETE FROM ticket_2_question WHERE tickets_id=$ticketId AND q_id=$questionId");
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
       if(isset($_SESSION['logged'])) return array("logged"=>true, "id"=>$_SESSION['userId'], "role"=>$_SESSION['role'], "login"=>$_SESSION["login"], "name"=>$_SESSION["name"], "email"=>$_SESSION["email"]);
        if(isset($_COOKIE["login"]) && isset($_COOKIE["password"])){
            $db = new SQLite3(DB."db.sqlite");
            $sql = "SELECT id, login, name, email, role FROM users WHERE login=:login AND password=:password";
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
            $_SESSION['id'] = $row['id'];
            $stmt->close();
            return array("logged"=>($row['login']!=null), "id"=>$row["id"], "role"=>$row["role"], "login"=>$row["login"], "name"=>$row["name"], "email"=>$row["email"]);
        }
        else
            return false;
    }

    protected function getProfile(){
        $db = new SQLite3(DB."db.sqlite");
        $id = $_SESSION['userId'];
        $sql = "SELECT id, login, name, email, role, confirmed FROM users WHERE id=$id";
        $res = $db->query($sql);
        $result = $res->fetchArray(SQLITE3_ASSOC);
        $db->close();
        return $result;
    }

    function addNewUser($token = ''){
        $login = $this->data->login;
        $name = $this->data->name;
        $email = $this->data->email;
        $role = $this->data->role;
        $confirmed = ($token=='') ? 1:0;
        $role = (array_key_exists("role", $_POST)) ? $_POST['role'] : 3;
        if(isset($login) && isset($this->data->password) && isset($role)){
            $db = new SQLite3(DB."db.sqlite");
            $password = md5($this->data->password);
            $sql = "INSERT INTO users(login, name, password, email, role, token, confirmed) VALUES('$login', '$name', '$password', '$email', '$role', '$token', '$confirmed')";
            $db->exec($sql);
            $userId = $db->lastInsertRowID();
            $db->close();
            return $userId;
        }
    }

    function editUser(){
        $login = $this->data->login;
        $name = $this->data->name;
        $email = $this->data->email;
        $id = $this->data->id;
        $role = $this->data->role;
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("UPDATE users SET login='$login', name='$name', role=$role, email='$email' WHERE id=$id");
        $db->close();
        return true;
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

    function getUsers(){
        $db = new SQLite3(DB."db.sqlite");
        $sql = "SELECT id, name, login, email, role, action_time FROM users";
        $res = $db->query($sql);
        $currentTime = time();
        while($user = $res->fetchArray(SQLITE3_ASSOC)){
            $online = ($user['action_time']==0) ? -1 : (($currentTime-$user['action_time']>60*5)?0:1);
            $user['state'] = $online;
            $users[] = $user;
        }
        $db->close();
        return $users;
    }

    protected function login(){
        if(isset($this->data->login) && isset($this->data->password) && strlen($this->data->login)<128 && strlen($this->data->password)<128){
            $db = new SQLite3(DB."db.sqlite");
            $password = md5($this->data->password);
            $sql = "SELECT id, login, role FROM users WHERE login=:login AND password=:password";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':login', $this->data->login);
            $stmt->bindParam(':password', $password);
            $result = $stmt->execute();
            
            if($result!=false && $result!=null){
                $user = $result->fetchArray(SQLITE3_ASSOC);
                setcookie("login", $_POST['login'], time() + 30*24*3600);
                setcookie("userid", $user['id'], time() + 30*24*3600);
                setcookie("password", $password, time() + 30*24*3600);
                $_SESSION['logged'] = 1;
                $_SESSION['role'] = $user['role'];
                $_SESSION['userId'] = $user['id'];
                $stmt->close();
                //return $password;
                return ($user!==false);
            }
            else
                return false;
        }
    }

    protected function gen_token(){
        $token = md5(microtime() . 'salt' . time());
        return $token;
    }

    function signin(){
        if(login())
            header('Location: ./');
        else
            header('Location: ./auth.html');  
    }

    function authorize_confirmation(){

    }

    protected function signup(){
        $token = $this->gen_token();
        $user_id = $this->addNewUser($token);
        $link = "https://pddlife.ru/#/confirmation/".$user_id ."/".$token;
        $to      = $this->data->email;
        $subject = 'Подтверждение регистрации';
        $message = 'Для подтверждения регистрации перейдите по ссылке:<br/>';
        $headers  = "From: robot@pddlife.ru\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $message = '<p>Спасибо за регистрацию на сайте www.pddlife.ru</p><p>Для подтверждения регистрации перейдите по ссылке: '.$link.' </p><p>Это письмо сформировано автоматически, отвечать на него не нужно.</p>';
        mail($to, $subject, $message, $headers);
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
        return './img/'.$result['value'];
    }


    protected function save_settings(){
        $db = new SQLite3(DB."db.sqlite");
        $uploadResult = $this->uploadFile($_FILES, 'file');
        $image_name = ($uploadResult['success']) ? $uploadResult['filename'] : "";
        $uploadResult2 = $this->uploadFile($_FILES, 'file_tickets');
        $uploadResult3 = $this->uploadFile($_FILES, 'file_titleimg');
        $image_name_tickets = ($uploadResult2['success']) ? $uploadResult2['filename'] : "";
        $image_title_exam = ($uploadResult3['success']) ? $uploadResult3['filename'] : "";
        $showLogo = $_POST['showLogo'];
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
        if($bgcolor_tickets)
            $db->exec("UPDATE settings SET value='$bgcolor_tickets' WHERE config_name='background-color-tickets'");
        if($image_title_exam)
            $db->exec("UPDATE settings SET value='$image_title_exam' WHERE config_name='image_title_exam'");
        if($showLogo=="0" || $showLogo=="1"){
            $db->exec("UPDATE settings SET value='$showLogo' WHERE config_name='showLogo'");
        }
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
    }
    $app = new Application();
    $app->run();
?>