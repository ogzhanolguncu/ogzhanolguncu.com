import { Box } from '@chakra-ui/react';
import styled from '@emotion/styled';

export const BlinkContainer = styled(Box)`
  &:after {
    content: '|';
    animation: blink 500ms linear infinite alternate;
    margin-left: 5px;
  }

  @keyframes blink {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;
