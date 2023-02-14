
import {useState, useEffect, useRef} from "react";
import Pagination from 'react-bootstrap/Pagination';
import request from "../utils/request";
import CreateTicket from "./Tickets/createicket"

const MAX_TICKET_LENGTH = 64;

export default () => {
    const [tickets, setTickets] = useState([]),
          [page, setPage] = useState(1),
          [isEdit, setEditMode] = useState(false),
          [show, setShow] = useState(false),
          defaultTicket = {text: "", correct: 0, variants: [{answer: '', comment: ''}]};
          //[currentTicket, setCurrentTicket] = useState(defaultTicket);
    let currentTicket = useRef(defaultTicket);
    let items = Array(), active = 1;

    useEffect(()=>{
        if(show==false){
            currentTicket.current = defaultTicket;
            setEditMode(false);
        }
        else{
            return;
        }
        request({method: 'post', data:{action: 'getTickets', data: {page: page}}}).then( response => {
            const {data} = response;
            setTickets(data.data);
            const page_num = data.page_num;
            for(let number = 1; number <= page_num; number++) {
                items.push(
                    <Pagination.Item key={number} active={number === active}>
                      {number}
                    </Pagination.Item>
                )
            }
        });
        
    }, [show]);

    const editTicket = (id: number) => {
        request({method: 'post', data:{action: 'getTicket', data: {ticket_id: id}}}).then( response => {
            const {data} = response;
            let Ticket = {...data.ticket, variants: data.variants};
            //setCurrentTicket(Ticket);
            currentTicket.current = Ticket;
            setEditMode(true);
            setShow(true);
        });
    }

    return (
        <div className='block-wrapper'>
            <CreateTicket ticket={currentTicket} setShow={setShow} editMode={isEdit} show={show} />
            <div id='ticket-list'>
                {
                    tickets.map((v: {text: string, id: number},i: number)=>{
                        var text = (v.text.length>64) ? v.text.substr(0, MAX_TICKET_LENGTH) + "...":v.text;
                        return (
                            <div onClick={(e)=>editTicket(v.id)} className="ticket-wrapper extisted-ticket"><span>{text}</span></div>
                        )
                    })
                }
                <div onClick={() => setShow(true)} className="add-ticket" id="addTicket"><i className="addIcon">+</i></div>
            </div>
            <div className="page-wrapper">
                <Pagination>{items}</Pagination>
            </div>
        </div>
        )
}