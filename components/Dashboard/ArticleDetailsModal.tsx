import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  Text,
} from '@chakra-ui/core';
import React from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-undef
  blog?: Blog;
};

const ArticleDetailsModal = ({ isOpen, onClose, blog }: Props) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="lg">
      <ModalOverlay color="#ffffff33" />
      <ModalContent>
        <ModalHeader>{blog?.title}</ModalHeader>
        <Text textAlign="left" marginLeft="24px" fontWeight="bold">
          {blog?.date}
        </Text>
        <ModalCloseButton />
        <ModalBody>{blog?.description}</ModalBody>
        <Flex marginLeft="24px">
          {blog?.tags.map((tag, index) => (
            <Tag mr="5px" key={index}>
              {tag}
            </Tag>
          ))}
        </Flex>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ArticleDetailsModal;
