import { Heading, Text, Image, Link as StyledLink, useColorMode } from '@chakra-ui/core';
import { ColorModeContext } from '@contexts/CustomColorContext';
import Link from 'next/link';
import { useContext } from 'react';

type Props = {
  id: string;
  img: string;
  title: string;
  description: string;
};

const Card = ({ id, img, title, description }: Props) => {
  const colorModeObj = useContext(ColorModeContext);
  const { colorMode } = useColorMode();

  return (
    <Link href={`blog/${id}`}>
      <StyledLink
        d="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="flex-start"
        backgroundColor={
          colorMode === 'light'
            ? colorModeObj.guidesBackgroundColor.light
            : colorModeObj.guidesBackgroundColor.dark
        }
        borderRadius="5px"
        boxShadow="rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;"
        p="1.5rem"
        _hover={{ textDecoration: 'none', bg: colorMode === 'light' ? '#E6E8EB' : '#fff' }}
      >
        <Image src={img} w={['50px', '50px', '80px', '80px']} />
        <Heading
          fontSize={['1.1rem', '1.1rem', '1.3rem', '1.3rem']}
          fontWeight="700"
          m={['.5rem 0 1rem', '.5rem 0 1rem', '1rem 0 1rem', '1rem 0 1rem']}
          color="black"
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
