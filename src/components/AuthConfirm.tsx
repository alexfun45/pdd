import React, {useEffect, useState} from "react";
import request from "../utils/request";
import { useParams } from "react-router-dom";
export default (props: any) => {
    const [isSuccess, setResult] = useState(false);
    const params = useParams();
    useEffect(()=>{
        request({method: "post", data: {action: "checkToken", data: {userId: params.userid, token: params.secret}}}).then(response=>{
            const {data} = response;
            setResult(data);
            if(data==true){
                setTimeout(()=>{
                    document.location.href = "./";
                }, 3000);
            }
        });
    }, []);
    return (
        <div style={{marginTop: "40px", textAlign: "center", fontSize: "18px"}}>
          {(isSuccess) ? 
            (
                <div style={{color: "#67c167"}}>Вы успешно подтвердили свою почту</div>
            ) :
            (
                <div style={{color: "rgb(218, 55, 55)"}}>Ваш ключ подтверждения не прошел проверку</div>
            )

          } 
        </div>
    )
}