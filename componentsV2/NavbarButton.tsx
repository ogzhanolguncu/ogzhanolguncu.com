import { Button } from '@chakra-ui/react';
import Link from 'next/link';
import NavbarText from './NavbarTexts';

type NavbarProps = {
  text: string;
  href: string;
  LinkComponent: typeof Link;
};

const NavbarButton = ({ LinkComponent, text, href }: NavbarProps) => {
  return (
    <LinkComponent href={href} passHref>
      <Button as="a" variant="ghost" _hover={{ bg: 'rgba(0,0,0,.07)' }}>
        <NavbarText>{text}</NavbarText>
      </Button>
    </LinkComponent>
  );
};

export default NavbarButton;
