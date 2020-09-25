import { withLoginRedirect } from '@components/withAuth';
import { AdminLayout } from '@components/Admin';

function Dashboard() {
  return (
    <AdminLayout>
      <div>Dashboard</div>
    </AdminLayout>
  );
}

export default withLoginRedirect(Dashboard);
