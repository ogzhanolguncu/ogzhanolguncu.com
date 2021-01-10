import { Heading, Text, Link as StyledLink, useColorMode, Box, Image } from '@chakra-ui/react';
import Link from 'next/link';

type Props = {
  id: string;
  img: string;
  title: string;
  description: string;
};

const Card = ({ id, img, title, description }: Props) => {
  const { colorMode } = useColorMode();
  return (
    <Link href={`blog/${id}`}>
      <StyledLink
        d="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="flex-start"
        backgroundColor={colorMode === 'light' ? '#fff' : 'transparent'}
        borderRadius="3px"
        _hover={{ textDecoration: 'none', bg: colorMode === 'light' ? '' : '' }}
      >
        <Image
          ignoreFallback
          alt={title}
          src={img}
          width="350px"
          height="160px"
          borderRadius="3px"
          boxShadow="0 3.3px calc(4px) rgba(0,0,0,0.02),0 calc(11.2px) 13.4px rgba(0,0,0,0.03),0 calc(50px) 60px rgba(0,0,0,0.05);"
        />
        <Box marginTop="1.5rem" d="flex" alignItems="flex-start" flexDirection="column">
          <Heading
            fontFamily="Inter"
            fontSize={['1.1rem', '1.1rem', '1.3rem', '1.3rem']}
            fontWeight="500"
            lineHeight="1.9rem"
            m={['.5rem 0 1.2rem', '.5rem 0 1rem', '1rem 0 1rem', '1rem 0 3rem']}
            color={colorMode === 'light' ? '#000' : '#fff'}
            height="96px"
            width="305px"
            textTransform="capitalize"
            letterSpacing="tight"
          >
            {title}
          </Heading>
          <Text
            fontSize="1rem"
            color={colorMode === 'light' ? 'rgb(103, 112, 126)' : 'rgb(143, 151, 163)'}
            lineHeight="1.75"
            fontWeight="400"
            maxWidth="305px"
            maxHeight="112px"
          >
            {description}
          </Text>
        </Box>
      </StyledLink>
    </Link>
  );
};

export default Card;
