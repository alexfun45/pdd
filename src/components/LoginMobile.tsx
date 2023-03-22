import Form from 'react-bootstrap/Form';
import '../css/auth_mobile.css'

export default () => {
    return (
        <div className="mobileLoginWrapper">
           <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Логин</Form.Label>
                    <Form.Control type="email" placeholder="name@example.com" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Пароль</Form.Label>
                    <Form.Control type="password"/>
                </Form.Group>
           </Form>
        </div>
    )
}