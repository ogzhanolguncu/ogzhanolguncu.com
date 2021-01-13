import { Flex } from '@chakra-ui/react';
import styled from '@emotion/styled';

export const TimeLineContainer = styled(Flex)`
  flex-direction: column;
  position: relative;
  margin: 2rem 0;
  width: 100%;
  &:after {
    content: '';
    position: absolute;
    left: calc(50% - 2px);
    width: 4px;
    height: 100%;
  }
`;
