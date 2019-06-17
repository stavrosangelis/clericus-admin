import {
  GENERIC_UPDATE,
} from "../constants/action-types";

import axios from 'axios';
import {APIPath} from '../../static/constants';

export function checkSession() {
  return (dispatch,getState) => {
    let token = localStorage.getItem('token');
    axios({
      method: 'post',
      url: APIPath+'session',
      crossDomain: true,
      data: {token: token},
    })
    .then(function (response) {
      let responseData = response.data;
      let payload = {};
      if (!responseData.status) {
        localStorage.setItem('token', null);
        payload = {
          loginError: false,
          loginErrorText: '',
          sessionActive: false,
          sessionUser: null
        };
      }
      else {
        payload = {
          sessionActive: true,
        };
      }
      dispatch({
        type: GENERIC_UPDATE,
        payload: payload
      });

    })
    .catch(function (error) {
      console.log(error)
    });

  }
}

export function login(email, password) {
  return (dispatch,getState) => {
    let postData = {
      email: email,
      password: password
    }
    axios({
      method: 'post',
      url: APIPath+'login',
      crossDomain: true,
      data: postData
    })
    .then(function (response) {
      let responseData = response.data;
      let payload = {};
      if (responseData.status) {
        localStorage.setItem('token', responseData.data.token);
        localStorage.setItem('user', JSON.stringify(responseData.data));
        payload = {
          loginError: false,
          loginErrorText: '',
          sessionActive: true,
          sessionUser: responseData.data,
          loginRedirect: true
        };
      }
      else {
        payload = {
          loginError: true,
          loginErrorText: responseData.error,
          sessionActive: false,
          sessionUser: null
        };
      }
      dispatch({
        type: GENERIC_UPDATE,
        payload: payload
      });

    })
    .catch(function (error) {
      console.log(error)
    });
  }
}

export function resetLoginRedirect() {
  return (dispatch,getState) => {
    dispatch({
      type: GENERIC_UPDATE,
      payload: {loginRedirect: false}
    });
  }
}

export function logout() {
  return (dispatch,getState) => {
    localStorage.setItem('token', null);
    localStorage.setItem('user', null);
    let payload = {
      sessionActive: false,
      sessionUser: null
    };
    dispatch({
      type: GENERIC_UPDATE,
      payload: payload
    });
  }
}

export function setPaginationParams(type,params) {
  return (dispatch,getState) => {
    let payload = null;
    if (type==="resources") {
      payload = {
        resourcesPagination: {
          limit:params.limit,
          activeSystemType:params.activeSystemType,
          page:params.page,
        }
      };
    }
    if (type==="people") {
      payload = {
        peoplePagination: {
          limit:params.limit,
          page:params.page,
        }
      };
    }
    if (payload===null) {
      return false;
    }
    dispatch({
      type: GENERIC_UPDATE,
      payload: payload
    });
  }
}

export function getSystemTypes() {
  return (dispatch,getState) => {
    axios({
      method: 'get',
      url: APIPath+'resource-system-types',
      crossDomain: true,
    })
	  .then(function (response) {
      let responseData = response.data;
      if (responseData.status) {
        let payload ={
          systemTypes: responseData.data,
        };
        dispatch({
          type: GENERIC_UPDATE,
          payload: payload
        });
      }
	  })
	  .catch(function (error) {
      console.log(error)
	  });
  }
}

export function loadDefaultEntities() {
  return async(dispatch,getState) => {
    let eventEntity = await loadEntityProperties("Event");
    let organisationEntity = await loadEntityProperties("Organisation");
    let personEntity = await loadEntityProperties("Person");
    let resourceEntity = await loadEntityProperties("Resource");

    let payload = {
      entitiesLoaded: true,
      eventEntity: eventEntity,
      organisationEntity: organisationEntity,
      personEntity: personEntity,
      resourceEntity: resourceEntity,
    }
    dispatch({
      type: GENERIC_UPDATE,
      payload: payload
    });
  }
}

function loadEntityProperties(label) {
  return new Promise((resolve, reject) => {
    let params = {labelId: label}
    axios({
        method: 'get',
        url: APIPath+'entity',
        crossDomain: true,
        params: params
      })
    .then(function (response) {
      let entity = response.data.data;
      resolve(entity);
    })
    .catch((error)=> {
      console.log(error);
    });
  });
}

export function toggleLightBox(value) {
  return (dispatch,getState) => {
    let payload = {
      lightBoxOpen: value
    }
    dispatch({
      type: GENERIC_UPDATE,
      payload: payload
    });
  }
}
export function setLightBoxSrc(src) {
  return (dispatch,getState) => {
    let payload = {
      lightBoxSrc: src
    }
    dispatch({
      type: GENERIC_UPDATE,
      payload: payload
    });
  }
}
