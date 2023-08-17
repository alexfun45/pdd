import React, {useState, useEffect} from 'react'
import request from '../utils/request'
import CircularProgress from '@mui/material/CircularProgress';
import store from '../store/store'
import {useNavigate} from 'react-router-dom';
import * as actions from '../store/userActions'

export default (props: any) => {
    
    function trySampleRequest(params: any) {
        console.log("params", params);
        //var params = JSON.parse(localStorage.getItem('oauth2-test-params'));
        if (params && params['access_token']) {
          //localStorage.setItem("accessToken", params['access_token']);
          var xhr = new XMLHttpRequest();
          xhr.open('GET',
              'https://www.googleapis.com/drive/v3/about?fields=user&' +
              'access_token=' + params['access_token']);
          xhr.onreadystatechange = function (e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let res = JSON.parse(xhr.response);
                console.log("user", res.user);
                if(res.user){
                    store.dispatch(actions.GoogleSignUp(params['access_token'], res.user));
                }
                //console.log(xhr.response);
            } else if (xhr.readyState === 4 && xhr.status === 401) {
              // Token invalid, so prompt for user permission.
              //oauth2SignIn();
            }
          };
          xhr.send(null);
        } else {
          //oauth2SignIn();
        }
      }

    useEffect(()=>{
        if(props.params){
            let params = props.params;
            if (Object.keys(params).length > 0) {
                if (params['state'] && params['state'] == 'try_sample_request') {
                  trySampleRequest(params);
                }
              }
        }
    }, [props])

    return (
        <div className='wrapper'>
            <div className='mainContainer'>
                <div style={{textAlign: 'center'}}><CircularProgress /></div>
                <div style={{textAlign: 'center'}}>Завершение авторизации...</div>
            </div>
        </div>
    )
}