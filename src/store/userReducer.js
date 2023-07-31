import {
    FETCH_USER_BEGIN,
    FETCH_USER_SUCCESS,
    FETCH_USER_FAILURE,
    LOGOUT_USER
  } from './actionTypes';

  function getRandomUserId(){
    return (new Date()).getTime();
  }

  const initialState = {
    user: {
        id: getRandomUserId(),
        login: "unlogged",
        name: "",
        email: "",
        confirmed: 0,
        role: -1,
        reg_date:0,
        last_auth:0,
        isMobile: false,
        settings: {}
      },
    loading: false,
    error: null
  };
  
  export default function usersReducer(state = initialState, action) {
    switch(action.type) {
      case FETCH_USER_BEGIN:
        // Mark the state as "loading" so we can show a spinner or something
        // Also, reset any errors. We're starting fresh.
        return {
          ...state,
          loading: true,
          error: null
        };
  
      case FETCH_USER_SUCCESS:
        // All done: set loading "false".
        // Also, replace the items with the ones from the server
        return {
          ...state,
          loading: false,
          user: action.payload
        };
  
      case FETCH_USER_FAILURE:
        // The request failed. It's done. So set loading to "false".
        // Save the error, so we can display it somewhere.
        // Since it failed, we don't have items to display anymore, so set `items` empty.
        //
        // This is all up to you and your app though:
        // maybe you want to keep the items around!
        // Do whatever seems right for your use case.
        console.log("failure");
        return initialState;
      
      case LOGOUT_USER:
        return initialState;
  
      default:
        // ALWAYS have a default case in a reducer
        return state;
    }
  }