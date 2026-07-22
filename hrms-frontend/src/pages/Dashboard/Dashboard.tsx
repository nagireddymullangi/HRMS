import React from "react";
import { Spin } from "antd";
import { useAuth } from "../../hooks/useAuth";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  // if(loading) {
  //   return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  // }

  if(user?.role === 'SUPER_ADMIN' || user?.role === 'HR_ADMIN' || user?.role === 'HR_MANAGER') {
    return <AdminDashboard />;
  }
  return <EmployeeDashboard user={user}/>;
};

export default Dashboard;