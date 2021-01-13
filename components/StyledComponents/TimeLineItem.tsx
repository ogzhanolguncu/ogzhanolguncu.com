import { Flex } from '@chakra-ui/react';
import styled from '@emotion/styled';

export const TimeLineItem = styled(Flex)`
  display: flex;
  justify-content: flex-end;
  padding-right: 30px;
  position: relative;
  margin: 10px 0;
  width: 50%;
  &:nth-child(odd) {
    align-self: flex-end;
    justify-content: flex-start;
    padding-left: 30px;
    padding-right: 0;
  }
`;
