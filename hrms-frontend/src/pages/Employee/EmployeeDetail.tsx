import React, { useEffect, useState } from 'react';
import {
  Card, Row, Col, Avatar, Tag, Button, Tabs, Typography,
  Descriptions, Timeline, Badge, Progress, Statistic,
  Table, Space, Tooltip, Divider, Modal, Form,
  Input, Select, message, Skeleton, Empty, Alert,
} from 'antd';
import {
  UserOutlined, MailOutlined, PhoneOutlined,
  EditOutlined, DeleteOutlined, ArrowLeftOutlined,
  HomeOutlined, ContactsOutlined, MedicineBoxOutlined,
  BankOutlined, CalendarOutlined, ClockCircleOutlined,
  DollarOutlined, FileTextOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ExclamationCircleOutlined,
  PrinterOutlined, DownloadOutlined, MoreOutlined,
  TrophyOutlined, TeamOutlined, IdcardOutlined,
  HeartOutlined, GlobalOutlined, LockOutlined,
  UnlockOutlined, SwapOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams }      from 'react-router-dom';
import { employeeApi }                 from '../../api/employeeApi';
import { Employee, EmployeeStatus }    from '../../types/employee.types';
import {
  formatDate, formatDateTime, formatCurrency,
  getInitials, getAvatarColor, getYearsOfExperience,
  calculateAge,
} from '../../utils/helpers';
import {
  ROUTES, EMPLOYEE_STATUS_COLORS,
  ROLE_COLORS, LEAVE_STATUS_COLORS,
} from '../../constants';
import PageHeader     from '../../components/common/PageHeader';
import ConfirmDialog  from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const { Title, Text, Paragraph } = Typography;
const { TabPane }                 = Tabs;
const { TextArea }                = Input;

// ─── Mock Data (replace with API calls per module) ────
const mockAttendance = [
  { date: '2024-03-25', checkIn: '09:02', checkOut: '18:15', hours: 9.2,  status: 'PRESENT' },
  { date: '2024-03-24', checkIn: '08:55', checkOut: '18:00', hours: 9.1,  status: 'PRESENT' },
  { date: '2024-03-23', checkIn: '09:45', checkOut: '18:30', hours: 8.75, status: 'LATE'    },
  { date: '2024-03-22', checkIn: '—',     checkOut: '—',     hours: 0,    status: 'ABSENT'  },
  { date: '2024-03-21', checkIn: '09:00', checkOut: '13:00', hours: 4,    status: 'HALF_DAY'},
  { date: '2024-03-20', checkIn: '09:00', checkOut: '18:00', hours: 9,    status: 'PRESENT' },
  { date: '2024-03-19', checkIn: '—',     checkOut: '—',     hours: 0,    status: 'ON_LEAVE'},
];

const mockLeaves = [
  { id: 1, type: 'Annual',  from: '2024-03-19', to: '2024-03-19', days: 1, reason: 'Personal work',     status: 'APPROVED', appliedOn: '2024-03-15' },
  { id: 2, type: 'Sick',    from: '2024-02-12', to: '2024-02-14', days: 3, reason: 'Fever and cold',    status: 'APPROVED', appliedOn: '2024-02-12' },
  { id: 3, type: 'Casual',  from: '2024-01-26', to: '2024-01-26', days: 1, reason: 'Republic Day trip', status: 'APPROVED', appliedOn: '2024-01-20' },
  { id: 4, type: 'Annual',  from: '2024-04-10', to: '2024-04-12', days: 3, reason: 'Family function',   status: 'PENDING',  appliedOn: '2024-03-25' },
];

const mockPayslips = [
  { month: 'March 2024', basic: 45000, hra: 18000, allowances: 8000, deductions: 5500, tax: 4200, net: 61300, status: 'PAID' },
  { month: 'Feb 2024',   basic: 45000, hra: 18000, allowances: 8000, deductions: 5500, tax: 4200, net: 61300, status: 'PAID' },
  { month: 'Jan 2024',   basic: 45000, hra: 18000, allowances: 8000, deductions: 5500, tax: 4200, net: 61300, status: 'PAID' },
];

