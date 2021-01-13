import React from 'react';
import TimelineItem from './TimeLineItem';
import timeLine from 'time-line.json';
import { TimeLineProps } from 'global';
import { TimeLineContainer } from 'components';
import { useColorMode } from '@chakra-ui/react';

const timeLineData: TimeLineProps[] = timeLine;

const Timeline = () => {
  const { colorMode } = useColorMode();

  return (
    <TimeLineContainer
      _after={{
        backgroundColor: colorMode === 'light' ? 'rgb(76, 110, 245, 0.8)' : 'rgb(26,32,44)',
      }}
    >
      {timeLineData.map((data, idx) => (
        <TimelineItem timeLineData={data} key={idx} />
      ))}
    </TimeLineContainer>
  );
};
export default Timeline;
