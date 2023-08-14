import React, {useState, useEffect, useRef} from "react";
import {ListGroup, Button} from 'react-bootstrap';
//import CreateTicket from "./Tickets/createTicketDialog"
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import QuestionForm from './QuestionForm'
import DeleteDialog from './Tickets/DeleteDialog'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import request from "../utils/request";

type varType = {
    answer: string;
    comment: string;
}

type TicketQuestionType = {
    ticket_id: number;
    id: number;
    indx: number;
    code_id: string;
    title: string;
    image: string;
    correct: number;
}

type QuestionType = {
    id: number;
    indx: number;
    code_id: string;
    title: string;
    image: string;
    correct: number;
    variants: Array<varType>
} | null;

type TicketType = {
    id: number;
    name: string;
} | null;

type SubjectType = {
    id: number;
    name: string;
} | null;

var removedIndx = 0,
    removeMethod: Function,
    qId = 0,
    options:any[] = [],
    changePostionLock = false,
    ItemNewName = "";

export default () => {

    const [subjects, setSubjects] = useState<SubjectType[]>([]),
          [selectedSubject, setSelectedSubject] = useState<number|0>(0),
          [Questions, setQuestions] = useState<QuestionType[] | []>([]),
          [subjectQuestions, setSubjectQue] = useState<QuestionType[]>([]),
          [selectedQuestion, setSelectedQue] = useState<QuestionType|null>(null),
          [newSubjectName, setSubjectName] = useState(""),
          [isEdit, setEditMode] = useState(false),
          [showNewSubject, setShowNewSubject] = useState(false),
          [show, setShow] = useState(false),
          [deleteDialogShow, setDeleteDialog] = useState(false),
          [search, setSearchValue] = useState<string>(""),
          [subjectNum, setSubjectNum] = useState(0),
          [filtered, setFiltered] = useState<QuestionType[] | []>([]),
          [renameItemId, setRenameId] = useState(0),
          [sortOrder, setSortOrder] = useState("asc"),
          textInput:React.RefObject<HTMLInputElement> = React.useRef(),
          defaultTicket = {text: "", id: 1, image: "", correct_id: 0, variants: [{answer: '', comment: ''}]};  


    useEffect(()=>{
        if(show==false){
            setEditMode(false);
        }
        else{
            return;
        }
        getSubjects();
        getSubjectQuestions(setQuestions);
        }, []);
    
    useEffect(()=>{
        if(Questions.length>0){
            for(let i=0;i<Questions.length;i++){
                options[i] = {label: Questions[i].code_id, id: Questions[i].id}
            }
        }
    }, [Questions]);

    useEffect(()=>{
        if(selectedSubject!=0)
            getSubjectQuestions(setSubjectQue);
    }, [selectedSubject]);

    useEffect(()=>{
        setSubjectNum(subjectQuestions.length);
    }, [subjectQuestions]);


    const getSubjects = () => {
            request({method: 'post', data:{action: 'getSubjects'}}).then( response => {
                const {data} = response;
                setSubjects(data);
                setEditMode(false);
            });
        }

    const updateSubjectQuestions = () => {
        getSubjectQuestions(setSubjectQue);
        getSubjectQuestions(setQuestions);
        setSubjectNum(subjectQuestions.length);
    }

    const getSubjectQuestions = (method: Function, ) => {
        request({method: 'post', data:{action: 'getSubjectQuestions', data: {subjectId: selectedSubject}}}).then( response => {
            const {data} = response;
            method(data);
        });
    }
    
    const selectSubject = (id: number | 0) => {
        setSelectedSubject(id);
    }

    const selectQuestion = (q: QuestionType | null)=>{
        setSelectedQue(q);
    }

    const selectQuestion2 = (q: QuestionType | null)=>{
        setSelectedQue(q);
    }

    const handleChangeSubjectName = (event: any) => {
        setSubjectName(event.target.value);
    }


    const handleKeyDownSubject = (e: any) => {
        if(e.keyCode==13){
            ItemNewName = e.target.value;
            createSubject();
        }
    }

    const createSubject = () => {
        ItemNewName =(ItemNewName=="")? textInput.current.value:ItemNewName;
        request({method: "post", data: {action: "addSubject", data: {subject_name: ItemNewName}}}).then(response=>{
            const {data} = response;
            setSubjects(prev=>([...subjects, {id: data, name: ItemNewName}]));
            ItemNewName = "";
            setShowNewSubject(false);
        });
    }

    const removeSubject = () => {
        request({method: "post", data: {action: "removeSubject", data: {subject_id: qId}}}).then(()=>{
            getSubjects();
        });
    }

    const removeQuestion = () => {
        let copyQuestions = [...Questions];
        copyQuestions.splice(removedIndx, 1);
        setQuestions(copyQuestions);
        let findItem = subjectQuestions.findIndex(item=>(item!==null)?item.id==qId:false);
        if(findItem!==undefined){
            copyQuestions = [...subjectQuestions];
            copyQuestions.splice(findItem, 1);
            //setTicketQue(copyQuestions);
        }
        request({method: "post", data: {action: "removeQuestion", data: {qId: qId}}}).then(()=>{
            if(filtered.length>0){
                getSubjectQuestions(setQuestions);
                setFiltered([]);
                setSearchValue("");
            }
        });
    }

    const handleEditQuestion = (question: QuestionType) => {
        setSelectedQue(question);
        setEditMode(true);
    }

    const createQuestion = () => {
        setSelectedQue(null);
        setEditMode(true);
    }

    const addQueToSubject = () => {
        if(selectedQuestion!=null && (subjectQuestions.findIndex(item=>item.id==selectedQuestion.id))===-1){
            // determine next indx of ticket question array
            let max_indx = (subjectQuestions.length>0) ? (subjectQuestions[subjectQuestions.length-1].indx + 1) : 1;
            request({method: "post", data: {action: "addQueToSubject", data: {subjectId: selectedSubject, qId: selectedQuestion.id, next_indx: max_indx}}}).then(response=>{
                setSubjectQue(prev=>[...prev, {...selectedQuestion, indx: max_indx}]);
            });
        }
    }

    const removeSubjectQuestion = () => {
        let copyQuestions = [...subjectQuestions];
        copyQuestions.splice(removedIndx, 1);
        setSubjectQue(copyQuestions);
        request({method: "post", data: {action: "removeQuestionSubject", data: {subjectId: selectedSubject, qId: qId}}});
    }

    const handleRemoveSubjectQuestion = (queId: number, indx: number) => {
        setDeleteDialog(true);
        removeMethod = removeSubjectQuestion;
        removedIndx = indx;
        qId = queId;
    }

    const handleRemoveQuestion = (queId: number = 0, indx: number) => {
        setDeleteDialog(true);
        removeMethod = removeQuestion;
        removedIndx = indx;
        qId = queId;
        
    }

    const handleRemoveSubject = (sId: number) => {
        setDeleteDialog(true);
        qId = sId;
        removeMethod = removeSubject;  
    }

    function sortArrayAsc(prev: QuestionType, next: QuestionType){
        if (prev.indx > next.indx) return 1;
        if (prev.indx == next.indx) return 0;
        if (prev.indx < next.indx) return -1;
        return 0;
    }

    const toUpPos = (i: number) => {
        if(i!=0 && !changePostionLock){
            changePostionLock = true;
            let topItemIndx = 0,
                setter,
                copySubjectQuestions = [];
            copySubjectQuestions = [...subjectQuestions];
            topItemIndx = subjectQuestions[i-1].indx;
            
            copySubjectQuestions[i-1].indx = copySubjectQuestions[i].indx;
            copySubjectQuestions[i].indx = topItemIndx;
            copySubjectQuestions.sort(sortArrayAsc);
            setSubjectQue(copySubjectQuestions);
            request({method: "post", data: {action: "changeTicketPos", data: {firstItem: copySubjectQuestions[i-1], secondItem: copySubjectQuestions[i]}}}).then(response=>{
                changePostionLock = false;
            });
        }
    }

    const toDownPos = (i: number) => {
        if(i<(subjectQuestions.length-1)){
            changePostionLock = true;
            let nextIndx = 0,
                setter,
                copySubjectQuestions = [];

                copySubjectQuestions = [...subjectQuestions];
            nextIndx = subjectQuestions[i+1].indx;
            
            copySubjectQuestions[i+1].indx = copySubjectQuestions[i].indx;
            copySubjectQuestions[i].indx = nextIndx;
            copySubjectQuestions.sort(sortArrayAsc);
            setSubjectQue(copySubjectQuestions);
            request({method: "post", data: {action: "changeTicketPos", data: {firstItem: copySubjectQuestions[i+1], secondItem: copySubjectQuestions[i], subject_id:copySubjectQuestions[i].id}}}).then(response=>{
                changePostionLock = false;
            });
        }
    }

    const handleRenameItem = (ticketId: number) => {
        setRenameId(ticketId);
        ItemNewName = "";
    }

    const handleChangeItemName = (e: React.ChangeEvent<HTMLInputElement>) => {
        ItemNewName = e.target.value;
    }

    const cancelEdit = () => {
        setRenameId(0);
    }

    const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLDivElement>) => {
        if(e.keyCode==27)
            cancelEdit();
        if(e.keyCode==13){
          if(renameItemId!=0 && ItemNewName!=""){
            request({method: "post", data: {action: "renameSubject", data: {id: renameItemId, newName: ItemNewName}}}).then(()=>{
                setRenameId(0);
                let copy;
                copy = [...subjects];
                copy[i].name = ItemNewName;
                setSubjects(copy);
                ItemNewName = "";
            });
          }
        }
    }

    const getNumber = (__str: string) => {
        return parseInt(__str.replace(/^\D+/g, ''));
    }

    const sortTicket = () => {
        let copySubjects = [...subjects];
        if(sortOrder=='asc'){
            copySubjects.sort((a, b)=>getNumber(a.name)<getNumber(b.name)?1:-1);
            setSortOrder('desc');
        }
        else{
            copySubjects.sort((a, b)=>getNumber(b.name)<getNumber(a.name)?1:-1);
            setSortOrder('asc');
        }
        setSubjects(copySubjects);
    }

    const handleCreateButton = () => {
        let list = document.getElementById('listItems');
        list.scrollTop = list.scrollHeight;
        textInput.current.focus();
        setShowNewSubject(true);
    }

    return (
        <>
          <div className="block-wrapper">
                <DeleteDialog show={deleteDialogShow} setShow={setDeleteDialog} title="Вы действительно хотите произвести удаление?" removeMethod={removeMethod}/>
                <div className="col-30">
                        <div className="col-title">Темы<Button onClick={handleCreateButton} variant="outline-success">+ Создать</Button></div>
                        <div style={{textAlign: 'left'}}><span onClick={sortTicket} style={{fontSize: '12px', color: '#3c96e6', cursor: 'pointer'}}>сортировать<i className={(sortOrder=="asc")?"bi bi-arrow-down":"bi bi-arrow-up"}></i></span></div>
                        <ListGroup id="listItems">
                            {
                                subjects.map((value:SubjectType, i: number) => {
                                    return <ListGroup.Item action id={(value?.id || '').toString()} onClick={(e)=>selectSubject(value?.id || 0)} onDoubleClick={()=>handleRenameItem(value?.id || 0)} eventKey={value?.id}><span className={renameItemId==value.id?"":"hide"}><TextField defaultValue={value?.name} onKeyDown={(e)=>handleKeyDown(i, e)} onChange={handleChangeItemName} style={{width: '70%'}} label="" /></span><span className={renameItemId==value.id?"hide":""}>{value?.name}</span><div className="right-panel"><span><i onClick={()=>handleRenameItem(value?.id || 0)} className={renameItemId!=value.id?"bi bi-pencil-fill":"hide"}></i><i onClick={()=>handleRemoveSubject(value?.id || null)} className={renameItemId!=value.id?"bi bi-trash3-fill":"hide"}></i><Button onClick={()=>cancelEdit()} className={renameItemId==value.id?"":"hide"} style={{fontSize:"11px", marginTop: '7px'}} variant="danger">отмена</Button></span></div></ListGroup.Item> 
                                })      
                            }
                        <InputGroup className={(showNewSubject)?"mb-3":"hide"}>
                            <Form.Control
                                ref={textInput}
                                onKeyDown={handleKeyDownSubject}
                                placeholder="имя новой темы"
                                defaultValue={newSubjectName}
                                type="text"
                                id="inputPassword5"
                                aria-describedby="passwordHelpBlock"
                            />
                            <InputGroup.Text className="input-right-btn"><i onClick={createSubject} style={{cursor: "pointer", color: "green"}} className="bi bi-check"></i></InputGroup.Text>
                        </InputGroup>
                        </ListGroup>    
                        <div className={(subjects.length!=0)?"title-num":"hide"}>количество: {subjects.length}</div>
                    </div>

                    <div className="col-30">
                        <div className="col-title" style={{marginBottom: "28px"}}>Вопросы Темы</div>
                        <ListGroup>
                        {
                            subjectQuestions.map((q:QuestionType, i: number)=>{
                                if(q!=null)
                                    return <ListGroup.Item action id={(q?.id || '').toString()} onClick={(e)=>selectQuestion(q)} eventKey={q?.id}><span className="pos-element"><i onClick={()=>toUpPos(i)} className="bi bi-arrow-up"></i><i onClick={()=>toDownPos(i)} className="bi bi-arrow-down"></i></span>{q?.code_id}<div className="right-panel"><span><i onClick={()=>handleRemoveSubjectQuestion(q.id, i)} className="bi bi-trash3-fill"></i></span></div></ListGroup.Item>  
                            })
                        }
                        </ListGroup>
                        <div className={(subjectNum!=0)?"title-num":"hide"}>количество: {subjectNum}</div>
                    </div>

                    <div className="middle-column">
                        <i onClick={addQueToSubject} className={"bi bi-arrow-left "+((selectedSubject!==0 && selectedQuestion!=null)?"":"hide")}></i>    
                    </div>

                    <div className="col-50">
                        <div className="col-title">Вопросы<Button onClick={createQuestion} variant="outline-success">Создать</Button></div>
                        <Autocomplete
                            style={{width: '100%'}}
                            value={search}
                            clearOnBlur={false}
                            onChange={(event: any, newValue: string | null) => {
                                setSearchValue(newValue);
                            }}
                            onInputChange={(event, newInputValue) => {
                                let results = Questions.filter((item:QuestionType)=>item.code_id.indexOf(newInputValue)!=-1);
                                setFiltered(results);
                            }}
                            id="controllable-states-demo"
                            options={options}
                            sx={{ width: 300 }}
                            renderInput={(params) => <TextField {...params} label="поиск" />}
                        />
                        <ListGroup className={isEdit?"hide":""}>
                        {
                            (filtered.length==0 ? 
                                Questions.map((q:QuestionType, i: number)=>{
                                    if(q!=null)
                                        return <ListGroup.Item action id={(q?.id || '').toString()} onClick={(e)=>selectQuestion2(q)} eventKey={q?.id}>{q?.code_id}<div className="right-panel"><span><i onClick={()=>handleEditQuestion(q)} className="bi bi-pencil-fill"></i><i onClick={()=>handleRemoveQuestion(q.id, i)} className="bi bi-trash3-fill"></i></span></div></ListGroup.Item>  
                                })
                                :
                                (
                                    filtered.map((q:QuestionType, i: number)=>(
                                        <ListGroup.Item action id={(q?.id || '').toString()} onClick={(e)=>selectQuestion2(q)} eventKey={q?.id}>{q?.code_id}<div className="right-panel"><span><i onClick={()=>handleEditQuestion(q)} className="bi bi-pencil-fill"></i><i onClick={()=>handleRemoveQuestion(q.id, i)} className="bi bi-trash3-fill"></i></span></div></ListGroup.Item> 
                                    ))   
                                )
                            )
                        }
                        </ListGroup>
                        <div className={(Questions.length!=0 && !isEdit)?"title-num":"hide"}>количество: {filtered.length==0?Questions.length:filtered.length}</div>
                        <QuestionForm show={isEdit} setShow={setEditMode} Question={selectedQuestion} setSelectedQue={setSelectedQue} setQuestions={setQuestions} update={updateSubjectQuestions} />
                    </div>

                </div>
        </>
        )
}