import React, { useEffect, useState } from 'react';
import {
  Card, Row, Col, Typography, Avatar, Tag,
  Progress, List, Badge, Spin,
} from 'antd';
import {
  TeamOutlined, CheckCircleOutlined,
  CalendarOutlined, ClockCircleOutlined,
  DollarOutlined, ArrowUpOutlined,
  UserAddOutlined, BellOutlined,
} from '@ant-design/icons';
import { useAuth }          from '../../hooks/useAuth';
import { employeeApi }      from '../../api/employeeApi';
import { attendanceApi }    from '../../api/attendanceApi';
import { leaveApi }         from '../../api/leaveApi';
import { payrollApi }       from '../../api/payrollApi';
import {
  getGreeting, formatCurrency,
  getAvatarColor, getInitials,
} from '../../utils/helpers';
import { ROLE_COLORS }      from '../../constants';

const { Title, Text } = Typography;

const AdminDashboard: React.FC = () => {
  const { user }                                    = useAuth();
  const [empStats,       setEmpStats]               = useState<any>(null);
  const [todayOverview,  setTodayOverview]           = useState<any>(null);
  const [leaveSummary,   setLeaveSummary]            = useState<any>(null);
  const [payrollSummary, setPayrollSummary]          = useState<any>(null);
  const [loading,        setLoading]                 = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes, lvRes] = await Promise.allSettled([
        employeeApi.getDashboardStats(),
        attendanceApi.getTodayOverview(),
        leaveApi.getSummary(),
      ]);

      if (empRes.status === 'fulfilled' && empRes.value.data)
        setEmpStats(empRes.value.data);
      if (attRes.status === 'fulfilled' && attRes.value.data)
        setTodayOverview(attRes.value.data);
      if (lvRes.status === 'fulfilled' && lvRes.value.data)
        setLeaveSummary(lvRes.value.data);

    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', height: 400,
      }}>
        <Spin size="large" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Employees',
      value:  empStats?.totalEmployees ?? '—',
      icon:   <TeamOutlined />,
      color:  '#6366f1', bg: '#eef2ff',
      change: 12,
    },
    {
      title: 'Present Today',
      value:  todayOverview?.present ?? '—',
      icon:   <CheckCircleOutlined />,
      color:  '#22c55e', bg: '#f0fdf4',
      change: 5,
    },
    {
      title: 'On Leave',
      value:  leaveSummary?.pendingRequests ?? '—',
      icon:   <CalendarOutlined />,
      color:  '#f59e0b', bg: '#fffbeb',
    },
    {
      title: 'New This Month',
      value:  empStats?.newJoineesThisMonth ?? '—',
      icon:   <UserAddOutlined />,
      color:  '#0ea5e9', bg: '#f0f9ff',
      change: 40,
    },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#1e293b,#334155)',
        borderRadius: 16, padding: '24px 32px',
        marginBottom: 24, position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage:
            'radial-gradient(circle at 80% 50%,' +
            'rgba(99,102,241,0.15),transparent 60%)',
        }} />
        <div style={{ position: 'relative' }}>
          <Text style={{
            color: 'rgba(255,255,255,0.5)', fontSize: 13,
          }}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric',
            })}
          </Text>
          <Title level={3} style={{
            color: '#fff', margin: '4px 0 8px',
          }}>
            {getGreeting()},{' '}
            <span style={{ color: '#818cf8' }}>
              {user?.username}
            </span>! 👋
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
            Here's what's happening in your organization today.
          </Text>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((s, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card style={{
              borderRadius: 16, border: 'none',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              background: s.bg,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
                <div>
                  <Text style={{
                    color: '#6b7280', fontSize: 12,
                    fontWeight: 500,
                  }}>
                    {s.title}
                  </Text>
                  <div style={{
                    fontSize: 28, fontWeight: 800,
                    color: s.color, marginTop: 4,
                  }}>
                    {s.value}
                  </div>
                  {s.change !== undefined && (
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: 4, marginTop: 6,
                    }}>
                      <ArrowUpOutlined style={{
                        color: '#22c55e', fontSize: 11,
                      }} />
                      <Text style={{
                        fontSize: 11, fontWeight: 600,
                        color: '#22c55e',
                      }}>
                        {s.change}% vs last month
                      </Text>
                    </div>
                  )}
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${s.color}18`,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22, color: s.color,
                }}>
                  {s.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Attendance Overview */}
      {todayOverview && (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <span style={{ fontWeight: 700 }}>
                  Today's Attendance
                </span>
              }
              style={{
                borderRadius: 16, border: 'none',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              }}
            >
              {[
                {
                  label: 'Present',
                  value: todayOverview.present,
                  color: '#22c55e',
                  total: todayOverview.total,
                },
                {
                  label: 'Absent',
                  value: todayOverview.absent,
                  color: '#ef4444',
                  total: todayOverview.total,
                },
                {
                  label: 'Late',
                  value: todayOverview.late,
                  color: '#f59e0b',
                  total: todayOverview.total,
                },
                {
                  label: 'On Leave',
                  value: todayOverview.onLeave,
                  color: '#6366f1',
                  total: todayOverview.total,
                },
              ].map((item) => (
                <div key={item.label} style={{ marginBottom: 14 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center', gap: 8,
                    }}>
                      <div style={{
                        width: 10, height: 10,
                        borderRadius: '50%',
                        background: item.color,
                      }} />
                      <Text style={{ fontWeight: 500 }}>
                        {item.label}
                      </Text>
                    </div>
                    <Text style={{
                      color: item.color, fontWeight: 700,
                    }}>
                      {item.value}
                    </Text>
                  </div>
                  <Progress
                    percent={item.total > 0
                      ? Math.round(
                          (item.value / item.total) * 100
                        )
                      : 0}
                    strokeColor={item.color}
                    trailColor="#f1f5f9"
                    showInfo={false}
                    style={{ margin: 0 }}
                  />
                </div>
              ))}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <span style={{ fontWeight: 700 }}>
                  Leave Summary
                </span>
              }
              style={{
                borderRadius: 16, border: 'none',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              }}
            >
              {leaveSummary && [
                {
                  label: 'Total Requests',
                  value: leaveSummary.totalRequests,
                  color: '#6366f1',
                },
                {
                  label: 'Pending',
                  value: leaveSummary.pendingRequests,
                  color: '#f59e0b',
                },
                {
                  label: 'Approved',
                  value: leaveSummary.approvedRequests,
                  color: '#22c55e',
                },
                {
                  label: 'Rejected',
                  value: leaveSummary.rejectedRequests,
                  color: '#ef4444',
                },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #f8fafc',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 10, height: 10,
                      borderRadius: '50%',
                      background: item.color,
                    }} />
                    <Text style={{ fontWeight: 500 }}>
                      {item.label}
                    </Text>
                  </div>
                  <Text style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: item.color,
                  }}>
                    {item.value}
                  </Text>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default AdminDashboard;