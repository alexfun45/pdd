
import React, {useState, useEffect, useRef} from "react";
import {useForm} from 'react-hook-form'
import $ from 'jquery'
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {AppContext} from '../app'
import request from "../utils/request";

type answersType = {
    answer: string;
    comment: string;
}

type InputSettings = {
    surname: string;
    name: string;
    name2: string;
}

type TicketPdd = {
    title: string;
    image: string;
    success: string;
    variants: answersType[];
    isSuccess: number;
}

type testOptionsType = {
    num: number;
    max_error: number;
    random: boolean;
    max: number;
    settings: boolean;
    dblclick: boolean;
    selectedTicket: string;
}

var  pdd_questions: TicketPdd[] = [],
     Timer:any = null,
     nextTicket = 1,
     selectedAnswer: number,
     selected: any = [],
     //results:any = [],
     errors = 0,
     question_answered = 0,
     timer = 0,
     page = 0;

function getQuestions(options: any, callback: Function){
    request({method: 'post', data: {action: "getQuestions", data: {...options}}}).then(response => {
        const {data} = response;
        if(data!=null){
            var questions = data;
            for(var i=0, variants;i<questions.length;i++){
                variants =  questions[i].variants;
                pdd_questions[i] = {
                    title: questions[i].title,
                    image: "./img/"+questions[i].image,
                    success: questions[i].correct,
                    variants: variants,
                    isSuccess: -1
                };
            }
        }
        if(callback)
            callback();
    });
}

const BtnQuestion = (props: any)  => {

    function getBtnpageClass(i: number){
        let classname = "btn btn-page btn-default";
        if(props.currentTicket==i && props.results[i]!=1 && props.results[i]!=0)
            classname += " current-button";
        else if(props.currentTicket==i)
            classname += " current-finished-button";
        if(props.results[i]==1)
            classname += " btn-danger";
        else if(props.results[i]==0)   
             classname+= " btn-success";
        return classname;        
    }
    return props.qpages.map((v:any, i: number)=>{
        //return <BtnQuestion key={selectedTicket+"_"+qpages.length} i={i} qpages={qpages} goToPage={goToPage} getBtnpageClass={getBtnpageClass(i, res)}/>
        return <button key={"btn_"+props.qpages.length+"_"+i} onClick={()=>props.goToPage(i)} id={"btn_"+i} className={getBtnpageClass(i)} type="button">{i+1}</button>
    })
    //return <button key={"btn_"+props.qpages.length+"_"+props.i} onClick={()=>props.goToPage(props.i)} id={"btn_"+props.i} className={props.getBtnpageClass(props.i)} type="button">{props.i+1}</button>
}

const Watch = ({start, endTest, pause, _continue}: {start: boolean, endTest: boolean, pause: Function, _continue: Function}) => {

    const [time, setTime] = useState("0:00");

    function startTimer(){
        timer++;
        let minutes = Math.floor(timer/60),
            seconds = timer%60,
            __time = (seconds<10)?("0"+seconds):seconds.toString();
        setTime(minutes+":"+__time);
    }

    function Pause(){
        clearInterval(Timer);
        Timer = 0;
        pause();
    }

    function Continue(){
        //Timer = setInterval(startTimer, 1000);
        _continue();
    }
    
    useEffect(()=>{
        if(start===true && endTest===false){
            setTime("0:00");
            Timer = setInterval(startTimer, 1000);
        }
        if(endTest===true){
            clearInterval(Timer);
            Timer = 0;
        }
        if(start===false && endTest===false)
            setTime("0:00");
    }, [start, endTest]);    

    return (
        <span id="labelTimer" className="label-info lead label" title="таймер" style={{cursor: "pointer"}}><span id="time">{time}</span>
                { (start==true) ? 
                    <i onClick={()=>Pause()} className="bi bi-pause-fill pause-btn"></i>
                :
                    <i onClick={()=>Continue()} className="bi bi-play-fill pause-btn"></i>               
                }
        </span>
    )
}

let numPageItems = 10,
    availableWidth = 0,
    itemWidth = 50,
    requiredWidth = 0,
    variantBackgroundColor = "transparent";

