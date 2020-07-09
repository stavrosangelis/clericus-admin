import React, { useState, useEffect } from 'react';
import {
  Spinner
} from 'reactstrap';
import axios from 'axios';
import {
  FlexibleWidthXYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  LineMarkSeries,
  Hint
} from 'react-vis';

const APIPath = process.env.REACT_APP_APIPATH;

const Plot = props => {
  const [loading,setLoading] = useState(true);
  const [data,setData] = useState([]);
  const [ticks,setTicks] = useState([]);
  const [value,setValue] = useState(false);
  const [year,setYear] = useState(null);
  const [month,setMonth] = useState(null);

  useEffect(()=>{
    const loadData = async() => {
      let responseData = await axios({
          method: 'get',
          url: APIPath+'monthly-stats',
          crossDomain: true,
        })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
        console.log(error);
      });
      // x ticks
      let monthDays = new Date(responseData.year, responseData.month, 0).getDate();
      let days = [];
      let daysData = [];
      for (let day=1; day<=monthDays; day++) {
        days.push(day);
        daysData.push({x:day,y:0});
      };
      setTicks(days);
      for (let i=0; i<responseData.items.length; i++) {
        let item = responseData.items[i];
        daysData[item.day] = {x:item.day, y:item.count};
      }
      setData(daysData);
      setYear(responseData.year);
      setMonth(responseData.month-1);
    }
    if (loading) {
      loadData();
      setLoading(false);
    }
  },[loading]);

  const _tickFormat = (val) => {
    return val.toString();
  }

  let content = <div style={{padding: '40pt',textAlign: 'center'}}>
    <Spinner type="grow" color="info" />
  </div>;

  const updateHint = val => {
    let weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    let newDate = new Date(year, month, val.x);
    let day = weekday[newDate.getDay()];
    let date = day+", "+val.x+"-"+(month+1)+"-"+year;
    let hint = {date:date,x:val.x,y:val.y}
    setValue(hint);
  }
  if (!loading) {
    content = <FlexibleWidthXYPlot
      height={300}
      onMouseLeave={()=>setValue(false)}
      >
      <VerticalGridLines />
      <HorizontalGridLines />
      <XAxis
        tickValues={ticks}
        tickFormat={val=>_tickFormat(val)}
      />
      <YAxis tickLabelAngle={-60}/>
      <LineMarkSeries
        className="linemark-series-example"
        style={{
          strokeWidth: '3px'
        }}
        lineStyle={{stroke: 'red'}}
        markStyle={{stroke: 'blue'}}
        data={data}
        curve={'curveMonotoneX'}
        onNearestXY={val=>updateHint(val)}
      />
      {value ? <Hint value={value}>
        <div className="hint">
          <div><b>Date:</b> {value.date}</div>
          <div><b>New items:</b> {value.y}</div>
        </div>
      </Hint> : null}
    </FlexibleWidthXYPlot>
  }

  let months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  let monthText = months[month];
  return (
    <div>
      <h4>New items this month <div className="pull-right">{monthText} {year}</div></h4>
      {content}
    </div>
  );
}

export default Plot;
