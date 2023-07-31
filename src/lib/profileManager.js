import request from '../utils/request'

export default class Profile{

    static async getUserProfile(){
        if(window.localStorage.getItem('user')!=null && window.localStorage.getItem('user')!="false"){
            return JSON.parse(window.localStorage.getItem('user'));
        } 
        else{
            try{
                request({method: 'post', data:{action: 'getUserRole'}}).then( response => {
                    const {data} = response;
                    if(data!=false){
                        return data;
                    }
                    else
                        return false;
                });
            } catch(err){
                console.log("err", err);
            }
        } 
    }

    static async Logout(){
        request({method: 'post', data:{ action: 'Logout'}});
        window.localStorage.clear();
        document.location.href = "./";
    }

}

/*export const getUserProfile = async() => {

    if(window.localStorage.getItem('user')!=null && window.localStorage.getItem('user')!="false"){
        return JSON.parse(window.localStorage.getItem('user'));
    } 
    else{
        request({method: 'post', data:{action: 'getUserRole'}}).then( response => {
            const {data} = response;
            if(data!=false){
                return data;
            }
            else
                throw new Error("user is not exist"); 
        });
    }
}*/