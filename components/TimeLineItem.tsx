import { TimeLineProps } from 'global';
import React from 'react';

import { Box, Text } from '@chakra-ui/react';

type Props = {
  timeLineData: TimeLineProps;
};

const TimelineItem = ({ timeLineData }: Props) => {
  const {
    text,
    date,
    category: { color, tag },
  } = timeLineData;
  return (
    <Box className="timeline-item">
      <Box className="timeline-item-content">
        {/* <span className="tag" style={{ background: color }}>
          {tag}
        </span> */}
        <Text
          className="tag"
          color="#fff"
          fontSize="12px"
          fontWeight="bold"
          top="5px"
          left="5px"
          letterSpacing="1px"
          padding="5px"
          position="absolute"
          textTransform="uppercase"
          width={['calc(100% - 10px)', 'calc(100% - 10px)', 'auto', 'auto']}
          textAlign="center"
          background={color}
        >
          {tag}
        </Text>
        <Text color="#777" fontSize="12px" fontWeight="bold" marginTop={['25px', '25px', '0', '0']}>
          {date}
        </Text>
        <Text width="100%" fontSize="1rem" lineHeight="1.5rem" margin="15px 0">
          {text}
        </Text>
        <span className="circle" />
      </Box>
    </Box>
  );
};

export default TimelineItem;
