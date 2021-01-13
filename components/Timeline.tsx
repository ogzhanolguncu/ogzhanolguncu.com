import React from 'react';
import TimelineItem from './TimeLineItem';
import timeLine from 'time-line.json';
import { TimeLineProps } from 'global';

const timeLineData: TimeLineProps[] = timeLine;

const Timeline = () => (
  <div className="timeline-container">
    {timeLineData.map((data, idx) => (
      <TimelineItem timeLineData={data} key={idx} />
    ))}
  </div>
);
export default Timeline;
