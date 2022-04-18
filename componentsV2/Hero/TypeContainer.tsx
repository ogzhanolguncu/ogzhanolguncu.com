import { Box } from '@chakra-ui/react';
import styled from '@emotion/styled';

export const TypeContainer = styled(Box)`
  .var-highlight {
    color: #c0ad60;
  }
  .string-highlight {
    color: rgba(253, 149, 90, 0.8);
    margin-bottom: 5px;
    padding: 8px;
  }

  #typewriter {
    &:after {
      content: '|';
      animation: blink 500ms linear infinite alternate;
    }
  }

  @-webkit-keyframes blink {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @-moz-keyframes blink {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
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
