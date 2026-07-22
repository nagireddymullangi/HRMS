import React from 'react';
import { Layout, Avatar, Dropdown, Badge, Space, Typography, MenuProps } from 'antd';
import { BellOutlined, UserOutlined, LogoutOutlined, KeyOutlined,
         SettingOutlined, DownOutlined, SunOutlined } from '@ant-design/icons';
import { useNavigate }              from 'react-router-dom';
import { useAuth }                  from '../../../hooks/useAuth';
import { ROUTES, ROLE_LABELS }      from '../../../constants';
import { getInitials, getAvatarColor, getGreeting } from '../../../utils/helpers';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface Props { collapsed: boolean; }

const Header: React.FC<Props> = ({ collapsed }) => {
  const navigate   = useNavigate();
  const { user, logout } = useAuth();

  const menuItems: MenuProps['items'] = [
    { key:'profile',    icon:<UserOutlined />,   label:'My Profile',       onClick:() => navigate(ROUTES.PROFILE) },
    { key:'change-pwd', icon:<KeyOutlined />,    label:'Change Password' },
    { key:'settings',   icon:<SettingOutlined />, label:'Settings',        onClick:() => navigate(ROUTES.SETTINGS) },
    { type:'divider' },
    { key:'logout',     icon:<LogoutOutlined />, label:'Logout', danger:true, onClick:logout },
  ];

  return (
    <AntHeader style={{ background:'#fff', padding:'0 24px', display:'flex',
                        alignItems:'center', justifyContent:'space-between',
                        boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
                        position:'sticky', top:0, zIndex:99, height:64 }}>
      {/* Greeting */}
      <div>
        <Text style={{ fontSize:16, fontWeight:600, color:'#1f2937' }}>
          <SunOutlined style={{ color:'#f59e0b', marginRight:8 }} />
          {getGreeting()}, <span style={{ color:'#2563eb' }}>{user?.username || 'User'}</span>!
        </Text>
      </div>

      {/* Right Actions */}
      <Space size={12} align="center">
        {/* Notifications */}
        <Badge count={5} size="small" offset={[-2, 2]}>
          <div style={{ width:38, height:38, borderRadius:10, background:'#f3f4f6',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        cursor:'pointer', fontSize:16, color:'#6b7280',
                        border:'1px solid #e5e7eb' }}>
            <BellOutlined />
          </div>
        </Badge>

        {/* User Dropdown */}
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer',
                        padding:'6px 10px', borderRadius:10, border:'1px solid #e5e7eb',
                        background:'#fafafa', transition:'all 0.2s' }}>
            <Avatar size={32} style={{ background: user ? getAvatarColor(user.username) : '#2563eb',
                                       fontSize:13, fontWeight:700 }}>
              {user ? getInitials(user.username) : 'U'}
            </Avatar>
            <div style={{ lineHeight:1.3 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#1f2937' }}>{user?.username}</div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>{user ? ROLE_LABELS[user.role] : ''}</div>
            </div>
            <DownOutlined style={{ fontSize:10, color:'#9ca3af' }} />
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};
export default Header;