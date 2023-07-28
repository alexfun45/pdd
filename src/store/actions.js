import * as actions from './actionTypes';

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