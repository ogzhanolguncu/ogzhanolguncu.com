import { Heading, Text, Image, Link as StyledLink } from '@chakra-ui/core';
import Link from 'next/link';

type Props = {
  img: string;
  title: string;
  description: string;
};

const Card = ({ img, title, description }: Props) => {
  return (
    <Link href="/blog">
      <StyledLink
        d="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="flex-start"
        backgroundColor="#f6f8fb"
        borderRadius="20px"
        p="1.5rem"
        _hover={{ textDecoration: 'none', bg: '#E6E8EB' }}
      >
        <Image src={img} w={['50px', '50px', '80px', '80px']} />
        <Heading
          fontSize={['1.1rem', '1.1rem', '1.3rem', '1.3rem']}
          fontWeight="700"
          m={['.5rem 0 1rem', '.5rem 0 1rem', '1rem 0 1rem', '1rem 0 1rem']}
        >
          {title}
        </Heading>
        <Text fontSize="1.1rem" color="#787f87" lineHeight="1.5" fontWeight="400">
          {description}
        </Text>
      </StyledLink>
    </Link>
  );
};

export default Card;
