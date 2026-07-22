import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Header  from '../Header';
import { storage } from '../../../utils/storage';

const { Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(storage.getSidebarCollapsed());

  const handleCollapse = (val: boolean) => {
    setCollapsed(val);
    storage.setSidebarCollapsed(val);
  };

  return (
    <Layout style={{ minHeight:'100vh' }}>
      <Sidebar collapsed={collapsed} onCollapse={handleCollapse} />
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition:'margin-left 0.2s' }}>
        <Header collapsed={collapsed} />
        <Content style={{ minHeight:'calc(100vh - 64px)', background:'#f1f5f9', padding:24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
export default MainLayout;