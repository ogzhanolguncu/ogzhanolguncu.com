import { Box } from '@chakra-ui/react';

//SPACE -> &#32;
//QUOTE -> &#39;
//NEW LINE -> &#10;&#13;

export const CODE_USER_INFO = (
  <>
    <Box as="span" className="var-highlight" mr="8px">
      const
    </Box>
    userInfo = &#123; &#10;&#13;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32; name:
    <Box as="span" className="string-highlight">
      &#39;Oguzhan&#39;
    </Box>
    , &#10;&#13;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32; surname:
    <Box as="span" className="string-highlight">
      &#39;Olguncu&#39;
    </Box>
    , &#10;&#13;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32; location:
    <Box as="span" className="string-highlight">
      &#39;Istanbul/Turkey&#39;
    </Box>
    , &#10;&#13;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;&#32;technologies: [
    <Box as="span" className="string-highlight">
      &#10;&#13;&#32;&#32;&#32;&#32;&#32;&#32;&#39;Javascript&#39;
    </Box>
    ,
    <Box as="span" className="string-highlight">
      &#10;&#13;&#32;&#32;&#32;&#32;&#32;&#32;&#39;Typescript&#39;
    </Box>
    ,
    <Box as="span" className="string-highlight">
      &#10;&#13;&#32;&#32;&#32;&#32;&#32;&#32;&#39;React&#39;
    </Box>
    ]
    <Box as="span" d="flex">
      {'};'}
    </Box>
  </>
);
