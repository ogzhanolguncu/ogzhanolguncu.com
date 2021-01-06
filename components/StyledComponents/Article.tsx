import { Box } from '@chakra-ui/core';
import styled from '@emotion/styled';

export const Article = styled(Box)`
  display: flex;
  justify-content: space-between;
  width: 100%;
  border-radius: 20px;
  padding: 0.8rem 1rem;
  @media screen and (min-width: 1100px) {
    &:hover {
      background-color: ${(props) => (props.color === 'light' ? '#f6f8fb' : '#10151fbf')};
      transition: all 0.1s ease-in;
    }
  }
  @media screen and (max-width: 768px) {
    flex-direction: column;
    border-bottom: 1px solid #d6d9de;
    border-radius: 0;
    justify-content: center;
  }
`;
