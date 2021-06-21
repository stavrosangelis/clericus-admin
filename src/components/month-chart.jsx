import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import {
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const APIPath = process.env.REACT_APP_APIPATH;

const Plot = () => {
  const [data, setData] = useState([]);
  const [ticks, setTicks] = useState(0);
  const [dateValues, setDateValues] = useState({ m: 0, y: 0 });
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const mounted = useRef(true);

  const CustomTooltip = useCallback(
    ({ active, payload }) => {
      if (active && payload && payload.length) {
        const values = payload[0].payload;
        const weekday = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        const newDate = new Date(dateValues.y, dateValues.m, values.x);
        const day = weekday[newDate.getDay()];
        const date = `${day}, ${values.x}-${dateValues.m + 1}-${dateValues.y}`;
        return (
          <div className="hint">
            <div>
              <b>Date:</b> {date}
            </div>
            <div>
              <b>New items:</b> {values.y}
            </div>
          </div>
        );
      }
      return null;
    },
    [dateValues]
  );

  useEffect(() => {
    const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
    const loadData = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}monthly-stats`,
        crossDomain: true,
      })
        .then((response) => {
          const empty = {
            year: '',
            month: '',
            items: [],
          };
          return response.data.data || empty;
        })
        .catch((error) => {
          console.log(error);
        });
      if (mounted.current) {
        // ticks
        const monthDays = getDaysInMonth(responseData.month, responseData.year);
        setDateValues({
          m: responseData.month,
          y: responseData.year,
        });
        const daysData = [];
        const days = [];
        for (let day = 0; day <= monthDays; day += 1) {
          daysData.push({ x: day, y: 0 });
          days.push(day);
        }
        days.splice(0, 1);
        setTicks(days);
        for (let i = 0; i < responseData.items.length; i += 1) {
          const item = responseData.items[i];
          daysData[item.day] = { x: item.day, y: item.count };
        }
        daysData.splice(0, 1);
        setData(daysData);
        setYear(responseData.year);
        setMonth(responseData.month - 1);
      }
    };
    loadData();
    return () => {
      mounted.current = false;
    };
  }, []);

  let content = (
    <div style={{ padding: '40pt', textAlign: 'center' }}>
      <Spinner type="grow" color="info" />
    </div>
  );

  if (data.length > 0) {
    content = (
      <ResponsiveContainer height={300}>
        <LineChart
          height={300}
          data={data}
          margin={{ top: 15, right: 5, bottom: 15, left: 0 }}
        >
          <CartesianGrid />
          <XAxis dataKey="x" ticks={ticks} padding={{ left: 20 }} />
          <YAxis dataKey="y" angle={-45} />
          <Line
            type="monotoneX"
            dataKey="y"
            stroke="red"
            dot={{ stroke: 'blue' }}
            isAnimationActive={false}
            strokeWidth={3}
          />
          <Tooltip content={<CustomTooltip />} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthText = months[month];
  return (
    <div>
      <h4>
        New items this month{' '}
        <div className="pull-right">
          {monthText} {year}
        </div>
      </h4>
      {content}
    </div>
  );
};

export default Plot;
