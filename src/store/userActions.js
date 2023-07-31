import * as actions from './actionTypes';
import Profile from '../lib/profileManager'

export function fetchUser() {
    return async (dispatch) => {
        dispatch(fetchUserBegin());
        
          let user = await Profile.getUserProfile();
          if(user)
            dispatch(fetchUserSuccess(user));
          else
            dispatch(fetchUserFailure());
    }
}

export const fetchUserBegin = () => ({
    type: actions.FETCH_USERS_BEGIN
  });

  export const fetchUserSuccess = user => ({
    type: actions.FETCH_USER_SUCCESS,
    payload: {
      ...user
    } 
  });
  
  export const fetchUserFailure = error => ({
    type: actions.FETCH_USERS_FAILURE,
    payload: { error }
  });

export const Logout = () => {
  Profile.Logout();
  return {
    type: actions.LOGOUT_USER
  }
}
