import * as actions from './actionTypes';
import request from './utils/request'

export function fetchUsers() {
    return dispatch => {
        dispatch("fetchProductsBegin()");
        return request({method: 'post', data:{action: 'getUserRole'}}).then( json => {
            dispatch(fetchUsersSuccess(json.users));
            return json.users;
        })
        .catch(error => dispatch(fetchUsersFailure(error)));
    }
}

export const fetchUsersBegin = () => ({
    type: actions.FETCH_USERS_BEGIN
  });

  export const fetchUsersSuccess = users => ({
    type: actions.FETCH_USERS_SUCCESS,
    payload: { users }
  });
  
  export const fetchUsersFailure = error => ({
    type: actions.FETCH_USERS_FAILURE,
    payload: { error }
  });

