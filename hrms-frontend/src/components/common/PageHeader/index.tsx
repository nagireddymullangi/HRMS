import React from 'react';
import { Breadcrumb, Button, Typography, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface BreadcrumbItem { label: string; path?: string; }
interface Props {
  title: string; subtitle?: string;
  breadcrumbs?: BreadcrumbItem[]; actions?: React.ReactNode;
  showBack?: boolean; backPath?: string;
}

const PageHeader: React.FC<Props> = ({ title, subtitle, breadcrumbs, actions, showBack, backPath }) => {
  const navigate = useNavigate();
  return (
    <div style={{ background:'#fff', padding:'16px 24px', borderRadius:'12px',
                  boxShadow:'0 1px 3px rgba(0,0,0,0.08)', marginBottom:24 }}>
      {breadcrumbs?.length && (
        <Breadcrumb style={{ marginBottom:8 }}
          items={breadcrumbs.map(b => ({
            title: b.path
              ? <span style={{ cursor:'pointer', color:'#2563eb' }} onClick={() => b.path && navigate(b.path)}>{b.label}</span>
              : b.label,
          }))} />
      )}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {showBack && (
            <Button icon={<ArrowLeftOutlined />} onClick={() => backPath ? navigate(backPath) : navigate(-1)}
              style={{ borderRadius:8, border:'1px solid #e5e7eb' }} />
          )}
          <div>
            <Title level={4} style={{ margin:0, color:'#1f2937' }}>{title}</Title>
            {subtitle && <Text style={{ color:'#6b7280', fontSize:13 }}>{subtitle}</Text>}
          </div>
        </div>
        {actions && <Space>{actions}</Space>}
      </div>
    </div>
  );
};
export default PageHeader;