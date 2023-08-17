<?php
    class Module{
        function __construct($actname, $path, $data){
                $this->action = $actname;
                if($this->action=="get_configs"){
                    $tmp_path = preg_replace("^\/(.*)$", "$1", $path);
                    //echo "tmp_path=".$tmp_path." ";
                }
                $path_parts = explode("/", $path);
                
                if(count($path_parts)==2){
                    $regexp = "/^\/(\w*)\/?/";
                    $replacement = "\/*$1*";
                }
                else if(count($path_parts)==3){
                    $regexp = "/^\/(\w*)\/?(\w*)?\/?/";
                    $replacement = "\/*$1*\/*$2*";
                }
                //if($this->action=="get_configs")
                    //echo $regexp;
                if($path!="/")
                    $p = preg_replace($regexp, $replacement, $path);
                else
                    $p = $path;
                $p = __WRK . $p;   
                $g = glob($p, GLOB_ONLYDIR);
                //$this->path = __WRK . $path;
                $this->path = $g[0];
                $this->data = $data;
            }
            
        public function action(){
                return call_user_func(array($this, $this->action));
            }

        public function getShellReturn(){
                $shellReturned = file_get_contents(LOG."feedback.alert");
                if($shellReturned!="")
                    unlink(LOG."feedback.alert");
                $shellReturned = explode(":", $shellReturned);
                return array("res"=>trim($shellReturned[0]), "message"=>trim($shellReturned[1]));
            }
    }
?>