const mockTimeline = [
  { date: '2024-03-15', event: 'Promoted to Senior Developer',  type: 'success', icon: <TrophyOutlined /> },
  { date: '2024-01-01', event: 'Annual Appraisal — Rating 4.5', type: 'processing', icon: <TrophyOutlined /> },
  { date: '2023-09-10', event: 'Transferred to Engineering Dept',type: 'warning', icon: <SwapOutlined />  },
  { date: '2023-06-01', event: 'Completed Probation Period',    type: 'success', icon: <CheckCircleOutlined /> },
  { date: '2022-12-01', event: 'Joined as Junior Developer',    type: 'default', icon: <UserOutlined />   },
];

// ─── Status Tag Colors ────────────────────────────────
const attColors: Record<string, string> = {
  PRESENT:  'success', ABSENT:  'error', LATE:     'warning',
  HALF_DAY: 'orange',  ON_LEAVE:'processing', WEEKEND: 'default',
};

// ═══════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════
const EmployeeDetail: React.FC = () => {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();

  const [employee,    setEmployee]    = useState<Employee | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState('overview');

  // Modals
  const [deleteOpen,     setDeleteOpen]     = useState(false);
  const [statusOpen,     setStatusOpen]     = useState(false);
  const [noteOpen,       setNoteOpen]       = useState(false);
  const [deleting,       setDeleting]       = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus,      setNewStatus]      = useState<EmployeeStatus>('INACTIVE');
  const [statusNote,     setStatusNote]     = useState('');

  // ── Fetch Employee ─────────────────────────────────
  useEffect(() => {
    if (id) fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const res = await employeeApi.getById(Number(id));
      if (res.data) setEmployee(res.data);
      else { message.error('Employee not found'); navigate(ROUTES.EMPLOYEES); }
    } catch {
      message.error('Failed to load employee');
      navigate(ROUTES.EMPLOYEES);
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeApi.delete(Number(id));
      message.success('Employee deleted successfully');
      navigate(ROUTES.EMPLOYEES);
    } catch {
      message.error('Failed to delete employee');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  // ── Status Update ──────────────────────────────────
  const handleStatusUpdate = async () => {
    setUpdatingStatus(true);
    try {
      await employeeApi.updateStatus(Number(id), newStatus);
      setEmployee((prev) => prev ? { ...prev, status: newStatus } : null);
      message.success(`Employee status updated to ${newStatus}`);
      setStatusOpen(false);
      setStatusNote('');
    } catch {
      message.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage tip="Loading employee details..." />;
  if (!employee) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <Empty description="Employee not found" />
      <Button type="primary" onClick={() => navigate(ROUTES.EMPLOYEES)}
        style={{ marginTop: 16, borderRadius: 10 }}>
        Back to Employees
      </Button>
    </div>
  );

  // ─── Computed Values ────────────────────────────────
  const age        = calculateAge(employee.dateOfBirth);
  const experience = getYearsOfExperience(employee.joiningDate);
  const avatarBg   = getAvatarColor(employee.fullName || employee.firstName);
  const initials   = getInitials(employee.fullName || `${employee.firstName} ${employee.lastName}`);

  // ─── Attendance Summary (mock) ──────────────────────
  const attSummary = {
    present:  mockAttendance.filter((a) => a.status === 'PRESENT').length,
    absent:   mockAttendance.filter((a) => a.status === 'ABSENT').length,
    late:     mockAttendance.filter((a) => a.status === 'LATE').length,
    halfDay:  mockAttendance.filter((a) => a.status === 'HALF_DAY').length,
    onLeave:  mockAttendance.filter((a) => a.status === 'ON_LEAVE').length,
  };

  // ─── Leave Balance (mock) ───────────────────────────
  const leaveBalance = [
    { type: 'Annual',       total: 18, used: 6,  color: '#6366f1' },
    { type: 'Sick',         total: 12, used: 3,  color: '#ef4444' },
    { type: 'Casual',       total: 6,  used: 1,  color: '#22c55e' },
    { type: 'Compensatory', total: 3,  used: 0,  color: '#f59e0b' },
  ];

  // ═══════════════════════════════════════════════════
  // TAB: OVERVIEW
  // ═══════════════════════════════════════════════════
  const OverviewTab = () => (
    <Row gutter={[20, 20]}>
      {/* Personal Info */}
      <Col xs={24} lg={12}>
        <Card title={<CardTitle icon={<UserOutlined />} text="Personal Information" />}
          style={cardStyle}>
          <InfoRow icon={<IdcardOutlined />}    label="Employee ID"     value={employee.employeeId || `PTS${employee.id}`} />
          <InfoRow icon={<MailOutlined />}       label="Email"          value={employee.email} />
          <InfoRow icon={<PhoneOutlined />}      label="Phone"          value={employee.phone} />
          <InfoRow icon={<CalendarOutlined />}   label="Date of Birth"  value={`${formatDate(employee.dateOfBirth)} (Age ${age})`} />
          <InfoRow icon={<UserOutlined />}       label="Gender"         value={employee.gender} />
          <InfoRow icon={<HeartOutlined />}      label="Marital Status" value={employee.maritalStatus} />
          <InfoRow icon={<MedicineBoxOutlined />} label="Blood Group"   value={employee.bloodGroup} />
        </Card>
      </Col>

      {/* Employment Info */}
      <Col xs={24} lg={12}>
        <Card title={<CardTitle icon={<BankOutlined />} text="Employment Information" />}
          style={cardStyle}>
          <InfoRow icon={<BankOutlined />}       label="Department"      value={employee.departmentName} />
          <InfoRow icon={<TrophyOutlined />}     label="Designation"     value={employee.designationName} />
          <InfoRow icon={<TeamOutlined />}       label="Manager"         value={employee.managerName} />
          <InfoRow icon={<CalendarOutlined />}   label="Joining Date"    value={formatDate(employee.joiningDate)} />
          <InfoRow icon={<ClockCircleOutlined />} label="Experience"     value={experience} />
          <InfoRow icon={<FileTextOutlined />}   label="Employment Type" value={employee.employmentType?.replace('_', ' ')} />
          <InfoRow icon={<DollarOutlined />}     label="Salary (CTC)"   value={employee.salary ? formatCurrency(employee.salary) : '—'} />
        </Card>
      </Col>

      {/* Address */}
      <Col xs={24} lg={12}>
        <Card title={<CardTitle icon={<HomeOutlined />} text="Address" />}
          style={cardStyle}>
          {employee.address ? (
            <>
              <InfoRow icon={<HomeOutlined />}   label="Street"  value={employee.address.street} />
              <InfoRow icon={<GlobalOutlined />} label="City"    value={employee.address.city} />
              <InfoRow icon={<GlobalOutlined />} label="State"   value={employee.address.state} />
              <InfoRow icon={<GlobalOutlined />} label="Country" value={employee.address.country} />
              <InfoRow icon={<GlobalOutlined />} label="Pincode" value={employee.address.zipCode} />
            </>
          ) : (
            <Empty description="No address on record" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Card>
      </Col>

      {/* Emergency Contact */}
      <Col xs={24} lg={12}>
        <Card title={<CardTitle icon={<ContactsOutlined />} text="Emergency Contact" color="#ef4444" />}
          style={cardStyle}>
          {employee.emergencyContact ? (
            <>
              <InfoRow icon={<UserOutlined />}  label="Name"         value={employee.emergencyContact.name} />
              <InfoRow icon={<HeartOutlined />} label="Relationship" value={employee.emergencyContact.relationship} />
              <InfoRow icon={<PhoneOutlined />} label="Phone"        value={employee.emergencyContact.phone} />
              <InfoRow icon={<MailOutlined />}  label="Email"        value={employee.emergencyContact.email} />
            </>
          ) : (
            <Empty description="No emergency contact on record" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Card>
      </Col>
    </Row>
  );

  // ═══════════════════════════════════════════════════
  // TAB: ATTENDANCE
  // ═══════════════════════════════════════════════════
  const AttendanceTab = () => {
    const attCols = [
      {
        title: 'Date', dataIndex: 'date',
        render: (v: string) => <Text style={{ fontWeight: 500 }}>{formatDate(v)}</Text>,
      },
      {
        title: 'Check In', dataIndex: 'checkIn',
        render: (v: string) => <Text style={{ color: v === '—' ? '#9ca3af' : '#22c55e', fontWeight: 600 }}>{v}</Text>,
      },
      {
        title: 'Check Out', dataIndex: 'checkOut',
        render: (v: string) => <Text style={{ color: v === '—' ? '#9ca3af' : '#6366f1', fontWeight: 600 }}>{v}</Text>,
      },
      {
        title: 'Work Hours', dataIndex: 'hours',
        render: (v: number) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontWeight: 600, color: v >= 8 ? '#22c55e' : v > 0 ? '#f59e0b' : '#9ca3af' }}>
              {v > 0 ? `${v}h` : '—'}
            </Text>
            {v > 0 && (
              <Progress percent={Math.round((v / 9) * 100)} size="small"
                strokeColor={v >= 8 ? '#22c55e' : '#f59e0b'}
                style={{ width: 60, margin: 0 }} showInfo={false} />
            )}
          </div>
        ),
      },
      {
        title: 'Status', dataIndex: 'status',
        render: (v: string) => (
          <Tag color={attColors[v] || 'default'}
            style={{ borderRadius: 20, padding: '2px 12px', fontWeight: 600, fontSize: 11 }}>
            {v.replace('_', ' ')}
          </Tag>
        ),
      },
    ];

    return (
      <div>
        {/* Attendance Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {[
            { label: 'Present',  value: attSummary.present,  color: '#22c55e', bg: '#f0fdf4', icon: <CheckCircleOutlined /> },
            { label: 'Absent',   value: attSummary.absent,   color: '#ef4444', bg: '#fef2f2', icon: <CloseCircleOutlined /> },
            { label: 'Late',     value: attSummary.late,     color: '#f59e0b', bg: '#fffbeb', icon: <ClockCircleOutlined /> },
            { label: 'Half Day', value: attSummary.halfDay,  color: '#8b5cf6', bg: '#faf5ff', icon: <ExclamationCircleOutlined /> },
            { label: 'On Leave', value: attSummary.onLeave,  color: '#6366f1', bg: '#eef2ff', icon: <CalendarOutlined /> },
          ].map((s) => (
            <Col xs={12} sm={8} md={6} lg={4} key={s.label}>
              <div style={{
                background: s.bg, borderRadius: 14, padding: '16px 14px',
                textAlign: 'center', border: `1px solid ${s.color}22`,
              }}>
                <div style={{ color: s.color, fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Attendance Table */}
        <Card title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Recent Attendance — March 2024</span>
            <Button size="small" icon={<DownloadOutlined />}
              style={{ borderRadius: 8, fontSize: 12 }}>
              Export
            </Button>
          </div>
        } style={cardStyle}>
          <Table
            dataSource={mockAttendance}
            columns={attCols}
            rowKey="date"
            pagination={false}
            size="middle"
            style={{ borderRadius: 10, overflow: 'hidden' }}
            rowClassName={(r) =>
              r.status === 'ABSENT' ? 'absent-row' : ''
            }
          />
        </Card>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // TAB: LEAVES
  // ═══════════════════════════════════════════════════
  const LeavesTab = () => {
    const leaveCols = [
      {
        title: 'Leave Type', dataIndex: 'type',
        render: (v: string) => (
          <Tag color="blue" style={{ borderRadius: 20, fontWeight: 600, padding: '2px 10px' }}>
            {v}
          </Tag>
        ),
      },
      {
        title: 'Period', key: 'period',
        render: (_: any, r: any) => (
          <div>
            <Text style={{ fontWeight: 500 }}>{formatDate(r.from)}</Text>
            {r.from !== r.to && (
              <Text style={{ color: '#6b7280' }}> — {formatDate(r.to)}</Text>
            )}
          </div>
        ),
      },
      {
        title: 'Days', dataIndex: 'days',
        render: (v: number) => (
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#eef2ff', color: '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13,
          }}>
            {v}
          </div>
        ),
      },
      { title: 'Reason', dataIndex: 'reason',
        render: (v: string) => <Text style={{ color: '#6b7280', fontSize: 13 }}>{v}</Text> },
      { title: 'Applied On', dataIndex: 'appliedOn',
        render: (v: string) => <Text style={{ fontSize: 13 }}>{formatDate(v)}</Text> },
      {
        title: 'Status', dataIndex: 'status',
        render: (v: string) => (
          <Tag color={LEAVE_STATUS_COLORS[v] || 'default'}
            style={{ borderRadius: 20, padding: '2px 12px', fontWeight: 600, fontSize: 11 }}>
            {v}
          </Tag>
        ),
      },
    ];

    return (
      <div>
        {/* Leave Balance */}
        <Card title={<span style={{ fontWeight: 700 }}>Leave Balance — 2024</span>}
          style={{ ...cardStyle, marginBottom: 20 }}>
          <Row gutter={[16, 16]}>
            {leaveBalance.map((lb) => (
              <Col xs={24} sm={12} md={6} key={lb.type}>
                <div style={{
                  background: '#fafbfc', borderRadius: 14,
                  padding: 18, border: '1px solid #f1f5f9',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontWeight: 600, fontSize: 14 }}>{lb.type}</Text>
                    <Text style={{ color: lb.color, fontWeight: 700 }}>
                      {lb.total - lb.used}/{lb.total}
                    </Text>
                  </div>
                  <Progress
                    percent={Math.round((lb.used / lb.total) * 100)}
                    strokeColor={lb.color}
                    trailColor="#e5e7eb"
                    showInfo={false}
                    style={{ margin: 0 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <Text style={{ color: '#9ca3af', fontSize: 11 }}>Used: {lb.used}</Text>
                    <Text style={{ color: '#9ca3af', fontSize: 11 }}>Left: {lb.total - lb.used}</Text>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Leave History */}
        <Card title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Leave History</span>
            <Button type="primary" size="small"
              style={{ borderRadius: 8, background: '#6366f1', border: 'none', fontSize: 12 }}>
              Apply Leave
            </Button>
          </div>
        } style={cardStyle}>
          <Table dataSource={mockLeaves} columns={leaveCols}
            rowKey="id" pagination={false} size="middle"
            style={{ borderRadius: 10, overflow: 'hidden' }} />
        </Card>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // TAB: PAYROLL
  // ═══════════════════════════════════════════════════
  const PayrollTab = () => {
    const payrollCols = [
      {
        title: 'Month', dataIndex: 'month',
        render: (v: string) => <Text style={{ fontWeight: 600 }}>{v}</Text>,
      },
      {
        title: 'Basic',
        dataIndex: 'basic',
        render: (v: number) => formatCurrency(v),
      },
      {
        title: 'HRA',
        dataIndex: 'hra',
        render: (v: number) => formatCurrency(v),
      },
      {
        title: 'Allowances',
        dataIndex: 'allowances',
        render: (v: number) => formatCurrency(v),
      },
      {
        title: 'Deductions',
        dataIndex: 'deductions',
        render: (v: number) => (
          <Text style={{ color: '#ef4444', fontWeight: 500 }}>-{formatCurrency(v)}</Text>
        ),
      },
      {
        title: 'Tax',
        dataIndex: 'tax',
        render: (v: number) => (
          <Text style={{ color: '#f59e0b', fontWeight: 500 }}>-{formatCurrency(v)}</Text>
        ),
      },
      {
        title: 'Net Salary', dataIndex: 'net',
        render: (v: number) => (
          <Text style={{ fontWeight: 700, color: '#22c55e', fontSize: 15 }}>
            {formatCurrency(v)}
          </Text>
        ),
      },
      {
        title: 'Status', dataIndex: 'status',
        render: (v: string) => (
          <Tag color={v === 'PAID' ? 'success' : 'warning'}
            style={{ borderRadius: 20, fontWeight: 600, padding: '2px 12px' }}>
            {v}
          </Tag>
        ),
      },
      {
        title: 'Action', key: 'action',
        render: () => (
          <Tooltip title="Download Payslip">
            <Button icon={<DownloadOutlined />} size="small"
              style={{ borderRadius: 8, color: '#6366f1', borderColor: '#6366f1' }} />
          </Tooltip>
        ),
      },
    ];

    const latestPayroll = mockPayslips[0];
    return (
      <div>
        {/* Salary Breakdown Card */}
        <Card title={<span style={{ fontWeight: 700 }}>Salary Breakdown — {latestPayroll.month}</span>}
          style={{ ...cardStyle, marginBottom: 20 }}>
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={14}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Basic Salary',  value: latestPayroll.basic,      color: '#6366f1', type: 'add' },
                  { label: 'HRA',           value: latestPayroll.hra,        color: '#22c55e', type: 'add' },
                  { label: 'Allowances',    value: latestPayroll.allowances, color: '#0ea5e9', type: 'add' },
                  { label: 'Deductions',    value: latestPayroll.deductions, color: '#ef4444', type: 'sub' },
                  { label: 'Tax (TDS)',     value: latestPayroll.tax,        color: '#f59e0b', type: 'sub' },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '10px 16px',
                    background: '#fafbfc', borderRadius: 10,
                    border: '1px solid #f1f5f9',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: item.color,
                      }} />
                      <Text style={{ fontWeight: 500 }}>{item.label}</Text>
                    </div>
                    <Text style={{
                      fontWeight: 700, color: item.type === 'sub' ? '#ef4444' : item.color,
                    }}>
                      {item.type === 'sub' ? '- ' : '+ '}{formatCurrency(item.value)}
                    </Text>
                  </div>
                ))}

                {/* Divider */}
                <Divider style={{ margin: '4px 0' }} />

                {/* Net Salary */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', background: 'linear-gradient(135deg,#22c55e15,#16a34a10)',
                  borderRadius: 12, border: '1px solid #22c55e30',
                }}>
                  <Text style={{ fontWeight: 700, fontSize: 16 }}>Net Salary</Text>
                  <Text style={{ fontWeight: 800, fontSize: 20, color: '#22c55e' }}>
                    {formatCurrency(latestPayroll.net)}
                  </Text>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={10}>
              <div style={{
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                borderRadius: 16, padding: 24, color: '#fff', height: '100%',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <div>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Annual CTC</Text>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginTop: 4 }}>
                    {formatCurrency((latestPayroll.net) * 12)}
                  </div>
                </div>
                <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '16px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Monthly Gross</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
                      {formatCurrency(latestPayroll.basic + latestPayroll.hra + latestPayroll.allowances)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Total Deduction</div>
                    <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: 16 }}>
                      {formatCurrency(latestPayroll.deductions + latestPayroll.tax)}
                    </div>
                  </div>
                </div>
                <Button block style={{
                  marginTop: 16, borderRadius: 10, height: 40,
                  background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff', fontWeight: 600,
                }} icon={<DownloadOutlined />}>
                  Download Payslip
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Payroll History */}
        <Card title={<span style={{ fontWeight: 700 }}>Payroll History</span>} style={cardStyle}>
          <Table dataSource={mockPayslips} columns={payrollCols}
            rowKey="month" pagination={false} size="middle"
            style={{ borderRadius: 10, overflow: 'hidden' }}
            scroll={{ x: 800 }} />
        </Card>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // TAB: TIMELINE
  // ═══════════════════════════════════════════════════
  const TimelineTab = () => (
    <Card title={<span style={{ fontWeight: 700 }}>Employment History</span>}
      style={cardStyle}>
      <Timeline mode="left" style={{ padding: '16px 0' }}>
        {mockTimeline.map((item, idx) => (
          <Timeline.Item
            key={idx}
            color={
              item.type === 'success' ? 'green' :
              item.type === 'warning' ? 'orange' :
              item.type === 'processing' ? 'blue' : 'gray'
            }
            dot={
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background:
                  item.type === 'success' ? '#f0fdf4' :
                  item.type === 'warning' ? '#fffbeb' :
                  item.type === 'processing' ? '#eef2ff' : '#f9fafb',
                border: `2px solid ${
                  item.type === 'success' ? '#22c55e' :
                  item.type === 'warning' ? '#f59e0b' :
                  item.type === 'processing' ? '#6366f1' : '#e5e7eb'
                }`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color:
                  item.type === 'success' ? '#22c55e' :
                  item.type === 'warning' ? '#f59e0b' :
                  item.type === 'processing' ? '#6366f1' : '#9ca3af',
                fontSize: 14,
              }}>
                {item.icon}
              </div>
            }
          >
            <div style={{
              background: '#fafbfc', borderRadius: 12,
              padding: '14px 18px', border: '1px solid #f1f5f9',
              marginBottom: 4,
            }}>
              <Text style={{ fontWeight: 600, fontSize: 14, display: 'block' }}>
                {item.event}
              </Text>
              <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                {formatDate(item.date)}
              </Text>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );

  // ═══════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Employee Detail"
        subtitle={`Viewing profile of ${employee.fullName || `${employee.firstName} ${employee.lastName}`}`}
        showBack
        backPath={ROUTES.EMPLOYEES}
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.DASHBOARD },
          { label: 'Employees', path: ROUTES.EMPLOYEES },
          { label: employee.fullName || `${employee.firstName} ${employee.lastName}` },
        ]}
        actions={
          <Space>
            <Tooltip title="Print Profile">
              <Button icon={<PrinterOutlined />}
                style={{ borderRadius: 10, height: 40 }}
                onClick={() => window.print()} />
            </Tooltip>
            <Button
              icon={employee.status === 'ACTIVE' ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => {
                setNewStatus(employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
                setStatusOpen(true);
              }}
              style={{
                borderRadius: 10, height: 40,
                color: employee.status === 'ACTIVE' ? '#f59e0b' : '#22c55e',
                borderColor: employee.status === 'ACTIVE' ? '#f59e0b' : '#22c55e',
              }}
            >
              {employee.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              icon={<EditOutlined />}
              type="primary"
              onClick={() => navigate(`/employees/edit/${id}`)}
              style={{
                borderRadius: 10, height: 40,
                background: '#6366f1', border: 'none',
              }}
            >
              Edit
            </Button>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => setDeleteOpen(true)}
              style={{ borderRadius: 10, height: 40 }}
            >
              Delete
            </Button>
          </Space>
        }
      />

      {/* ── Profile Hero Card ── */}
      <Card style={{
        borderRadius: 20, border: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: 24, overflow: 'hidden',
      }}>
        {/* Banner */}
        <div style={{
          height: 120,
          background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%)',
          margin: '-24px -24px 0',
          position: 'relative',
        }}>
          {/* Pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%,rgba(255,255,255,0.1) 1px,transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
        </div>

        {/* Profile Content */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16, marginTop: -50,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <Avatar
                size={100}
                src={employee.profilePicture}
                style={{
                  background: avatarBg,
                  fontSize: 36, fontWeight: 800,
                  border: '4px solid #fff',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}
              >
                {initials}
              </Avatar>
              <div style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 20, height: 20, borderRadius: '50%',
                background: employee.status === 'ACTIVE' ? '#22c55e' : '#ef4444',
                border: '3px solid #fff',
              }} />
            </div>

            {/* Name & Info */}
            <div style={{ paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
                  {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                </Title>
                <Tag
                  color={EMPLOYEE_STATUS_COLORS[employee.status] || 'default'}
                  style={{ borderRadius: 20, fontWeight: 600, padding: '2px 12px' }}
                >
                  {employee.status}
                </Tag>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
                <Text style={{ color: '#6b7280', fontSize: 14 }}>
                  <BankOutlined style={{ marginRight: 4 }} />
                  {employee.designationName}
                </Text>
                <Text style={{ color: '#9ca3af' }}>•</Text>
                <Text style={{ color: '#6b7280', fontSize: 14 }}>
                  <TeamOutlined style={{ marginRight: 4 }} />
                  {employee.departmentName}
                </Text>
                <Text style={{ color: '#9ca3af' }}>•</Text>
                <Text style={{ color: '#6b7280', fontSize: 14 }}>
                  <IdcardOutlined style={{ marginRight: 4 }} />
                  {employee.employeeId || `PTS${employee.id}`}
                </Text>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                <Text style={{ color: '#6b7280', fontSize: 13 }}>
                  <MailOutlined style={{ marginRight: 4, color: '#6366f1' }} />
                  {employee.email}
                </Text>
                <Text style={{ color: '#6b7280', fontSize: 13 }}>
                  <PhoneOutlined style={{ marginRight: 4, color: '#22c55e' }} />
                  {employee.phone}
                </Text>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'flex', gap: 20, paddingBottom: 8 }}>
            {[
              { label: 'Experience',    value: experience,              color: '#6366f1' },
              { label: 'Leaves Used',   value: '10 / 36',              color: '#f59e0b' },
              { label: 'This Month',    value: `${attSummary.present} Days`, color: '#22c55e' },
            ].map((s) => (
              <div key={s.label} style={{
                textAlign: 'center', background: '#fafbfc',
                borderRadius: 12, padding: '10px 18px',
                border: '1px solid #f1f5f9', minWidth: 100,
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Tabs ── */}
      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          tabBarStyle={{ fontWeight: 600 }}
          items={[
            {
              key: 'overview',
              label: <span><UserOutlined />  Overview</span>,
              children: <OverviewTab />,
            },
            {
              key: 'attendance',
              label: <span><ClockCircleOutlined />  Attendance</span>,
              children: <AttendanceTab />,
            },
            {
              key: 'leaves',
              label: <span><CalendarOutlined />  Leaves</span>,
              children: <LeavesTab />,
            },
            {
              key: 'payroll',
              label: <span><DollarOutlined />  Payroll</span>,
              children: <PayrollTab />,
            },
            {
              key: 'timeline',
              label: <span><FileTextOutlined />  Timeline</span>,
              children: <TimelineTab />,
            },
          ]}
        />
      </Card>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Employee"
        message={`Are you sure you want to permanently delete ${employee.fullName}? This action cannot be undone.`}
        type="danger"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      {/* ── Status Update Modal ── */}
      <Modal
        open={statusOpen}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {newStatus === 'ACTIVE'
              ? <UnlockOutlined style={{ color: '#22c55e' }} />
              : <LockOutlined style={{ color: '#f59e0b' }} />}
            <span>
              {newStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'} Employee
            </span>
          </div>
        }
        onOk={handleStatusUpdate}
        onCancel={() => { setStatusOpen(false); setStatusNote(''); }}
        okText={newStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'}
        okButtonProps={{
          loading: updatingStatus,
          style: {
            borderRadius: 8,
            background: newStatus === 'ACTIVE' ? '#22c55e' : '#f59e0b',
            border: 'none',
          },
        }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        centered
        width={460}
      >
        <Alert
          message={
            newStatus === 'ACTIVE'
              ? 'This will restore the employee account and grant access.'
              : 'This will deactivate the employee account and revoke access.'
          }
          type={newStatus === 'ACTIVE' ? 'success' : 'warning'}
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
        <Form layout="vertical">
          <Form.Item label="Reason / Note (optional)">
            <TextArea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Add a note for this status change..."
              rows={3}
              style={{ borderRadius: 10 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ─── Helper Sub-Components ─────────────────────────────

const CardTitle: React.FC<{
  icon: React.ReactNode; text: string; color?: string;
}> = ({ icon, text, color = '#6366f1' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ color, fontSize: 16 }}>{icon}</span>
    <span style={{ fontWeight: 700, fontSize: 15 }}>{text}</span>
  </div>
);

const InfoRow: React.FC<{
  icon: React.ReactNode; label: string; value?: string | number | null;
}> = ({ icon, label, value }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 0', borderBottom: '1px solid #f8fafc',
  }}>
    <div style={{
      width: 34, height: 34, borderRadius: 10,
      background: '#eef2ff', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      color: '#6366f1', fontSize: 14, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: '#6b7280', fontSize: 13 }}>{label}</Text>
      <Text style={{ fontWeight: 600, fontSize: 13, color: '#1f2937', maxWidth: '60%', textAlign: 'right' }}>
        {value || '—'}
      </Text>
    </div>
  </div>
);

// ─── Shared Styles ─────────────────────────────────────
const cardStyle: React.CSSProperties = {
  borderRadius: 14,
  border: 'none',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};

export default EmployeeDetail;