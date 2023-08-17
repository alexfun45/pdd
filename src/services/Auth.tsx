import request from '../utils/request'

class AuthService {

    static getUser(){
        const accessToken = localStorage.getItem('accessToken');
        if(accessToken){
            return accessToken;
        }
        else
            return false;
    }

    static async getRole(){
        return await request({method: 'post', data:{action: 'getRole'}}).then(response=>{
            return response.data;
        });
    }

    static async login(login: string, password: string){
        return request({method: 'post', data:{action: 'signIn', data: {login: login, password: password}}}).then(response=>{
            if(response.data.accessToken)
                localStorage.setItem("accessToken", response.data.accessToken);
            return response.data;
        })
    }

    static async google_signup(googleAccessToken: string, user: any){
        localStorage.setItem('oauth2-test-params', googleAccessToken);
        return await request({method: 'post', data: {action: 'google_auth', data:{gtoken: googleAccessToken, user: user}}}).then((response)=>{
            if(response.data.accessToken)
                localStorage.setItem("accessToken", response.data.accessToken);
            return response.data;
        })
    }

    static revokeAccess(accessToken:string) {
        // Google's OAuth 2.0 endpoint for revoking access tokens.
        var revokeTokenEndpoint = 'https://oauth2.googleapis.com/revoke';
      
        // Create <form> element to use to POST data to the OAuth 2.0 endpoint.
        var form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', revokeTokenEndpoint);
      
        // Add access token to the form so it is set as value of 'token' parameter.
        // This corresponds to the sample curl request, where the URL is:
        //      https://oauth2.googleapis.com/revoke?token={token}
        //let accessToken = 'xJYSnBxr8_gdv0erGM0t7nd_0i9wm6sktH2d3nkzFJxfsX7KG2M79si4T0NNKGzk3mwNgY_7AL_83rbxRJaCgYKAcQSARMSFQHsvYlsaIpe61EUhTtT3tshvsICrw0163';
        //let accessToken = localStorage.getItem('oauth2-test-params');
        var tokenField = document.createElement('input');
        tokenField.setAttribute('type', 'hidden');
        tokenField.setAttribute('name', 'token');
        tokenField.setAttribute('value', accessToken);
        form.appendChild(tokenField);
      
        // Add form to page and submit it to actually revoke the token.
        //document.body.appendChild(form);
        form.submit();
      
      }

    static signout(){
        AuthService.revokeAccess(localStorage.getItem("oauth2-test-params"));
        localStorage.removeItem("accessToken");
        localStorage.removeItem("oauth2-test-params");
    }

    static async getUserRole(){
        return request({method: 'post', data:{action: 'getRole'}}).then(response=>{
            return response.data;
        })
    }
}

export default AuthService