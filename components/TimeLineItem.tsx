import { TimeLineProps } from 'global';
import React from 'react';

import { Box, Text, useColorMode } from '@chakra-ui/react';
import { TimeLineItemContainer } from 'components';

type Props = {
  timeLineData: TimeLineProps;
};

const TimelineItem = ({ timeLineData }: Props) => {
  const { colorMode } = useColorMode();

  const {
    text,
    date,
    category: {
      color: { light, dark },
      tag,
    },
  } = timeLineData;
  return (
    <TimeLineItemContainer className="timeline-item">
      <Box
        className="timeline-item-content"
        backgroundColor={colorMode === 'light' ? '#fff' : 'rgb(26, 32, 44, 0.5)'}
        _after={{ backgroundColor: colorMode === 'light' ? '#fff' : 'rgb(26, 32, 44, 0.5)' }}
      >
        <Text
          className="tag"
          color="#fff"
          fontSize="12px"
          fontWeight="bold"
          top="10px"
          left={['5px', '5px', '15px', '15px']}
          borderRadius="3px"
          letterSpacing="1px"
          padding="5px"
          position="absolute"
          textTransform="uppercase"
          width={['calc(100% - 10px)', 'calc(100% - 10px)', 'auto', 'auto']}
          textAlign="center"
          background={colorMode === 'light' ? light : dark}
        >
          {tag}
        </Text>
        <Text color="#777" fontSize="12px" fontWeight="bold" marginTop={['4rem', '3rem', '0', '0']}>
          {date}
        </Text>
        <Text
          width="100%"
          fontSize={['.8rem', '0.8rem', '1rem', '1rem']}
          lineHeight="1.5rem"
          margin="15px 0"
        >
          {text}
        </Text>
        <Box
          className="circle"
          backgroundColor="#fff"
          border={`3px solid ${
            colorMode === 'light' ? 'rgb(76, 110, 245, 0.8)' : 'rgb(26, 32, 44, 0.5)'
          }`}
          borderRadius="50%"
          position="absolute"
          top="calc(50% - 10px)"
          right="-40px"
          width="20px"
          height="20px"
          zIndex="100"
        />
      </Box>
    </TimeLineItemContainer>
  );
};

export default TimelineItem;
