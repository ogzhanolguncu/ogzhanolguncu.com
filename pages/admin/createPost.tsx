import { withLoginRedirect } from '@components/index';
import { AdminLayout } from '@components/Admin';
import React from 'react';

const CreatePost = () => {
  return (
    <AdminLayout>
      <div>123123213</div>
    </AdminLayout>
  );
};

export default withLoginRedirect(CreatePost);
