import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Link as StyledLink,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Text,
} from '@chakra-ui/core';
import Link from 'next/link';
import { ReactNode } from 'react';
import humanImg from 'images/human.jpg';
import React, { useState } from 'react';
import useAuth from '@contexts/AuthContext';

type Props = {
  children?: ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  const { logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Box w="100%" height="100vh" d="flex" justifyContent="center" alignItems="center" p="0 20px">
      <Flex
        w="100%"
        maxW="1328px"
        height="650px"
        boxShadow="0 27px 78px #709EFD"
        borderRadius="20px"
      >
        <Flex
          flexDirection="column"
          justifyContent="space-between"
          flex=".18"
          borderRight="1px solid #B0B0B0"
        >
          <Flex flexDirection="column" justifyContent="space-evenly" height="250px" m="5px 15px">
            <Heading mb="10px" p="10px 12px">
              S
            </Heading>
            <Link href="/dashboard">
              <StyledLink
                d="flex"
                alignItems="center"
                _hover={{ textDecoration: 'none', backgroundColor: '#F4F9FF' }}
                borderRadius="20px"
                p="10px 12px"
              >
                <Icon aria-label="dashboard" name="dashboard" size="1.5rem" marginRight="10px" />
                Dashboard
              </StyledLink>
            </Link>
            <Link href="/dashboard/article">
              <StyledLink
                d="flex"
                justifyContent="flex-start"
                alignItems="center"
                _hover={{ textDecoration: 'none', backgroundColor: '#F4F9FF' }}
                borderRadius="20px"
                p="10px 12px"
              >
                <Icon aria-label="article" name="article" size="1.5rem" marginRight="10px" />
                Articles
              </StyledLink>
            </Link>
            <Link href="/dashboard/task">
              <StyledLink
                d="flex"
                alignItems="center"
                _hover={{ textDecoration: 'none', backgroundColor: '#F4F9FF' }}
                borderRadius="20px"
                p="10px 12px"
              >
                <Icon aria-label="task" name="task" size="1.5rem" marginRight="10px" />
                Tasks
              </StyledLink>
            </Link>
          </Flex>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            p="20px 30px"
            borderTop="1px solid #B0B0B0"
            w="100%"
          >
            <Image w="30px" borderRadius="50%" src={humanImg} />
            <Text
              fontWeight="600"
              ml={['0', '0', '0', '-30px']}
              fontSize="14px"
              d={['none', 'none', 'flex', 'flex']}
              white-space="no-wrap"
              text-overflow="ellipsis"
            >
              Oğuzhan
            </Text>
            <Box>
              <Popover placement="bottom" closeOnBlur={false}>
                <PopoverTrigger>
                  <Icon aria-label="right" name="rightIcon" size="1.5rem" onClick={handleClick} />
                </PopoverTrigger>
                <PopoverContent zIndex={4} color="white" bg="blue.800" borderColor="blue.800">
                  <PopoverHeader pt={4} fontWeight="bold" border="0">
                    Logout
                  </PopoverHeader>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverBody>Are you sure, you want to logout ?</PopoverBody>
                  <PopoverFooter
                    border="0"
                    d="flex"
                    alignItems="center"
                    justifyContent="flex-start"
                    pb={4}
                  >
                    <Button
                      leftIcon={'moon'}
                      variantColor="pink"
                      variant="solid"
                      onClick={logout}
                      mr="10px"
                    >
                      Logout
                    </Button>
                  </PopoverFooter>
                </PopoverContent>
              </Popover>
            </Box>
          </Flex>
        </Flex>
        <Flex flex=".82" p="25px 20px" overflow="auto">
          {children}
        </Flex>
      </Flex>
    </Box>
  );
};

export default DashboardLayout;
