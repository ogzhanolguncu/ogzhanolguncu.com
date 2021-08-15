import { Box, BoxProps, useBreakpointValue } from '@chakra-ui/react';
import styled from '@emotion/styled';
import Image from 'next/image';

type ChakraNextImageProps = {
  src: string;
  alt: string;
  loadingType?: 'eager' | 'lazy';
  nextWidth: string;
  nextHeight: string;
} & Omit<BoxProps, 'as'>;

export const ChakraNextImage = ({
  src,
  alt,
  loadingType = 'lazy',
  nextWidth,
  nextHeight,

  ...rest
}: ChakraNextImageProps) => {
  const borderradius = useBreakpointValue({ base: '50%', md: '16px' });

  return (
    <Box position="relative" {...rest}>
      <NextImage
        objectFit="cover"
        src={src}
        alt={alt}
        loading={loadingType}
        placeholder="blur"
        blurDataURL={'/static/images/350tiny.webp'}
        width={nextWidth}
        height={nextHeight}
        borderradius={borderradius}
      />
    </Box>
  );
};

const NextImage = styled(Image)<{ borderradius?: string }>`
  border-radius: ${(props) => props.borderradius};
`;
