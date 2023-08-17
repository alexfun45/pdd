import * as actions from './actionTypes';
import Profile from '../lib/profileManager'
import AuthService from '../services/Auth'

export function fetchUser() {
    return async (dispatch) => {
        dispatch(fetchUserBegin());
        //let user = await Profile.getUserProfile();
        let user = AuthService.getUser();
        if(user){
          dispatch(fetchUserSuccess(user));
          dispatch(getRole());
        }
        else
          dispatch(fetchUserFailure());
    }
}

export function getRole(){
  return async (dispatch) => {
    let role = await AuthService.getRole();
    if(role)
      dispatch(setUserRole(role));
  }
}

export const setUserRole = (role) => {
  return {
    type: actions.SET_USER_ROLE,
    payload: role
  }
}

export const fetchUserBegin = () => ({
    type: actions.FETCH_USERS_BEGIN
  });

  export const fetchUserSuccess = user => ({
    type: actions.FETCH_USER_SUCCESS,
    payload: user
  });
  
  export const fetchUserFailure = error => ({
    type: actions.FETCH_USERS_FAILURE,
    payload: { error }
  });

export const LoginUserBegin = () => ({
  type: actions.LOGIN_USER_BEGIN
})

export const Login = ({login, password}) => {
  return async (dispatch) => {
    dispatch(fetchUserBegin());
    //let user = await Profile.Login(login, password);
    let res = await AuthService.login(login, password);
    if(res!==false){
      dispatch(LoginUserSuccess(res.accessToken));
      document.location.href = "./"
    }
    else
      dispatch(LoginUserFailure());
  }
}

export const GoogleSignUp = (googleToken, user) => {
  return async (dispatch) => {
    dispatch(fetchUserBegin());
      let res = await AuthService.google_signup(googleToken, user);
      if(res!==false){
        dispatch(LoginUserSuccess(res.accessToken));
        document.location.href = "./"
      }
      else
        dispatch(LoginUserFailure());
  }
}

export const LoginUserSuccess = (accessToken) => ({
  type: actions.LOGIN_USER_SUCCESS,
  payload: accessToken
})

export const LoginUserFailure = () => ({
  type: actions.LOGIN_USER_FAILURE
})

export const Logout = () => {
  AuthService.signout();
  return {
    type: actions.LOGOUT_USER
  }
}
