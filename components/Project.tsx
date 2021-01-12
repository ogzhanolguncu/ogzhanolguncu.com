import { Flex, Heading, useColorMode } from '@chakra-ui/react';

import { useContext } from 'react';
import { ColorModeContext } from '@contexts/CustomColorContext';
import ProjectItems from './ProjectItem';

import projectsData from 'projects.json';

type projectProps = {
  redirectUrl: string;
  unicodeIcon: string;
  leftSide: string;
  rightSide: string;
};

const Project = () => {
  const colorModeObj = useContext(ColorModeContext);
  const { colorMode } = useColorMode();

  const projects: projectProps[] = projectsData;

  return (
    <Flex flexDirection="column" m="3rem 0">
      <Flex
        w="100%"
        borderBottom={['none', 'none', '1px solid #d6d9de', '1px solid #d6d9de']}
        alignItems="center"
        paddingBottom=".5rem"
      >
        <Heading
          fontSize={['1.7rem', '1.7rem', '2rem', '2rem']}
          color={colorModeObj.titleColor[colorMode]}
          padding="0.8rem 1rem"
        >
          Projects
        </Heading>
      </Flex>
      <Flex mt="1.5rem" width="100%" flexDirection="column">
        {projects.map((project, index) => (
          <ProjectItems
            key={index}
            redirectUrl={project.redirectUrl}
            unicodeIcon={project.unicodeIcon}
            leftSide={project.leftSide}
            rightSide={project.rightSide}
          />
        ))}
      </Flex>
    </Flex>
  );
};

export default Project;
