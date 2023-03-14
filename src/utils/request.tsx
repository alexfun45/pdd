import axios, {AxiosRequestConfig} from 'axios'


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


  service.interceptors.request.use(config=>{
    return config;
  });

  service.interceptors.response.use(
    response => {
        const res = response.data;
        const info = res.reqInfo;
        return res;
    }
  );

  export default service
