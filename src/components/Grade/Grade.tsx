import React, {useEffect, useState} from 'react'
import request from '../../utils/request'
import Table1 from 'react-bootstrap/Table'
import InfoModal from '../Tickets/InfoModal'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import UserGradeTable from './userGradeTable'

const tickets:number[] = [];

for(let i=1;i<=40;i++){
    tickets[i-1] = i;
}

type userStatType = {
    time: string;
    failed: number;
    user_id: number;
    session: string;
}

interface statsInterface {
    [key: string]: userStatType;
};

export default () => {

    const [gradeData, setGradeData] = useState<statsInterface>({"admin": {time: "22-45-2023", failed: 1, user_id:1, session:'123123123'}});
    const [open, setOpen] = useState(false),
          [fQuestions, setfQuestions] = useState([]),
          closeModal = () => setOpen(false),
          [selectedUser, setUser] = useState("");
   
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

    const handleUserClick = (login: string) => {
        setUser(login);
    }

    

    return (
        <div>
            <InfoModal showDialog={open} setOpen={setOpen} fQuestions={fQuestions}/>
            <TableContainer className={(selectedUser=="")?"":"hide"} sx={{ maxHeight: 640 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell rowSpan={2}>логин/id</TableCell>
                            {/*<TableCell colSpan={41}>Билеты</TableCell>*/}
                        </TableRow>
                        <TableRow>
                            <TableCell style={{fontSize: '12px'}}>дата</TableCell>
                            {
                                tickets.map((v, i)=>(
                                    <TableCell style={{padding: '6px 8px'}}>{v}</TableCell>
                                ))
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                        Object.entries(gradeData).map((userData:any, indx)=>(
                            <TableRow>
                                <TableCell style={{fontSize: '12px'}}><span onClick={(e)=>handleUserClick(userData[0])} className='btn-link'>{userData[0]}</span></TableCell>
                                <TableCell style={{fontSize: '12px', padding: '6px 8px'}}>{
                                    Object.entries(userData[1]).map((d: any, i: number)=>{
                                        if(i>0) return;
                                        return d[1].time;
                                    })
                                    }
                                </TableCell>
                                {
                                Object.entries(userData[1]).map((ticketData: any)=>(
                                    <TableCell><span onClick={()=>handleClickItem(userData[1].user_id, ticketData[1].session)} className='btnItem'>{ticketData[1].failed}</span></TableCell>
                                ))
                                }
                            </TableRow>
                        ))
                        }
                    </TableBody>
                    </Table>
                </TableContainer>
                <div className={(selectedUser=="")?"hide":""}>
                    { (selectedUser!="") && (
                        <UserGradeTable setUser={setUser} gradeData={gradeData[selectedUser]} handleClickItem={handleClickItem} />
                    )
                    }
                </div>
            <div>
            </div>
        </div>
    )
}