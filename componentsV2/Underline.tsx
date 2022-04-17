import { Box } from '@chakra-ui/react';
import styled from '@emotion/styled';

export const Underline = styled(Box)`
  background-size: 100% 15%;
  background-repeat: repeat-x;
  background-position: left 0% bottom 10%;
  padding-bottom: 7px;
  background-image: linear-gradient(
    181deg,
    #101010 0%,
    #101010db 15%,
    #0000003b 54%,
    transparent 100%
  );
`;
