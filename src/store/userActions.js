import * as actions from './actionTypes';
import request from '../utils/request'

export function fetchUser() {
    return (dispatch) => {
        dispatch(fetchUserBegin());
        request({method: 'post', data:{action: 'getUserRole'}}).then( json => {
            dispatch(fetchUserSuccess(json.user));
            return json.user;
        })
        .catch(error => dispatch(fetchUserFailure(error)));
    }
}

export const fetchUserBegin = () => ({
    type: actions.FETCH_USERS_BEGIN
  });

  export const fetchUserSuccess = users => ({
    type: actions.FETCH_USERS_SUCCESS,
    payload: { users }
  });
  
  export const fetchUserFailure = error => ({
    type: actions.FETCH_USERS_FAILURE,
    payload: { error }
  });
