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
            
        }

        public function run(){
            $result = call_user_method($this->action, $this);
            echo json_encode(array("data"=>$result));
        }

        protected function getPage(){
            $id = $this->data->page_id;
            $page_filename = PAGES . $id . ".html";
            return file_get_contents($page_filename);
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
        
        protected function getTickets($data){
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


    function getAllTickets(){
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
            shuffle($tickets);
            array_splice($tickets, $num);
            $i++;
        }
        return $tickets;
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

    protected function uploadFile($fileUpload){
        $IMAGE_PATH = __DIR__ . '/img/';
        if (!isset($fileUpload['file'])) {
            $error = 'Не удалось загрузить файл.';
        } else {
            $file = $fileUpload['file'];
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
                    $error = $_FILES["file"]["error"];
                }
            }
        }
        return array("success"=>false, "error"=>$error);
    }

    protected function addTicket(){
        $uploadResult = $this->uploadFile($_FILES);
        $image_name = ($uploadResult['success']) ? $uploadResult['filename'] : "";
        $text = $_POST['text'];
        $correct = $_POST['correct'];
        $variants = json_decode($_POST['variants']);
        sleep(1);
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("INSERT INTO tickets(text, image, correct_id) VALUES('$text', '$image_name', '$correct')");
        $ticketId = $db->lastInsertRowID();
        for($i=0;$i<count($variants);$i++){
            $label = $variants[$i]->answer;
            $comment = $variants[$i]->comment;
            $db->exec("INSERT INTO variants(ticket_id, answer, comment) VALUES('$ticketId', '$label', '$comment')");  
        }
        $db->close();
        return $text;
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
            $db->exec("UPDATE variants SET answer='$label', comment='$comment' WHERE ticket_id='$ticketId' AND id='$var_id'");  
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
        $sql = "SELECT id, name, login, email, role FROM users";
        $res = $db->query($sql);
        while($user = $res->fetchArray(SQLITE3_ASSOC)){
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
        $link = "https://dev.traffic-rules.ru/#/confirmation/".$user_id ."/".$token;
        $to      = $this->data->email;
        $subject = 'Подтверждение регистрации';
        $message = 'Для подтверждения регистрации перейдите по ссылке:<br/>';
        $headers  = "From: server\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $message = '<p>Для подтверждения регистрации перейдите по ссылке: '.$link.' </p>';
        mail($to, $subject, $message, $headers);
    }

    protected function email_recovery(){
        $token = $this->gen_token();
        $email = $this->data->email;
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("UPDATE users SET token='$token' WHERE email='$email'");
        $db->close();
        $link = "https://dev.traffic-rules.ru/#/passwordrecovery/".$email ."/".$token;
        $to      = $email;
        $subject = 'Восстановление пароля';
        $headers  = "From: server\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $message = '<p>Для восстановления пароля перейдите по ссылке: '.$link.' </p>';
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

    protected function transliterate($textcyr = null, $textlat = null) {
        $cyr = array(
        'ж',  'ч',  'щ',   'ш',  'ю',  'а', 'б', 'в', 'г', 'д', 'е', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ъ', 'ь', 'я',
        'Ж',  'Ч',  'Щ',   'Ш',  'Ю',  'А', 'Б', 'В', 'Г', 'Д', 'Е', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ъ', 'Ь', 'Я');
        $lat = array(
        'zh', 'ch', 'sht', 'sh', 'yu', 'a', 'b', 'v', 'g', 'd', 'e', 'z', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'c', 'y', 'x', 'q',
        'Zh', 'Ch', 'Sht', 'Sh', 'Yu', 'A', 'B', 'V', 'G', 'D', 'E', 'Z', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'F', 'H', 'c', 'Y', 'X', 'Q');
        if($textcyr) return str_replace($cyr, $lat, $textcyr);
        else if($textlat) return str_replace($lat, $cyr, $textlat);
        else return null;
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
        $pageName = substr($pageName, 0, 16);
        file_put_contents(PAGES.$pageName.".html", $pageContent);
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("INSERT INTO pages(name, title) VALUES('$pageName', '$pageTitle')");
        $db->close();
    }

    // getting top menu
    protected function getMenu(){
        $db = new SQLite3(DB."db.sqlite");
        $res = $db->query("SELECT t1.name, t1.title as menu_title, t3.name as page_name, t3.title FROM menus as t1 LEFT JOIN menu_2_page as t2 ON t1.id=t2.menu_id LEFT JOIN pages as t3 ON t2.page_id=t3.id");
        $menu = array();
        while($row = $res->fetchArray(SQLITE3_ASSOC)){
            if($row['page_name']!=null){
                $menu[$row['name']]['title'] = $row['menu_title'];
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

    protected function getMenuItems(){
        $db = new SQLite3(DB."db.sqlite");
        // query for getting all menu items
        $res = $db->query("SELECT * FROM menus");
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
        $res = $db->query("SELECT t2.* FROM menu_2_page as t1 INNER JOIN pages as t2 ON t1.page_id=t2.id WHERE t1.menu_id=$menu_id");
        $pages = array();
        while($row = $res->fetchArray(SQLITE3_ASSOC))
            $pages[] = $row;
        return $pages;
    }

    protected function addPageMenu(){
        $db = new SQLite3(DB."db.sqlite");
        $menu_id = $this->data->menu_id;
        $page_id = $this->data->page_id;
        $db->exec("INSERT INTO menu_2_page(menu_id, page_id) VALUES($menu_id, $page_id)");
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
        while($row = $res->fetchArray(SQLITE3_ASSOC))
            $settings[$row['config_name']] = $row['value'];
        $db->close();
        return $settings;
    }

    protected function save_settings(){
        $db = new SQLite3(DB."db.sqlite");
        $uploadResult = $this->uploadFile($_FILES);
        $image_name = ($uploadResult['success']) ? $uploadResult['filename'] : "";
        $bgcolor = $_POST['bgcolor'];
        if($bgcolor)
            $db->exec("UPDATE settings SET value='$bgcolor' WHERE config_name='background-color'");
        if($image_name)
            $db->exec("UPDATE settings SET value='$image_name' WHERE config_name='background-image'");
        $db->close();
        }

    protected function removeBgImage(){
        $db = new SQLite3(DB."db.sqlite");
        $db->exec("UPDATE settings SET value='' WHERE config_name='background-image'");
        $db->close();
        }
    }
    $app = new Application();
    $app->run();
?>