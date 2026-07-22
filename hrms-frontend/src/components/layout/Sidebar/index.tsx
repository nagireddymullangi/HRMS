import React from 'react';
import { Layout, Menu, Avatar, Tag, Tooltip } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined, TeamOutlined, ApartmentOutlined,
  ClockCircleOutlined, CalendarOutlined, DollarOutlined,
  BarChartOutlined, SettingOutlined, TrophyOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAuth }              from '../../../hooks/useAuth';
import { Role }                 from '../../../types/auth.types';
import { ROLE_COLORS, ROLE_LABELS } from '../../../constants';
import { getInitials, getAvatarColor } from '../../../utils/helpers';

const { Sider } = Layout;

const ICON_MAP: Record<string, React.ReactNode> = {
  DashboardOutlined:    <DashboardOutlined />,
  TeamOutlined:         <TeamOutlined />,
  ApartmentOutlined:    <ApartmentOutlined />,
  ClockCircleOutlined:  <ClockCircleOutlined />,
  CalendarOutlined:     <CalendarOutlined />,
  DollarOutlined:       <DollarOutlined />,
  TrophyOutlined:       <TrophyOutlined />,
  BarChartOutlined:     <BarChartOutlined />,
  SettingOutlined:      <SettingOutlined />,
};

const NAV_ITEMS = [
  { key:'/dashboard',  label:'Dashboard',   icon:'DashboardOutlined',   roles:[Role.SUPER_ADMIN,Role.HR_ADMIN,Role.HR_MANAGER,Role.EMPLOYEE] },
  { key:'/employees',  label:'Employees',   icon:'TeamOutlined',        roles:[Role.SUPER_ADMIN,Role.HR_ADMIN,Role.HR_MANAGER] },
  { key:'/departments',label:'Departments', icon:'ApartmentOutlined',   roles:[Role.SUPER_ADMIN,Role.HR_ADMIN,Role.HR_MANAGER] },
  { key:'/attendance', label:'Attendance',  icon:'ClockCircleOutlined', roles:[Role.SUPER_ADMIN,Role.HR_ADMIN,Role.HR_MANAGER,Role.EMPLOYEE] },
  { key:'/leaves',     label:'Leave',       icon:'CalendarOutlined',    roles:[Role.SUPER_ADMIN,Role.HR_ADMIN,Role.HR_MANAGER,Role.EMPLOYEE] },
  { key:'/payroll',    label:'Payroll',     icon:'DollarOutlined',      roles:[Role.SUPER_ADMIN,Role.HR_ADMIN,Role.HR_MANAGER] },
  { key:'/performance',label:'Performance', icon:'TrophyOutlined',      roles:[Role.SUPER_ADMIN,Role.HR_ADMIN,Role.HR_MANAGER,Role.EMPLOYEE] },
  { key:'/reports',    label:'Reports',     icon:'BarChartOutlined',    roles:[Role.SUPER_ADMIN,Role.HR_ADMIN,Role.HR_MANAGER] },
  { key:'/settings',   label:'Settings',    icon:'SettingOutlined',     roles:[Role.SUPER_ADMIN,Role.HR_ADMIN] },
];

interface Props { collapsed: boolean; onCollapse: (v: boolean) => void; }

const Sidebar: React.FC<Props> = ({ collapsed, onCollapse }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();

  const filtered  = NAV_ITEMS.filter(i => user?.role && i.roles.includes(user.role as Role));
  const activeKey = '/' + location.pathname.split('/')[1];

  return (
    <Sider collapsible collapsed={collapsed} trigger={null} width={240}
      style={{ background:'#0f172a', height:'100vh', position:'fixed',
               left:0, top:0, bottom:0, overflow:'auto', zIndex:100,
               boxShadow:'4px 0 12px rgba(0,0,0,0.2)' }}>

      {/* Logo */}
      <div onClick={() => navigate('/dashboard')}
        style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer',
                 padding: collapsed ? '18px 0' : '18px 16px',
                 justifyContent: collapsed ? 'center' : 'flex-start',
                 borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:4 }}>
        <div style={{ width:40, height:40, background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                      borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center',
                      fontWeight:800, color:'#fff', fontSize:14, flexShrink:0, boxShadow:'0 4px 12px rgba(59,130,246,0.4)' }}>
          HR
        </div>
        {!collapsed && (
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:16, lineHeight:1.2 }}>HRMS</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>Portal v1.0</div>
          </div>
        )}
      </div>

      {/* User Card */}
      {!collapsed && user && (
        <div style={{ margin:'8px 12px', padding:'12px', borderRadius:10,
                      background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Avatar size={38} style={{ background:getAvatarColor(user.username),
                                       fontWeight:700, fontSize:14, flexShrink:0 }}>
              {getInitials(user.username)}
            </Avatar>
            <div style={{ overflow:'hidden' }}>
              <div style={{ color:'#f1f5f9', fontWeight:600, fontSize:13,
                            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {user.username}
              </div>
              <Tag color={ROLE_COLORS[user.role]} style={{ fontSize:10, padding:'0 6px', margin:0, marginTop:2 }}>
                {ROLE_LABELS[user.role]}
              </Tag>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Menu theme="dark" mode="inline" selectedKeys={[activeKey]}
        style={{ background:'transparent', border:'none', marginTop:8 }}
        items={filtered.map(item => ({
          key:   item.key,
          icon:  collapsed
            ? <Tooltip title={item.label} placement="right">{ICON_MAP[item.icon]}</Tooltip>
            : ICON_MAP[item.icon],
          label: item.label,
          onClick: () => navigate(item.key),
          style: { borderRadius:8, margin:'2px 8px', width:'calc(100% - 16px)',
                   fontWeight:500, fontSize:14 },
        }))}
      />

      {/* Collapse Toggle */}
      <div style={{ position:'absolute', bottom:20, width:'100%',
                    display:'flex', justifyContent: collapsed ? 'center' : 'flex-end',
                    padding: collapsed ? 0 : '0 16px' }}>
        <div onClick={() => onCollapse(!collapsed)}
          style={{ width:32, height:32, background:'rgba(255,255,255,0.1)',
                   borderRadius:8, display:'flex', alignItems:'center',
                   justifyContent:'center', cursor:'pointer',
                   color:'rgba(255,255,255,0.6)', fontSize:15,
                   border:'1px solid rgba(255,255,255,0.1)',
                   transition:'all 0.2s' }}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </div>
    </Sider>
  );
};
export default Sidebar;