const TestPdd = (props: {start: boolean, options: testOptionsType}) => {

    const [time, setTime] = useState("0:00"),
          [selectedVariant, setSelectedVar] = useState(0),
          [Options, setOptions] = useState({...props.options}),
          [selectedTicket, setTicket] = useState('0'),
          [currentTicket, setCurrentTicket] = useState<number>(0),
          results = useRef([]),
          //[results, setResults] = useState([]),
          [currentQuestion, setCurrentQuestion] = useState<TicketPdd>(),
          [start, setStart] = useState(false),
          [opened, setOpened] = useState<Number[]>([]),
          [qNum, setqNum] = useState<number>(0),
          [ticketBg, setTicketBg] = useState("transparent"),
          [tickets, setTickets] = useState([]),
          [qpages, setqPages] = useState([]),
          //[opened, setOpened] = useState<Array<number[]>>([]),
          [leftShift, setLeftShift] = useState(0),
          [endTest, setEndTest] = useState(false);
    
    const context = React.useContext(AppContext);

    useEffect(()=>{
        setOptions({...props.options});
        availableWidth = $(".testrow").width()*0.7;
        requiredWidth = numPageItems * itemWidth;
        if(availableWidth < requiredWidth){
            numPageItems = +((availableWidth / itemWidth).toFixed(0));
            requiredWidth = availableWidth;
        }
        
        if(!props.options.settings)
            getTickets();        
    }, [props.options]);

    useEffect(()=>{
        variantBackgroundColor = context.settings['background-color'];
        var rgb = variantBackgroundColor.replace(/^rgba?\(|\s+|\)$/g,'').split(',');
        rgb[0] = (parseInt(rgb[0])+10).toString();
        rgb[1] = (parseInt(rgb[1])+10).toString();
        rgb[2] = (parseInt(rgb[2])+10).toString();
        setTicketBg(`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${rgb[3]})`);
    }, [context])

    useEffect(()=>{
        setqPages([...new Array(qNum).slice(0)]);
    }, [qNum]);

    /*useEffect(()=>{
        if(context.settings['background-color-tickets']!=""){
            document.body.style.backgroundColor = context.settings['background-color-tickets'];
        }
        if(context.settings['background-image-tickets']){
            let src = "./img/" + context.settings['background-image-tickets'];
            document.body.style.backgroundImage = `url(${src})`;
            }
    }, [context.settings]);*/

    useEffect(()=>{
        if(currentQuestion){
            $(document).on('keydown', function(event: any){
                let e = event.originalEvent;
               
                if(e.which==13 && !Options.settings && (currentTicket==(question_answered-1))){
                    next();
                }
                let selectedAnswer = parseInt(e.key); 
                if(currentQuestion && selectedAnswer<=(currentQuestion.variants.length) && e.key>0){
                    selectAnswer(selectedAnswer-1);  
                }
                if(e.keyCode==37){
                    if((currentTicket-1)>0)
                        goToPage(currentTicket-1);
                }
                if(e.keyCode==39){
                    if((currentTicket+1)<qNum && ((currentTicket+1)<=question_answered || !Options.settings))
                        goToPage(currentTicket+1);
                }
            });
        }
        return ()=>{
            $(document).off('keydown'); 
        }
    }, [currentQuestion]);

    const {register, handleSubmit, setError, watch, setValue, formState: {errors: errors2} } = useForm<InputSettings>({mode: 'onBlur'});

    const onSubmit = (data: InputSettings) => {
        handleStartTest();
    };

    // getting tickets with questions
    function getTickets(){
        request({method: 'post', data: {action: "getTickets"}}).then(response => {
            const {data} = response;
            setTickets(data);
            //options.selectedTicket = data[0].id;
            setOptions({...Options, selectedTicket: data[0].id});
            setTicket(data[0].id);
        });
    }

    function setQuestion(){
        if(pdd_questions.length>0 && pdd_questions.length-1>=currentTicket){
            setqNum(Math.min(Options.num, pdd_questions.length));
            setCurrentQuestion(pdd_questions[currentTicket]);
        }
    }

    function startTest(){
        resetTest();
        setStart(true);
        setEndTest(false);
		getQuestions(Options, setQuestion);
    }

    function handleStartTest(){
        resetTest();
        startTest();
    }

    function testPause(){
        setStart(false);

    }

    function continueTest(){
        if(endTest==true) return;
        setStart(true);
    }

    function selectAnswer(selectedVar: any){
        if(Options.settings && currentTicket<question_answered) return;
        let _opened = [...opened];
        _opened.push(selectedVar);
        setSelectedVar(selectedVar);
        selectedAnswer = selectedVar
        // save selected answer
        selected[currentTicket] = [..._opened];
        // current opened answers
        setOpened(_opened);
       if(results.current[currentTicket]==1 || results.current[currentTicket]==0) return;
       if(selectedVar != parseInt(pdd_questions[currentTicket].success)){
            errors++;
            results.current[currentTicket] = 1;
       }
       else{
            results.current[currentTicket] = 0;
        }
            

        question_answered++;
        if(Options.settings && currentTicket==question_answered-1)
            next();
    }

    function showResult(indx: number){
        return (opened.indexOf(indx) != -1) ? ( (parseInt(pdd_questions[currentTicket].success)==indx) ? "success":"warning" ) : "";
    }

    function next(){
        if(question_answered<pdd_questions.length && question_answered<=Options.num){
            goToPage(question_answered);
        }
        else if(question_answered>=props.options.num || question_answered>=pdd_questions.length){
            setEndTest(true);
            testPause();
        }   
    }

    function handleChangeTicket(event: SelectChangeEvent){
        setTicket(event.target.value);
        Options.selectedTicket = event.target.value;
    }

    function getBtnpageClass2(i: number, res: any){
        let classname = "btn btn-page btn-default";
        if(currentTicket==i && results.current[i]!=1 && results.current[i]!=0)
            classname += " current-button";
        else if(currentTicket==i)
            classname += " current-finished-button";
        if(results.current[i]==1)
            classname += " btn-danger";
        else if(results.current[i]==0)   
             classname+= " btn-success";
        return classname;        
    }

    function goToPage(ticketIndx: any){
        if(ticketIndx<pdd_questions.length && ticketIndx<question_answered){
            if(selected[ticketIndx])
                setOpened(selected[ticketIndx]);
            else
                setOpened([]);
            setCurrentTicket(ticketIndx);
        }
        else if(ticketIndx==question_answered || !Options.settings){
            setOpened([]);
            setCurrentTicket(ticketIndx);
        }
    }

    // handle change test options
    const handleChangeOption = (event: React.ChangeEvent<HTMLInputElement>, optionName: any) => {
        setOptions({...Options, [optionName]: event.target.value});
    }

    const resetTest = () => {
        setOpened([]);
        setCurrentTicket(0);
        selected = [];
        clearInterval(Timer);
        setTime("0:00");
        Timer = 0;
        //setResults([]);
        setqNum(0);
        results.current = [];
        errors = 0;
        question_answered = 0
        timer = 0;
        setStart(false);
    }

    useEffect(()=>{
        setQuestion();
    }, [currentTicket]);
    
    useEffect(()=>{
        resetTest();
        setOptions({...props.options});
    }, [props.options.settings]);

    const toNextPage = () => {
        if((qNum-(numPageItems*(page+1)))>0){
            page+=1;
            setLeftShift(-page*requiredWidth);
        }
    }

    const toPrevPage = () => {
        if(page>0){
            page-=1;
            setLeftShift(-page*requiredWidth);
        }
    }

    return (
        <div className="container">
            <div style={{marginTop: 0}} className={(props.options.settings===false)?"row testrow":"hide"}>
                <div className="exam-title">
                    <label>{context.settings.exam_title}</label>
                    <FormControl className="form-ticket" sx={{ m: 1, minWidth: 120, marginTop: '5px'}}>
                        <Select
                            disabled={start?true:false}
                            labelId="demo-simple-select-helper-label"
                            sx={{"& .MuiSelect-select": {padding: "5px 14px"}}}
                            id="demo-simple-select-helper"
                            value={selectedTicket}
                            onChange={handleChangeTicket}>
                                {
                                    tickets.map((v, i)=>(
                                        <MenuItem value={v.id}>{v.name}</MenuItem>
                                    ))
                                }
                        </Select>
                    </FormControl>
                </div>
            </div>
            <div className={(props.options.settings==true)?"row testrow":"hide"}>
                <div className="col-md-12">
            <form onSubmit={handleSubmit(onSubmit)} className="form-inline">
                <div className="form-group">
                    <label>Фамилия&nbsp;</label>
                    <input disabled={start} {...register("surname", {
                                            required: "Field is required",
                                            maxLength: 50} 
                            )}
                        type="text" className="form-control" id="textSchoolName1" placeholder="Фамилия" />
                </div>
                <div className="form-group">
                    <label>Имя&nbsp;</label>
                    <input disabled={start} {...register("name", {
                                            required: "Field is required",
                                            maxLength: 50} 
                            )} type="text" className="form-control" id="textSchoolName2" placeholder="Имя" />
                </div>
                <div className="form-group">
                    <label>Отчество&nbsp;</label>
                    <input disabled={start} {...register("name2", {
                                            required: "Field is required",
                                            maxLength: 50} 
                            )} type="text" className="form-control" id="textSchoolName3" placeholder="Отчество" />
                </div>

                <input id="buttonSchoolSetName" type="submit" className={(start)?"hide":"btn btn-success"} value="Начать" />
                
            </form>
        <form id="collapseConf">
            <div id="examSizePanel" className="form-group">
                <label>Вопросов</label>
                <label className="radio-inline">
                    <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio" checked={Options.num==20} name="examSize" id="examSize20" value="20"/>20
                </label>
                <label className="radio-inline">
                    <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio" checked={Options.num==40} name="examSize" id="examSize40" value="40"/>40
                </label>
                <label className="radio-inline">
                    <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio"  checked={Options.num==60} name="examSize" id="examSize60" value="60"/>60
                </label>
                <label className="radio-inline">
                    <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio"  checked={Options.num==80} name="examSize" id="examSize80" value="80"/>80
                </label>
                <label className="radio-inline">
                    <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio"  checked={Options.num==100} name="examSize" id="examSize100" value="100"/>100
                </label>
                &nbsp;&nbsp;&nbsp;
            </div>
            <div className="form-group">
                <label style={{display: "inline-block !important"}}>Ошибок &nbsp; </label>
                <input disabled={start} id="examErrorSize" onChange={(e)=>handleChangeOption(e, 'max_error')} value={Options.max_error} type="number" min={1} max={100} />&nbsp;&nbsp;&nbsp;
            </div>
            <div className="checkbox">
                <label>
                    <input disabled={start} id="btnConfDoubleClick" onChange={(e)=>handleChangeOption(e, 'dblclick')} defaultChecked={Options.dblclick} type="checkbox"/> Двойной клик
                </label>&nbsp;&nbsp;&nbsp;
            </div>
            <div className="checkbox">
                <label>
                    <input disabled={start} id="btnConfRandomVariants" onChange={(e)=>handleChangeOption(e, 'random')} defaultChecked={Options.random} type="checkbox"/> Перемешивать вопросы
                </label>
                </div>
            </form>
            </div>
        </div>
            <div style={{marginTop: 0}} className="row testrow">
                <div className="slide-wrapper" style={{width: (requiredWidth+"px")}}>
                    <i onClick={toPrevPage} className={start?"bi bi-caret-left arrow-btn arrow-left-btn":"hide"}></i>
                    <div className="button-slider">
                        <div key={selectedTicket} id="buttonPanel" style={{left: leftShift+"px"}} className={(start)?"btn-group btn-group-xs":"hide"}>
                            {
                                //getBtns(results)
                                <BtnQuestion key={selectedTicket} results={results.current} qpages={qpages} goToPage={goToPage} currentTicket={currentTicket}/>
                                //qpages.map((v, i)=>{
                                    //return <BtnQuestion key={selectedTicket+"_"+qpages.length} i={i} qpages={qpages} goToPage={goToPage} getBtnpageClass={getBtnpageClass}/>
                                    //return <button key={"btn_"+qpages.length+"_"+i} onClick={()=>goToPage(i)} id={"btn_"+i} className={getBtnpageClass(i, results)} type="button">{i+1}</button>
                                //})
                            }
                        </div>
                    </div>
                    <i onClick={toNextPage} className={start?"bi bi-caret-right arrow-btn arrow-right-btn":"hide"}></i>
                </div>
            </div>
            <div style={{marginTop: 0, position: 'relative', top: '-15px'}} className="row testrow centered-row">
                <div className="col-lg-8 col-md-8 col-sm-8">    

                    <div style={{marginTop: 0}} className="row testrow">
                        <div className="col-md-12 col-sm-12 myheader">
                            <span id="labelQuestNumber" className="label label-primary">Новые правила экзамена пдд 2023</span>
                            <span id="labelCategory" className="hide"> ABM </span>
                            {(selectedTicket!='0' && (currentQuestion!==undefined)) && (
                                    <Watch start={start} endTest={endTest} pause={testPause} _continue={continueTest} />  
                            )}
                            {(selectedTicket!='0') && (
                                <input onClick={startTest} id="buttonSchoolSetName" type="submit" className={(start)?"hide":"btn btn-start"} value="Начать" />
                            )}
                            <span id="labelBookmark" data-toggle="tooltip" data-placement="left" title="В закладки" style={{fontSize: "20px", color: "#5bc0de", cursor: "pointer"}} className="pull-right glyphicon glyphicon-star-empty"></span>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{marginTop: 0}} className="row testrow">
                <div className="col-lg-8 col-md-9 col-sm-12 mini-wrapper">
                    <div className="block-ticket">
                        <div className="col-md-12">
                            <div id="questPanel" className={(start)?"":"hide"}>
                                <img id="questImage" className="img-responsive" width="100%" style={{maxWidth: "100%"}}
                                        src={(currentQuestion!==undefined)?currentQuestion.image:""}
                                        onError={(e)=>{if (e.currentTarget.src != './img/no_picture.png') e.currentTarget.src = './img/no_picture.png';}}
                                        />
                                <div id="questText" className="questtext">{(currentQuestion!==undefined)?currentQuestion.title:""}</div>
                                <div className="list-group">
                                    <div id="qlist">
                                        { (currentQuestion!=undefined) && (
                                            currentQuestion.variants.map((v,i)=>{
                                                return <a onDoubleClick={()=>{if(Options.dblclick) selectAnswer(i)}} onClick={()=>{if(!Options.dblclick) selectAnswer(i)}} id={i.toString()} className={"list-group-item questvariant "+showResult(i)}>{i+1}. {v.answer}</a>
                                                //return <a style={{backgroundColor: ((opened.indexOf(i) != -1))?"":ticketBg}} onDoubleClick={()=>{if(options.dblclick) selectAnswer(i)}} onClick={()=>{if(!options.dblclick) selectAnswer(i)}} id={i.toString()} className={"list-group-item questvariant "+showResult(i)}>{i+1}. {v.answer}</a>
                                            })
                                        )
                                        }
                                    </div>
                                    <div id="commentPanel" className={(opened.length>0)?"":"hide"}>
                                        <button onClick={next} id="questNext" type="button" className="list-group-item active">Далее <small className="text-warning small hidden-xs"> - Enter &nbsp;&nbsp;&nbsp; 1,2,3 - выбор &nbsp;&nbsp;&nbsp; &larr; назад &nbsp; вперед &rarr;</small></button>
                                        <div id="questComment" className="">{(currentQuestion!==undefined && currentQuestion.variants.length>selectedVariant)?currentQuestion.variants[selectedVariant].comment:""}</div>
                                    </div>
                                </div>
                            </div>
                            <div className={(endTest===true)?"row":"hide row"}>
                                <div className="col-md-12">
                                    <div className="panel panel-primary">
                                        <div className="panel-heading lead">
                                            ошибок <span id="resultErrors" className="label label-danger">{errors}</span> из <span id="resultCount" className="label label-default">{Options.num}</span>
                                        </div>
                                        <div className="panel-body">
                                            <p id="resultText" className="lead">
                                                {(Options.max_error<errors) ?
                                                    (<><i style={{color: "#222", fontSize: "18px"}} className="bi bi-x-lg"></i> Экзамен не сдан. У вас более {Options.max_error} ошибок</>)
                                                    :
                                                    (<><i style={{color: "green"}} className="bi bi-check-lg"></i> Экзамен сдан</>)
                                                }
                                            </p>
                                        </div>
                                    </div>      
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    )
}

export default TestPdd