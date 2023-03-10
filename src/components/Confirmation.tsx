import "../css/auth.css"
export default () => {
    setTimeout(()=>{
        document.location.href = "./";
    }, 3000);
    return (
        <div style={{margin: "50px auto", textAlign: "center", fontSize: "22px"}}>
            На ваш e-mail придет письмо для подтверждения регистрации
        </div>
    )
}