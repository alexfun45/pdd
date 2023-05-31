
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

type ErrorType = {
    ticket: string;
    comment: string;
    title: string;
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
    pdd_questions = [];
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
            if(callback)
                callback();
        }
        
    });
}

let settings = {};
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

function getTimeString(__seconds: number){
    let minutes = Math.floor(__seconds/60),
            seconds = __seconds%60,
            __time = (__seconds<10)?("0"+seconds):seconds.toString();
    return minutes+":"+__time;
}

const Watch = ({start, setEndTest, endTest, pause, _continue, iterator=1, startTime=0, btnView='icon'}: {start: boolean, setEndTest: Function, endTest: boolean, pause: Function, _continue: Function, iterator: number, startTime: number, btnView: string}) => {

    const [time, setTime] = useState("0:00"),
          [isPause, setPause] = useState(false);

    function startTimer(){
        timer+=iterator;
        if(timer==0){
            Pause();
            setEndTest(true);
        }
        let timeString = getTimeString(timer);
        setTime(timeString);
    }

    function Pause(){
        clearInterval(Timer);
        Timer = 0;
        pause();
        setPause(true);
    }

    function Continue(){
        setPause(false);
        _continue();
    }

    useEffect(()=>{
        if(startTime!=0){
            timer = startTime;
            setTime(getTimeString(startTime));
        }
    }, [startTime])
    
    useEffect(()=>{
        if(start===true && endTest===false){
            setTime("0:00");
            Timer = setInterval(startTimer, 1000);
            }
        if(endTest===true){
            clearInterval(Timer);
            Timer = 0;
            }
        if(start===false && endTest===false && isPause!==true)
            setTime("0:00");
    }, [start, endTest]);    

    return (
        <>
            {(btnView=="icon") ? (
                <span id="labelTimer" className="label-info lead label" title="таймер" style={{cursor: "pointer"}}><span id="time">{time}</span>
                    { (start) ? 
                        <i onClick={()=>Pause()} className="bi bi-pause pause-btn"></i>
                    :
                        <i onClick={()=>Continue()} className="bi bi-play-fill pause-btn"></i>               
                    }
                </span>
                ) : (
                    <>
                       <span id="labelTimer" className="label-info lead label" title="таймер" style={{cursor: "pointer"}}><span id="time">{time}</span></span>
                        { (start) ?
                            <input onClick={()=>Pause()} type="submit" className="label lead label-info" value="пауза" />
                        :
                            <input onClick={()=>Continue()} type="submit" className="label lead label-info" value="Начать" />

                        }
                    </>
                )
            }
        </>
    )
}

let numPageItems = 10,
    firstRunning = 0,
    availableWidth = 0,
    itemWidth = 50,
    errors_array:ErrorType[] = [],
    requiredWidth = 0,
    variantBackgroundColor = "transparent";

const TestPdd = (props: {start: boolean, options: testOptionsType}) => {

    const [time, setTime] = useState("0:00"),
          [selectedVariant, setSelectedVar] = useState(-1),
          [startTime, setStartTime] = useState(0),
          [iterator, setIterator] = useState(1),
          [Options, setOptions] = useState({...props.options}),
          [selectedTicket, setTicket] = useState(0),
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

    useEffect(()=>{
        if(selectedTicket!=0 && (props.options.settings==false)){
            startTest();
        }
        firstRunning++;
    }, [selectedTicket])

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
                    if((currentTicket+1)<qNum && ((currentTicket+1)<=question_answered))
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
            setOptions({...Options, selectedTicket: data[0].id});
            setTicket(data[0].id);
            setTickets(data);
            //options.selectedTicket = data[0].id;
            
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
        if(props.options.settings===false)
		    getQuestions({...Options, selectedTicket:selectedTicket, settings: false}, setQuestion);
        else
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
            errors_array.push({ticket: currentTicket.toString(), title: pdd_questions[currentTicket].title, comment: currentQuestion.variants[selectedVar].comment});
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
        setSelectedVar(-1);
        if(question_answered<pdd_questions.length && question_answered<=Options.num){
            goToPage(question_answered);
        }
        else if(question_answered>=props.options.num || question_answered>=pdd_questions.length){
            setEndTest(true);
            testPause();
        }   
    }

    function handleChangeTicket(event: SelectChangeEvent){
        setTicket(parseInt(event.target.value));
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
        else if(ticketIndx==question_answered){
            setOpened([]);
            setCurrentTicket(ticketIndx);
        }
    }

    // handle change test options
    const handleChangeOption = (event: any, optionName: any) => {
        
        //let value = (optionName=="dblclick" || optionName=="random") ? (event.target.value=="on"):event.target.value;
        setOptions({...Options, [optionName]: event.target.value});
    }

    const resetTest = () => {
        if(props.options.settings===false)
            setOptions({...props.options});
        errors_array = [];
        setOpened([]);
        setCurrentTicket(0);
        setCurrentQuestion(undefined);
        setTicket(0);
        setqPages([]);
        selected = [];
        clearInterval(Timer);
        setTime("0:00");
        Timer = 0;
        setqNum(0);
        results.current = [];
        errors = 0;
        question_answered = 0
        timer = 0;
        setStart(false);
        setEndTest(false);
    }

    useEffect(()=>{
        setQuestion();
    }, [currentTicket]);
    
    useEffect(()=>{
        resetTest();
        if(props.options.settings===true){
            setStartTime(20*60);
            setIterator(-1);
            setOptions({...props.options});
        }
        else{
            setStartTime(0);
            setIterator(1);
            setOptions({...props.options});
        }
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

    const Variants = (props:{dblclick: boolean}) => {
        return (
            <div id="qlist">
                { (currentQuestion!=undefined) && (
                    currentQuestion.variants.map((v,i)=>(
                        // выводить только выбранный вариант(selectedVariant==i), либо все варианты если ни один еще не выбран(selectedVariant==-1)
                        (selectedVariant==i || selectedVariant==-1) &&
                            <a key={"var_"+i} onDoubleClick={()=>{if(props.dblclick) selectAnswer(i)}} onClick={()=>{if(!props.dblclick) selectAnswer(i)}} id={i.toString()} className={"list-group-item questvariant "+showResult(i)}>{i+1}. {v.answer}</a>
                        )
                    ))
                }
            </div>
         );
}

    return (
        <div className="container">
            <div style={{marginTop: 0}} className={(props.options.settings===false)?"row testrow":"hide"}>
                <div className="exam-title">
                    <label>{context.settings.exam_title}</label>
                    <FormControl className="form-ticket" sx={{m: 1, minWidth: 120, marginTop: '5px', verticalAlign: 'middle'}}>
                        <Select
                            disabled={start?true:false}
                            labelId="demo-simple-select-helper-label"
                            sx={{"& .MuiSelect-select": {padding: "5px 14px"}}}
                            id="demo-simple-select-helper"
                            value={Options.selectedTicket}
                            onChange={handleChangeTicket}>
                                {
                                    tickets.map((v, i)=>(
                                        <MenuItem value={v.id}>{v.name}</MenuItem>
                                    ))
                                }
                        </Select>
                    </FormControl>
                    { (currentQuestion!=undefined && context.isMobile) && (
                        <Watch start={start} setEndTest={setEndTest} endTest={endTest} pause={testPause} _continue={continueTest} iterator={iterator} startTime={startTime} btnView="button" />  
                    )}
                </div>
            </div>
            <div className={(props.options.settings==true)?"row testrow":"hide"}>
                <div className="col-md-12">
                    <form onSubmit={handleSubmit(onSubmit)} className={(!context.logged)?"form-flex":"hide"}>
                        <div className="form-group">
                            <input disabled={start} {...register("surname", {
                                                    required: "Field is required",
                                                    maxLength: 50} 
                                    )}
                                type="text" className="form-control" id="textSchoolName1" placeholder="Фамилия" />
                        </div>
                        <div className="form-group">
                            <input disabled={start} {...register("name", {
                                                    required: "Field is required",
                                                    maxLength: 50} 
                                    )} type="text" className="form-control" id="textSchoolName2" placeholder="Имя" />
                        </div>
                        <div className="form-group">
                            <input disabled={start} {...register("name2", {
                                                    required: "Field is required",
                                                    maxLength: 50} 
                                    )} type="text" className="form-control" id="textSchoolName3" placeholder="Отчество" />
                        </div>
                        {(!context.isMobile) && (
                            <input id="buttonSchoolSetName" type="submit" className={(start || (context.isMobile && !props.options.settings))?"hide":"btn btn-success"} value="Начать" />
                        )}
                </form>
        <form id="collapseConf">
            <div id="examSizePanel" className="form-group">
                <label>Вопросов</label>
                {(context.isMobile) ? (
                    <>
                      <select onChange={(e)=>handleChangeOption(e, 'num')} className="select-mobile" name="examSize">
                        <option selected={Options.num==20} value="20">20</option>
                        <option selected={Options.num==40} value="40">40</option>
                        <option selected={Options.num==60} value="60">60</option>
                        <option selected={Options.num==80} value="80">80</option>
                        <option selected={Options.num==100} value="100">100</option>
                    </select>
                    </>
                ) 
                :
                (
                    <>
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
                    </>
                )}
            </div>
            <div className="form-group">
                <label style={{display: "inline-block !important"}}>Ошибок &nbsp; </label>
                <input disabled={start} id="examErrorSize" onChange={(e)=>handleChangeOption(e, 'max_error')} value={Options.max_error} type="number" min={1} max={100} />&nbsp;&nbsp;&nbsp;
            </div>
            {(context.isMobile || context.logged) && (
                <br/>
            )
            }
            <div className="checkbox">
                <label>
                    <input disabled={start} id="btnConfDoubleClick" onChange={(e)=>handleChangeOption(e, 'dblclick')} checked={Options.dblclick} type="checkbox"/> Двойной клик
                </label>&nbsp;&nbsp;&nbsp;
            </div>
            <div className="checkbox">
                <label>
                    <input disabled={start} id="btnConfRandomVariants" onChange={(e)=>handleChangeOption(e, 'random')} checked={Options.random} type="checkbox"/> Перемешивать вопросы
                </label>
                </div>
                {(context.isMobile || context.logged) && (
                    <input id="buttonSchoolSetName" onClick={(e)=>{e.preventDefault(); if(!context.logged) handleSubmit(onSubmit)(); else handleStartTest();}} type="submit" className={(start || (context.isMobile && !props.options.settings))?"hide":"btn btn-success"} value="Начать" />
                )}
            </form>
            </div>
        </div>
            { (props.options.settings && !start && context.settings["image_title_exam"]!='' && !context.isMobile && !endTest) && (
                <div className="titleImage">
                    <img width='auto' height='auto' src={'./img/'+context.settings["image_title_exam"]}/>
                </div>
            )
            }
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
            { (!context.isMobile) && (
            <div style={{marginTop: 0, position: 'relative', top: '-15px'}} className="row testrow centered-row">
                <div className="col-lg-8 col-md-8 col-sm-8">    

                    <div style={{marginTop: 0}} className="row testrow">
                        <div className="col-md-12 col-sm-12 myheader">
                            <span id="labelCategory" className="hide"> ABM </span>
                            { (currentQuestion!=undefined && !context.isMobile) && (
                                    <Watch start={start} setEndTest={setEndTest} endTest={endTest} pause={testPause} _continue={continueTest} iterator={iterator} startTime={startTime} btnView="icon"/>  
                                 )}
                                <input onClick={startTest} id="buttonSchoolSetName" type="submit" className={(start || props.options.settings===true || context.isMobile)?"hide":"btn btn-start"} value="Начать" />
                            
                            <span id="labelBookmark" data-toggle="tooltip" data-placement="left" title="В закладки" style={{fontSize: "20px", color: "#5bc0de", cursor: "pointer"}} className="pull-right glyphicon glyphicon-star-empty"></span>
                        </div>
                    </div>
                </div>
            </div>
            )}
            <div style={{marginTop: 0}} className="row testrow">
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
                                            {(endTest===true) && (
                                                <p>
                                                    Затрачено времени на <span style={{fontWeight: 'bold'}}>{tickets[selectedTicket].name}: {getTimeString(timer)}</span>
                                                </p>
                                            )}
                                        </div>
                                        </div>
                                        <div className="panel-result">
                                        {(!props.options.settings) && (
                                            <p>
                                                <table className="result_table">
                                                    <tr><th>№</th><th>Вопрос</th><th>Комментарий</th></tr>
                                                    { errors_array.map((v, i)=>(
                                                        <tr><td>{parseInt(v.ticket)+1}</td><td>{v.title}</td><td>{v.comment}</td></tr>
                                                        ))
                                                    }
                                                </table>
                                            </p>
                                        )}
                                    </div> 
                                </div>
                            </div>
                <div className="col-lg-8 col-md-9 col-sm-12 mini-wrapper">
                    <div className="block-ticket">
                        <div className="col-md-12">
                            <div id="questPanel">
                                <img id="questImage" className={(start)?"img-responsive":"hide"} width="100%" style={{maxWidth: "100%"}}
                                        src={(currentQuestion!==undefined)?currentQuestion.image:""}
                                        onError={(e)=>{if (e.currentTarget.src != './img/no_picture.png') e.currentTarget.src = './img/default_bilet_images.png';}}
                                        />
                                <div id="questText" className={(start)?"questtext":"hide"}>{(currentQuestion!==undefined)?currentQuestion.title:""}</div>
                                <div className={(start)?"list-group":"hide"}>
                                    <Variants dblclick={Options.dblclick} key={currentTicket} />
                                    <div id="commentPanel" className={(!start)?"hide":((opened.length>0)?"":"hide")}>
                                        <div id="questComment" className="">{(currentQuestion!==undefined && currentQuestion.variants.length>selectedVariant)?currentQuestion.variants[(selectedVariant==-1)?0:selectedVariant].comment:""}</div>
                                        <button onClick={next} id="questNext" type="button" className="list-group-item active">Далее <small className="text-warning small hidden-xs"> - Enter &nbsp;&nbsp;&nbsp; 1,2,3 - выбор &nbsp;&nbsp;&nbsp; &larr; назад &nbsp; вперед &rarr;</small></button>
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