import React from 'react';
import { Result, Button, Space } from 'antd';
import { useNavigate }  from 'react-router-dom';
import { useAuth }      from '../../hooks/useAuth';
import { ROUTES }       from '../../constants';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
                  justifyContent:'center', background:'#f1f5f9' }}>
      <Result status="403" title="403 — Access Denied"
        subTitle="You don't have permission to access this page. Please contact your administrator."
        extra={
          <Space>
            <Button onClick={() => navigate(-1)} style={{ borderRadius:8 }}>Go Back</Button>
            <Button type="primary" onClick={() => navigate(ROUTES.DASHBOARD)}
              style={{ borderRadius:8, background:'#2563eb', border:'none' }}>
              Dashboard
            </Button>
            <Button danger onClick={logout} style={{ borderRadius:8 }}>Logout</Button>
          </Space>
        } />
    </div>
  );
};
export default Unauthorized;