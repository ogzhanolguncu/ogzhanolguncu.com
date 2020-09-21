import { Box, Button, ButtonGroup } from '@chakra-ui/core';
import { ProtectRoute } from '@components/ProtectRoute';
import useAuth from '@contexts/AuthContext';
import React from 'react';

function Dashboard() {
  const { logout } = useAuth();

  return (
    <Box justifyContent="center" alignItems="center" d="flex" height="100vh">
      <ButtonGroup spacing={4}>
        <Button leftIcon={'moon'} variantColor="pink" variant="solid" onClick={logout}>
          Logout
        </Button>
      </ButtonGroup>
    </Box>
  );
}

export default ProtectRoute(Dashboard);
