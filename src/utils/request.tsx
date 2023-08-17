import axios, {AxiosRequestConfig} from 'axios'
import store from '../store/store'
import * as actions from '../store/userActions'

/*declare module "axios" {
  export interface AxiosInstance {
    request<T = any>(config: AxiosRequestConfig): Promise<T>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = any>(
      url: string,
      data?: object,
      config?: AxiosRequestConfig
    ): Promise<T>;
  }
}
*/

const service = axios.create({
    baseURL: "./api/api.php",
    timeout: 7000,
    responseType: 'json',
    maxContentLength: 1000000,
    maxBodyLength: 1000000
  })

  service.interceptors.request.use(
    config => {
      // do something before request is sent
      let state = store.getState();
      //console.log("access", state.user.accessToken);
      if (state.accessToken) {
        // let each request carry token
        // ['X-Token'] is a custom headers key
        // please modify it according to the actual situation
        config.headers['X-Token'] = state.accessToken
      }
      return config
    },
    error => {
      // do something with request error
      console.log(error) // for debug
      return Promise.reject(error)
    }
  )

  service.interceptors.response.use(
    response => {
        const res = response.data;
        if(res.code==201 && res.newToken){
          localStorage.setItem("accessToken", res.newToken);
          store.dispatch(actions.fetchUser());
        }
        if(res.code==50003 || res.code==50004)
          store.dispatch(actions.fetchUserFailure());
        return res;
    }
  );

  export default service
