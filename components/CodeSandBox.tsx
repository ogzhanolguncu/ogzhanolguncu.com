import { Box } from '@chakra-ui/react';
import React from 'react';

type Props = {
  width: string;
  src: string;
  height: string;
  title: string;
};

const CodeSandBox = ({ width = '100%', height = '500px', src, title }: Props) => {
  return (
    <Box
      as="iframe"
      tabIndex={-1}
      width={width}
      height={height}
      overflow="hidden"
      borderRadius="4px"
      border="0"
      shadow="md"
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      src={src}
      title={title}
    />
  );
};

export default CodeSandBox;
