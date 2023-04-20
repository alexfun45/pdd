import React, {useState, useEffect} from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import {useForm} from 'react-hook-form'
import $ from 'jquery'

type InputSignInTypes = { 
    answer: string;
    comment: string;
  };

type varType = {
    answer: string;
    comment: string;
}

type QuestionType = {
    id: number;
    code_id: string;
    title: string;
    image?: string;
    correct?: number;
    variants?: Array<varType>
  } | null;

type ValidateQuestionType = {
    id: number;
    code_id: string;
    title?: string;
    image?: string;
    correct?: number;
    variants: Array<varType>
}

const Answer = ({reg, errors, answer, indx, handleChangeQuestions, setCorrect, correct}: {reg: any, errors: any, answer:InputSignInTypes, indx: number, handleChangeQuestions: Function, setCorrect: Function, correct: number}) => {
  
    return (
        <div key={indx} className="variant-section">
            <Form.Group controlId="validationCustom03">
                <input type="radio" onChange={(e)=>setCorrect(e.target.value)} name="correct[]" value={indx} checked={indx==correct} style={{float: "left", marginRight: "3px", marginTop: "6px"}} />
                <Form.Control onChange={(e)=>handleChangeQuestions(e.target.value, "answer", indx)} key={"answer"+indx} name={"answer"+indx} value={answer.answer} type="text" placeholder="текст ответа" required />
                <div className="input-label">текст варианта ответа</div>
                {/*<input type="text" onChange={(e)=>handleChangeQuestions(e.target.value, "answer", indx)} key={"answer"+indx} name={"answer"+indx} value={answer.answer} className="text var_text required ui-widget-content ui-corner-all" />
                */}
            </Form.Group>
            <Form.Group controlId="validationCustom03">

            </Form.Group>
            <div style={{paddingLeft: "16px"}}>
                <Form.Control placeholder="комментарий" type="text" name="comment" onChange={(e)=>handleChangeQuestions(e.target.value, "comment", indx)} id="comment" value={answer.comment}></Form.Control>
                <div className="input-label">комментарий к варианту ответа</div>
                {/*<input type="text" name="comment" onChange={(e)=>handleChangeQuestions(e.target.value, "comment", indx)} id="comment" value={answer.comment} className="text ui-widget-content ui-corner-all" /> */}
            </div>
        </div> 
    )
}




var formData = new FormData(),
    defaultAnswer = {answer: "", comment: ""};

