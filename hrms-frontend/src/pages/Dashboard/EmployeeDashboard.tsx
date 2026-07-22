import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin, Badge } from 'antd';
import { 
  CheckCircleOutlined, 
  CalendarOutlined, 
  DollarOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import { attendanceApi } from '../../api/attendanceApi';
import { leaveApi } from '../../api/leaveApi';
import { payrollApi } from '../../api/payrollApi';
import { getGreeting } from '../../utils/helpers'; // Assuming this is where getGreeting is

const { Title, Text } = Typography;

// Define TypeScript interfaces for your data
interface EmployeeData {
  attendance: { presentDays: number; totalDays: number };
  leave: { balance: number; pending: number };
  payroll: { latestSalary: number; status: string };
}

interface EmployeeDashboardProps {
  user: any; // Replace 'any' with your User interface (e.g., user.firstName)
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<EmployeeData | null>(null);

  useEffect(() => {
    const fetchMyData = async () => {
        setLoading(true);
      try {
        
        // Fetching from your various microservices simultaneously
        const [attendanceRes, leaveRes, payrollRes] = await Promise.allSettled([
          attendanceApi.getMyAttendance(), 
          leaveApi.getMyLeaveBalance(),
          payrollApi.getMyLatestPayroll()
        ]);

        setData({
          attendance: attendanceRes.status === 'fulfilled' ? attendanceRes.value : { presentDays: 0, totalDays: 0 },
          leave: leaveRes.status === 'fulfilled' ? leaveRes.value : { balance: 0, pending: 0 },
          payroll: payrollRes.status === 'fulfilled' ? payrollRes.value : { latestSalary: 0, status: 'Pending' }
        });
      } catch (error) {
        console.error("Failed to fetch employee dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyData();
  }, []);

  if (loading || !data) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>{getGreeting()}, {user?.firstName || 'Employee'}! 👋</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
        Here is your personalized overview.
      </Text>

      <Row gutter={[16, 16]}>
        {/* Attendance Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <CheckCircleOutlined style={{ fontSize: '20px', color: '#1890ff', marginRight: '8px' }} />
              <Text strong type="secondary">My Attendance</Text>
            </div>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              {data.attendance.presentDays} <Text type="secondary" style={{ fontSize: '14px' }}>/ {data.attendance.totalDays}</Text>
            </Title>
            <Text type="success" style={{ fontSize: '12px' }}><ArrowUpOutlined /> Present this month</Text>
          </Card>
        </Col>

        {/* Leaves Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <CalendarOutlined style={{ fontSize: '20px', color: '#fa8c16', marginRight: '8px' }} />
              <Text strong type="secondary">My Leaves</Text>
            </div>
            <Title level={2} style={{ margin: 0, color: '#fa8c16' }}>
              {data.leave.balance}
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>Available Balance ({data.leave.pending} pending)</Text>
          </Card>
        </Col>

        {/* Payroll Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <DollarOutlined style={{ fontSize: '20px', color: '#52c41a', marginRight: '8px' }} />
              <Text strong type="secondary">Latest Payslip</Text>
            </div>
            <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
              ₹{(data?.payroll.latestSalary || 0).toLocaleString()}
            </Title>
            <Badge 
              status={data?.payroll.status === 'Paid' ? 'success' : 'processing'} 
              text={`Status: ${data.payroll.status}`} 
              style={{ fontSize: '12px', marginTop: '4px' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDashboard;