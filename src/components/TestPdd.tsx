
import {useState, useEffect} from "react";
import {useForm} from 'react-hook-form'
import $ from 'jquery'
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
    text: string;
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
}

var  pdd_questions: TicketPdd[] = [],
     Timer:any = null,
     nextTicket = 1,
     selectedAnswer: number,
     selected: any = [],
     results:any = [],
     errors = 0,
     question_answered = 0,
     timer = 0;
     

function getTickets(options: any, callback: Function){
    request({method: 'post', data: {action: "getAllTickets", data: {...options}}}).then(response => {
        const {data} = response;
        if(data!=null){
            var tickets = data;
            for(var i=0, variants;i<tickets.length;i++){
                variants =  tickets[i].variants;
                pdd_questions[i] = {
                    text: tickets[i].text,
                    image: "./img/"+tickets[i].image,
                    success: tickets[i].correct_id,
                    variants: variants,
                    isSuccess: -1
                };
            }
        }
        if(callback)
            callback();
    });
}


const TestPdd = (props: {start: boolean, options: testOptionsType}) => {

    const [time, setTime] = useState("0:00"),
          [options, setOptions] = useState({...props.options}),
          [currentTicket, setCurrentTicket] = useState<number>(0),
          [currentQuestion, setCurrentQuestion] = useState<TicketPdd>(),
          [start, setStart] = useState(props.start),
          [opened, setOpened] = useState<Number[]>([]),
          [qNum, setqNum] = useState<number>(0),
          //[opened, setOpened] = useState<Array<number[]>>([]),
          [endTest, setEndTest] = useState(false);

    useEffect(()=>{
        setOptions({...props.options});
        setEndTest(false);
    }, [props.options]);

    useEffect(()=>{
        if(currentQuestion){
            $(document).on('keydown', function(event: any){
                let e = event.originalEvent;
               
                if(e.which==13 && !options.settings && (currentTicket==(question_answered-1))){
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
                    if((currentTicket+1)<qNum && ((currentTicket+1)<=question_answered || !options.settings))
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

    function setQuestion(){
        if(pdd_questions.length>0 && pdd_questions.length-1>=currentTicket){
            setqNum(Math.min(options.num, pdd_questions.length));
            setCurrentQuestion(pdd_questions[currentTicket]);
        }
    }

    function startTimer(){
        timer++;
        let minutes = Math.floor(timer/60),
            seconds = timer%60,
            __time = (seconds<10)?("0"+seconds):seconds.toString();
        setTime(minutes+":"+__time);
    }

    function startTest(){
        setStart(true);
		getTickets(options, setQuestion);
        Timer = setInterval(startTimer, 1000);
    }

    function handleStartTest(){
        resetTest();
        startTest();
    }

    function testPause(){
        clearInterval(Timer);
        Timer = 0;
        setStart(false);
    }

    function continueTest(){
        if(endTest==true) return;
        Timer = setInterval(startTimer, 1000);
        setStart(true);
    }

    function selectAnswer(selectedAnswer: any){
        if(options.settings && currentTicket<question_answered) return;
        let _opened = [...opened];
        _opened.push(selectedAnswer);
        // save selected answer
        selected[currentTicket] = [..._opened];
        // current opened answers
        setOpened(_opened);
       if(results[currentTicket]==1 || results[currentTicket]==0) return;
       if(selectedAnswer != parseInt(pdd_questions[currentTicket].success)){
            errors++;
            results[currentTicket] = 1;
       }
       else
            results[currentTicket] = 0;

        question_answered++;
        if(options.settings && currentTicket==question_answered-1)
            next();
    }

    function showResult(indx: number){
        return (opened.indexOf(indx) != -1) ? ( (parseInt(pdd_questions[currentTicket].success)==indx) ? "success":"warning" ) : "";
    }

    function next(){
        if(question_answered<pdd_questions.length && question_answered<=options.num){
            goToPage(question_answered);
        }
        else if(question_answered>=props.options.num || question_answered>=pdd_questions.length){
            setEndTest(true);
            testPause();
        }   
    }

    function getBtnpageClass(i: number){
        let classname = "btn btn-page btn-default";
        if(currentTicket==i && results[i]!=1 && results[i]!=0)
            classname += " current-button";
        else if(currentTicket==i)
            classname += " current-finished-button";
        if(results[i]==1)
            classname += " btn-danger";
        else if(results[i]==0)   
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
        else if(ticketIndx==question_answered || !options.settings){
            setOpened([]);
            setCurrentTicket(ticketIndx);
        }
    }

    // handle change test options
    const handleChangeOption = (event: React.ChangeEvent<HTMLInputElement>, optionName: any) => {
        setOptions({...options, [optionName]: event.target.value});
    }

    const resetTest = () => {
        setStart(false);
        setOpened([]);
        setCurrentTicket(0);
        selected = [];
        clearInterval(Timer);
        setTime("0:00");
        Timer = 0;
        results = [];
        errors = 0;
        question_answered = 0
        timer = 0;
    }

    useEffect(()=>{
        setQuestion();
    }, [currentTicket]);
    
    useEffect(()=>{
        resetTest();
        if(!props.options.settings)
            startTest();
    }, [props.options.settings]);


    return (
        <div className="container">
            <div className={(options.settings===true)?"row":"hide"}>
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
                    <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio" checked={options.num==20} name="examSize" id="examSize20" value="20"/>20
                </label>
                <label className="radio-inline">
                    <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio" checked={options.num==40} name="examSize" id="examSize40" value="40"/>40
                </label>
                <label className="radio-inline">
                    <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio"  checked={options.num==60} name="examSize" id="examSize60" value="60"/>60
                </label>
                <label className="radio-inline">
                    <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio"  checked={options.num==80} name="examSize" id="examSize80" value="80"/>80
                </label>
                <label className="radio-inline">
                    <input disabled={start} onChange={(e)=>handleChangeOption(e, 'num')} type="radio"  checked={options.num==100} name="examSize" id="examSize100" value="100"/>100
                </label>
                &nbsp;&nbsp;&nbsp;
            </div>
            <div className="form-group">
                <label style={{display: "inline-block !important"}}>Ошибок &nbsp; </label>
                <input disabled={start} id="examErrorSize" onChange={(e)=>handleChangeOption(e, 'max_error')} value={options.max_error} type="number" min={1} max={100} />&nbsp;&nbsp;&nbsp;
            </div>
            <div className="checkbox">
                <label>
                    <input disabled={start} id="btnConfDoubleClick" onChange={(e)=>handleChangeOption(e, 'dblclick')} defaultChecked={options.dblclick} type="checkbox"/> Двойной клик
                </label>&nbsp;&nbsp;&nbsp;
            </div>
            <div className="checkbox">
                <label>
                    <input disabled={start} id="btnConfRandomVariants" onChange={(e)=>handleChangeOption(e, 'random')} defaultChecked={options.random} type="checkbox"/> Перемешивать ответы
                </label>
            </div>
        </form>
    </div>
            </div>
            <div className="row">
                <div id="buttonPanel" className={(start)?"btn-group btn-group-xs":"hide"}>
                    {
                        [...new Array(qNum)].map((v, i)=>(
                           <button onClick={()=>goToPage(i)} id={"btn_"+i} className={getBtnpageClass(i)} type="button">{i+1}</button>
                        ))
                    }
                </div>
            </div>
            <div className="row">
                <div className="col-lg-8 col-md-8 col-sm-8">    

                    <div className="row">
                        <div className="col-md-12 col-sm-12 myheader">
                            
                                <img className="img-responsive pull-left hidden-xs" style={{width: "75px"}} alt="логотип" src="./img/gibddlogo_pdd24.png" />
                                <h1 id="h1">Билеты ПДД 2023 экзамен ПДД</h1>
                                <p>Экзаменационные билеты пдд соответствуют экзамену ГИБДД
                                </p>

                                <span id="labelQuestNumber" className="label label-primary">Новые правила экзамена пдд 2023</span>
                                <span id="labelCategory" className="hide"> ABM </span>
                                <span id="labelTimer" className="label-info lead label" title="таймер" style={{cursor: "pointer"}}><span id="time">{time}</span>
                                    { (start==true) ? 
                                         <i onClick={testPause} className="bi bi-pause-fill pause-btn"></i>
                                        :
                                         <i onClick={continueTest} className="bi bi-play-fill pause-btn"></i>
                                    
                                    }
                                    </span>
                                <span id="labelBookmark" data-toggle="tooltip" data-placement="left" title="В закладки" style={{fontSize: "20px", color: "#5bc0de", cursor: "pointer"}} className="pull-right glyphicon glyphicon-star-empty"></span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-8 col-md-9 col-sm-12">
                    <div className="row">
                        <div className="col-md-12">
                            <div id="questPanel"  className={(start)?"":"hide"}>
                                <img id="questImage" className="img-responsive" width="100%" style={{maxWidth: "100%"}}
                                        src={(currentQuestion!==undefined)?currentQuestion.image:""}
                                        alt="картинка вопроса" />
                                <div id="questText" className="questtext">{(currentQuestion!==undefined)?currentQuestion.text:""}</div>
                                <div className="list-group">
                                    <div id="qlist">
                                        { (currentQuestion!=undefined) && (
                                            currentQuestion.variants.map((v,i)=>{
                                                return <a onDoubleClick={()=>{if(options.dblclick) selectAnswer(i)}} onClick={()=>{if(!options.dblclick) selectAnswer(i)}} id={i.toString()} className={"list-group-item questvariant "+showResult(i)}>{i+1}. {v.answer}</a>
                                            })
                                        )
                                        }
                                    </div>
                                    <div id="commentPanel" className={(opened.length>0)?"":"hide"}>
                                        <button onClick={next} id="questNext" type="button" className="list-group-item active">Далее <small className="text-warning small hidden-xs"> - Enter &nbsp;&nbsp;&nbsp; 1,2,3 - выбор &nbsp;&nbsp;&nbsp; &larr; назад &nbsp; вперед &rarr;</small></button>
                                        <div id="questComment" className="list-group-item"></div>
                                    </div>
                                </div>
                            </div>
                            <div className={(endTest==true)?"row":"hide row"}>
                                <div className="col-md-12">
                                    <div className="panel panel-primary">
                                        <div className="panel-heading lead">
                                            ошибок <span id="resultErrors" className="label label-danger">{errors}</span> из <span id="resultCount" className="label label-default">{options.num}</span>
                                        </div>
                                        <div className="panel-body">
                                            <p id="resultText" className="lead">
                                                {(options.max_error<errors) ?
                                                    (<><i style={{color: "#222", fontSize: "18px"}} className="bi bi-x-lg"></i> Экзамен не сдан. У вас более {options.max_error} ошибок</>)
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