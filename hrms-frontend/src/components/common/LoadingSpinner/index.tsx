import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface Props { size?: 'small'|'default'|'large'; tip?: string; fullPage?: boolean; }

const LoadingSpinner: React.FC<Props> = ({ size = 'large', tip = 'Loading...', fullPage = false }) => {
  const icon = <LoadingOutlined style={{ fontSize: size === 'large' ? 36 : 24 }} spin />;
  if (fullPage) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
                  justifyContent:'center', minHeight:'100vh', gap:12, background:'#f9fafb' }}>
      <Spin indicator={icon} />
      <span style={{ color:'#6b7280', fontSize:14 }}>{tip}</span>
    </div>
  );
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 0' }}>
      <Spin indicator={icon} tip={tip} />
    </div>
  );
};
export default LoadingSpinner;