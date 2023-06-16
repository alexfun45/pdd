import React, {useState, useEffect, PureComponent} from 'react';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import dayjs, { Dayjs } from 'dayjs';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label, LabelList } from 'recharts';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateRange } from '@mui/x-date-pickers-pro';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import {Modal, Button} from 'react-bootstrap';
import request from '../utils/request'


export default () => {
    const end = dayjs(), start = end.subtract(2, 'day');
    const [tickets, setTickets] = useState([]),
          [selectedTicketId, setTicketId] = useState(0),
          [correctChartData, setCorrectChart] = useState([]),
          [showResetModal, setShowResetModal] = useState(false),
          [incorrectChartData, setInCorrectChart] = useState([]),
          [manTime, setManTime] = useState([]),
          [currentDateRange, setDateRange] = React.useState<DateRange<Dayjs>>([
            start,
            end,
          ]);;

    useEffect(()=>{
        request({method: 'post', data: {action: "getTickets"}}).then(response => {
            const {data} = response;
            setTickets(data);
        });
    }, []);

    useEffect(()=>{
        if(selectedTicketId==0) return;
        if(currentDateRange[0]==null || currentDateRange[1]==null) return;
        request({method: "post", data: {action: "getStatistic", data: {ticketId: selectedTicketId, start_date: currentDateRange[0].unix(), end_date: currentDateRange[1].endOf('day').unix()}}}).then((response)=>{
            const {data} = response;
            if(data.correct!=null)
                setCorrectChart(data.correct);
            if(data.incorrect!=null)
                setInCorrectChart(data.incorrect);
            if(data.stat!=null)
                setManTime(data.stat);
        });
    }, [selectedTicketId, currentDateRange]);

    const ResetStat = () => {
        request({method: "post", data: {action: "resetStat"}});
    }

    const handleCloseReset = () => {
        setShowResetModal(false);
    }
  
    const handleChangeTicket = (event: SelectChangeEvent) => {
        setTicketId((event.target)?parseInt(event.target.value):0);
    }

    const handleDialogReset = () => {
        setShowResetModal(true);   
    }

    const CustomTooltip = ({ active, payload, label }:any) => {
        if (active && payload && payload.length) {
          return (
            <div className="custom-tooltip">
              <p className="label">{`минут ${label} : ${payload[0].value} человек`}</p>
            </div>
          );
        }      
        return null;
      }; 

    const CustomTooltipAvg = ({ active, payload, label }:any) => {
        if (active && payload && payload.length) {
            let incorrect_num = (payload[0].payload.incorrect_num)?payload[0].payload.incorrect_num:0,
                correct_num = (payload[0].payload.correct_num)?payload[0].payload.correct_num:0;
          return (
            <div className="custom-tooltip">
              <p style={{color: '#000'}} className="label">{`Вопрос ${label}`}</p>
              {/*<p className="label">{`Среднее время ответа правильных ответов: ${payload[0].payload.correct_avg} сек`}</p>
              <p className="label">{`Среднее время ответа неправильных ответов: ${payload[0].payload.incorrect_avg} сек`}</p>*/}
              <p style={{color: '#82ca9d'}} className="label">{`Количество правильно ответивших: ${correct_num}`}</p>
              <p style={{color: '#ffc658'}} className="label">{`Количество неправильно ответивших: ${incorrect_num}`}</p>
            </div>
          );
        }      
        return null;
      }; 
      
    const renderLegendText = (value: string, entry: any) => {
        const { color } = entry;
        switch(value){
            case "correct_avg": 
                return <span style={{ color }}>правильный ответ</span>;
            case "incorrect_avg":
                return <span style={{ color }}>неправильный ответ</span>;
        }
      };

    const renderCustomizedLabel = (props: any) => {
        const { x, y, width, height, value } = props;
        const barWidth = 10;
        return (
            <g>
                <text x={x + width / 2} y={y - barWidth} fill="#fff" textAnchor="middle" dominantBaseline="middle">
                    {(value>0)?value:""}
                </text>
            </g>
        )
    }



    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ minWidth: 320 }}>
            <h3>Статистика</h3>
            <FormControl sx={{minWidth: 200}}>
                <Select onChange={handleChangeTicket} label="Выберите билет">
                    <option>Выберите билет</option>
                    {
                        tickets.map((v)=>(
                            <MenuItem  value={v.id}>{v.name}</MenuItem>
                            ))
                        }
                </Select>
            </FormControl><br />
            <div style={{display:'inline-block', marginTop: '20px'}}>
                <DateRangePicker
                    value={currentDateRange}
                    onChange={(newValue) => setDateRange(newValue)}
                />
            </div>
            <div style={{marginTop: '15px', textAlign: 'center', marginBottom: '15px'}}><Button onClick={handleDialogReset} variant="danger">Сброс статистики</Button></div>
            <div id="chartWrapper" className={(correctChartData.length>0)?"chart-wrapper":"hide"}>
                  <h3>Статистика успешно пройденных вопросов</h3>
                  <BarChart
                      maxBarSize={50}
                      width={document.body.clientWidth*0.8}
                      height={400}
                      data={correctChartData}
                      margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                      >
                      <CartesianGrid strokeDasharray="1 2" />
                      <XAxis dataKey="name" >
                        <Label value="Вопросы" offset={0} position="insideBottomRight" />
                      </XAxis>
                      <YAxis label={{ value: 'среднее время(сек.)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip content={<CustomTooltipAvg />}/>
                      <Legend formatter={renderLegendText}/>
                      <Bar dataKey="correct_avg" stackId="a" fill="#82ca9d" >
                        <LabelList dataKey="correct_avg" content={renderCustomizedLabel} />
                      </Bar>
                      <Bar dataKey="incorrect_avg" stackId="b" fill="#ffc658" >
                        <LabelList dataKey="incorrect_avg" content={renderCustomizedLabel} />
                      </Bar>
                      
                    </BarChart>
                </div>
                <div id="chartWrapper" className={(correctChartData.length>0)?"chart-wrapper":"hide"}>
                    <h3>Статистика количества человек/времени прохождения</h3>
                    <BarChart
                        maxBarSize={50}
                        width={document.body.clientWidth*0.8}
                        height={400}
                        data={manTime}
                        margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis  dataKey="name" >
                            <Label value="Минут" offset={0} position="insideBottomRight" />
                        </XAxis>
                        <YAxis label={{ value: 'человек', angle: -90, position: 'insideLeft' }} />
                        <Tooltip content={<CustomTooltip />}/>
                        <Legend />
                        <Bar dataKey="человек" stackId="a" fill="#82ca9d" />
                    </BarChart>
                </div>  
        </Box>
        <Modal show={showResetModal} onHide={handleCloseReset}>
                <Modal.Header closeButton>
                <Modal.Title>Сброс статистики</Modal.Title>
                </Modal.Header>
                <Modal.Body>Вы действительно хотите сбросить всю статистику?</Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseReset}>
                    Нет
                </Button>
                <Button variant="primary" onClick={ResetStat}>
                    Да
                </Button>
                </Modal.Footer>
            </Modal>
        </LocalizationProvider>
    )
}