export default ({show, setShow, Question, setSelectedQue, setQuestions, update}: {show: boolean, setShow:Function, Question: QuestionType, setSelectedQue: Function, setQuestions: Function, update: Function}) => {
    const [validated, setValidated] = useState(false);
    const [text, setText] = useState(Question?.title || ""),
          [codeId, setCodeId] = useState(""),
          [img, setImg] = useState(Question?.image || ""),
          [deleteShow, setDeleteShow] = useState(false),
          [correct, setCorrect] = useState(Question?.correct || 0);
    let [answers, setAnswers] = useState<any[] | []>(Question?.variants || []);

    useEffect(()=>{
        setText(Question?.title || "");
        setCodeId(Question?.code_id || "");
        setAnswers(Question?.variants || [defaultAnswer]);
        setCorrect(Question?.correct || 0);
        setImg(Question?.image || "");
    }, [Question]);

    const handleSubmit1 = (event: any) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
    
        setValidated(true);
      };
    

    const handleCloseDeleteDialog = () => {
        setDeleteShow(false);
    }

    const uploadImage =(e: React.ChangeEvent<HTMLInputElement>) => {
        let file = (e.target.files) ? e.target.files[0]:'';
        formData.append('file', file);
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        //formData.append("text", e.target.value);
        setText(e.target.value);
    }

    const handleChangeQuestions = (v: string, prop: string, indx: number) => {
        let q = [...answers];
        q[indx][prop] = v;
        setAnswers(q);
    }

    const addQuestion = () => {
        let newQ = [...answers, {answer: '', comment: ''}];
        setAnswers(newQ);
    }

    const onSubmit = (event: any) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();
        setValidated(true);
        if(form.checkValidity()===false)
            return true;
        if(Question!==null){
            formData.append("action", "editQuestion");
            formData.append("qId", (Question?.id||0).toString());
        }
        else{
            formData.append("action", "addQuestion");
        }
        formData.append("text", text);
        formData.append("codeId", codeId);
        formData.append("correct", correct.toString());
        formData.append("variants", JSON.stringify(answers));

        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: './api/api.php',
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            timeout: 800000,
            success: function(data) {
                formData.delete('action');
                formData.delete('ticket_id');
                formData.delete('text');
                formData.delete('variants');
                formData.delete('correct');
                formData.delete('file');
                if(Question==null){
                    setQuestions((prev:QuestionType[])=>{
                        return [...prev, {id: data, code_id:codeId, title: text}];
                    });
                }
                else{
                    update();
                }
                setText("");
                setCodeId("");
                setImg("");
                setAnswers([{answer: '', comment: ''}]);
            },
            error: function(e) {
              console.log("ERROR : ", e);
            }
          });
    }

    const handleRemove = () => {
        setDeleteShow(true);
    }

    const remove = () => {
        setDeleteShow(false);
    }

    const handleInputId = (e: React.ChangeEvent<HTMLInputElement>) => {
            setCodeId(e.target.value);
    }

    const { register, handleSubmit, setError, watch, setValue, formState: { errors } } = useForm<ValidateQuestionType>({mode: 'onBlur'});
    
    return (
        <>
            <Modal
                show={deleteShow}
                animation={true}
                onHide={() => handleCloseDeleteDialog()}
                >
                  <Modal.Header closeButton>
                    <Modal.Title id="example-custom-modal-styling-title">
                        Удаление
                    </Modal.Title>
                    </Modal.Header>  
                    <Modal.Body>
                        <div>Вы действительно хотите удалить билет?</div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={remove} variant="primary" className="btn-danger">Да</Button>
                        <Button onClick={()=>setDeleteShow(false)} variant="secondary">Отмена</Button>
                    </Modal.Footer>
            </Modal>
            <div className={show ? "QuestionForm":"hide"}>    
                <Button onClick={()=>setShow(false)} variant="link"><i className="bi bi-chevron-left"></i>К списку вопросов</Button>
                <Form className="qForm" noValidate validated={validated} onSubmit={onSubmit}>
                    <Form.Group controlId="validationCustom01">
                        <Form.Label>код идентификатора id</Form.Label>
                        <Form.Control
                            onChange={handleInputId} 
                            value={codeId} type="text"
                            name="text"
                            id="ticket_codeid"
                            required
                            placeholder="Код идентификатора id"
                            defaultValue=""
                        />
                    </Form.Group>
                    <Form.Group controlId="validationCustom02">
                        <Form.Label>Текст вопроса</Form.Label>
                        <Form.Control
                            onChange={handleInput} 
                            value={text} type="text"
                            name="text"
                            id="ticket_text"
                            required
                            placeholder="Текст вопроса"
                            defaultValue=""
                        />
                    </Form.Group>
                    <Form.Group controlId="validationCustom03">
                        <Form.Label>Изображение</Form.Label>
                        <div className={(Question?.image=="")?"hide":""}><img style={{maxWidth: "90%"}} src={(Question?.image!="")?("./img/"+Question?.image):""} id="t_img" /></div>
                        <input style={{width: "100%"}} type="file" accept="image/*" onChange={uploadImage} name="files[]" id="ticket_image" className="ui-widget-content ui-corner-all" />
                    </Form.Group>
                        <div className="answers_block">
                            {
                                    answers.map((v, i)=>(
                                        <Answer reg={register} errors={errors} answer={v} handleChangeQuestions={handleChangeQuestions} indx={i} setCorrect={setCorrect} correct={correct}/>
                                    ))
                            }
                        <span id="add_var" onClick={addQuestion} className="add-btn">+</span>
                        </div>
                    <Button type="submit">Сохранить</Button>
                </Form>
                </div>
            </>
    )
}