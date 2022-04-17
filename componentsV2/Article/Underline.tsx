import { Box } from '@chakra-ui/react';
import styled from '@emotion/styled';

export const Underline = styled(Box)`
  background-image: linear-gradient(
    181deg,
    #101010 0%,
    #101010db 15%,
    #0000001a 54%,
    transparent 100%
  );
  background-size: 100% 3px;
  background-repeat: no-repeat;
  background-position: left bottom;
  padding-bottom: 7px;

  :hover {
    animation: Animation 1s ease;

    @keyframes Animation {
      from {
        background-size: 0% 3px;
      }
      to {
        background-size: 100% 3px;
      }
    }
  }
`;
