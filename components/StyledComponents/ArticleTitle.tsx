import { Box } from '@chakra-ui/react';
import styled from '@emotion/styled';

export const ArticleTitle = styled(Box)`
  display: flex;
  @media screen and (max-width: 768px) {
    flex-direction: column;
    margin-bottom: 10px;
  }
`;
