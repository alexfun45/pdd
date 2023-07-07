import React, {useEffect, useState} from 'react'
import request from '../utils/request'
import Table from 'react-bootstrap/Table'
import InfoModal from './Tickets/InfoModal'

const tickets:number[] = [];
for(let i=1;i<=40;i++){
    tickets[i-1] = i;
}

export default () => {

    const [gradeData, setGradeData] = useState([]);
    const [open, setOpen] = useState(false),
          [fQuestions, setfQuestions] = useState([]),
          closeModal = () => setOpen(false);
   
    useEffect(()=>{
        request({method: 'post', data: {action: "getGrade"}}).then(response => {
            const {data} = response;
            setGradeData(data);
        });
    }, []);

    const handleClickItem = (user_id: number, session: string) => {
        request({method: 'post', data: {action: "getFailedQuestions", data: { user_id: user_id, testSession: session}}}).then(response => {
            const {data} = response;
            setfQuestions(data);
        });
        setOpen(true);
    }

    return (
        <div>
            <InfoModal showDialog={open} setOpen={setOpen} fQuestions={fQuestions}/>
            <Table style={{width: 'auto'}} className="users-table grad-table" responsive>
                <thead><tr><th style={{fontSize: "12px"}} rowSpan={2}>логин/id</th><th style={{textAlign: 'center'}} colSpan={41}>Билеты</th>
                </tr>
                <tr>
                    <th style={{fontSize: "12px"}}>дата</th>
                {
                    tickets.map((v, i)=>(
                        <th>{v}</th>
                    ))
                }
                </tr></thead>
                {
                    Object.entries(gradeData).map((userData:any, indx)=>(
                        <tr>
                            <td style={{fontSize: '12px'}}>{userData[0]}</td>
                            <td style={{fontSize: '12px'}}>{
                                Object.entries(userData[1]).map((d: any, i: number)=>{
                                    if(i>0) return;
                                    return d[1].time;
                                })
                                }
                            </td>
                            {
                             Object.entries(userData[1]).map((ticketData: any)=>(
                                <td><span onClick={()=>handleClickItem(userData[1].user_id, ticketData[1].session)} className='btnItem'>{ticketData[1].failed}</span></td>
                             ))
                            }
                        </tr>
                    ))
                }
            </Table>
            </div>
    )
}