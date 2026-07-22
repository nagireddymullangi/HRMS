import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Button, Input, Select, DatePicker,
  Tag, Typography, Row, Col, Avatar, Tooltip,
  Badge, Progress, Space, Modal, Form, message,
  Tabs, Drawer, Divider, Empty, Alert, Timeline,
  Statistic, Steps, Popover, Calendar, List,
  MenuProps, Dropdown, Result, InputNumber,
} from 'antd';
import {
  CalendarOutlined, CheckCircleOutlined,
  CloseCircleOutlined, SearchOutlined, ReloadOutlined,
  PlusOutlined, EditOutlined, UserOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined,
  CheckOutlined, StopOutlined, UndoOutlined,
  FileTextOutlined, TeamOutlined, BarChartOutlined,
  EyeOutlined, MoreOutlined, SendOutlined,
  InfoCircleOutlined, FilterOutlined,
  DownloadOutlined, BellOutlined, FireOutlined,
  ThunderboltOutlined, UnorderedListOutlined,
  AppstoreOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { useForm, Controller }   from 'react-hook-form';
import { yupResolver }           from '@hookform/resolvers/yup';
import * as yup                  from 'yup';
import dayjs, { Dayjs }          from 'dayjs';
import customParseFormat          from 'dayjs/plugin/customParseFormat';
import { leaveApi }              from '../../api/leaveApi';
import { employeeApi }           from '../../api/employeeApi';
import {
  Leave, LeaveRequest,
  LeaveStatus, LeaveType,
  LeaveBalance,
}                                from '../../types/leave.types';
import {
  formatDate, getInitials,
  getAvatarColor, calculateAge,
}                                from '../../utils/helpers';
import {
  ROUTES, PAGE_SIZE,
  LEAVE_STATUS_COLORS,
  LEAVE_TYPE_COLORS,
  LEAVE_TYPE_OPTIONS,
  DATE_FORMAT,
  DISPLAY_DATE_FORMAT,
}                                from '../../constants';
import PageHeader                from '../../components/common/PageHeader';
import ConfirmDialog             from '../../components/common/ConfirmDialog';
import LoadingSpinner            from '../../components/common/LoadingSpinner';
import { useDebounce }           from '../../hooks/useDebounce';
import { useAuth }               from '../../hooks/useAuth';

const { Text, Title, Paragraph } = Typography;
const { TextArea }               = Input;
const { Option }                 = Select;
const { RangePicker }            = DatePicker;

// ─── Validation Schema ─────────────────────────────────
const applyLeaveSchema = yup.object({
  employeeId: yup.number().min(1, 'Employee is required').required(),
  leaveType:  yup.string().required('Leave type is required'),
  startDate:  yup.string().required('Start date is required'),
  endDate:    yup.string().required('End date is required'),
  reason:     yup.string().min(10, 'Reason must be at least 10 characters').required(),
});

// ─── Leave Type Config ─────────────────────────────────
const LEAVE_TYPE_CONFIG: Record<string, {
  color: string; bg: string; icon: string; maxDays: number;
}> = {
  ANNUAL:       { color: '#6366f1', bg: '#eef2ff', icon: '🏖️',  maxDays: 18 },
  SICK:         { color: '#ef4444', bg: '#fef2f2', icon: '🤒',  maxDays: 12 },
  CASUAL:       { color: '#22c55e', bg: '#f0fdf4', icon: '☀️',  maxDays: 6  },
  MATERNITY:    { color: '#ec4899', bg: '#fdf2f8', icon: '👶',  maxDays: 90 },
  PATERNITY:    { color: '#0ea5e9', bg: '#f0f9ff', icon: '👨‍👶', maxDays: 15 },
  UNPAID:       { color: '#6b7280', bg: '#f9fafb', icon: '📋',  maxDays: 30 },
  COMPENSATORY: { color: '#f59e0b', bg: '#fffbeb', icon: '⚡',  maxDays: 5  },
};

// ─── Status Config ─────────────────────────────────────
const STATUS_CONFIG: Record<LeaveStatus, {
  color: string; bg: string; label: string;
  icon: React.ReactNode; antColor: string;
}> = {
  PENDING:   { color: '#f59e0b', bg: '#fffbeb', label: 'Pending',   icon: <ClockCircleOutlined />,        antColor: 'warning'   },
  APPROVED:  { color: '#22c55e', bg: '#f0fdf4', label: 'Approved',  icon: <CheckCircleOutlined />,        antColor: 'success'   },
  REJECTED:  { color: '#ef4444', bg: '#fef2f2', label: 'Rejected',  icon: <CloseCircleOutlined />,        antColor: 'error'     },
  CANCELLED: { color: '#6b7280', bg: '#f9fafb', label: 'Cancelled', icon: <StopOutlined />,               antColor: 'default'   },
};

// ─── Mock Data ─────────────────────────────────────────
const mockLeaves: Leave[] = [
  {
    id: 1, employeeId: 1, employeeName: 'John Doe',
    leaveType: 'ANNUAL', startDate: '2024-04-10', endDate: '2024-04-12',
    totalDays: 3, reason: 'Family vacation trip planned for spring break',
    status: 'PENDING', appliedOn: '2024-03-25', updatedAt: '2024-03-25',
  },
  {
    id: 2, employeeId: 2, employeeName: 'Sarah Smith',
    leaveType: 'SICK', startDate: '2024-03-20', endDate: '2024-03-22',
    totalDays: 3, reason: 'Fever and flu symptoms requiring rest',
    status: 'APPROVED', approvedByName: 'HR Manager',
    approvalNote: 'Get well soon!',
    appliedOn: '2024-03-20', updatedAt: '2024-03-20',
  },
  {
    id: 3, employeeId: 3, employeeName: 'Alex Johnson',
    leaveType: 'CASUAL', startDate: '2024-03-15', endDate: '2024-03-15',
    totalDays: 1, reason: 'Personal errand',
    status: 'APPROVED', approvedByName: 'HR Manager',
    appliedOn: '2024-03-13', updatedAt: '2024-03-14',
  },
  {
    id: 4, employeeId: 4, employeeName: 'Emma Wilson',
    leaveType: 'ANNUAL', startDate: '2024-04-01', endDate: '2024-04-05',
    totalDays: 5, reason: 'Planned annual vacation',
    status: 'REJECTED', approvedByName: 'HR Manager',
    approvalNote: 'Critical project deadline during this period',
    appliedOn: '2024-03-10', updatedAt: '2024-03-12',
  },
  {
    id: 5, employeeId: 5, employeeName: 'Mike Davis',
    leaveType: 'COMPENSATORY', startDate: '2024-03-28', endDate: '2024-03-29',
    totalDays: 2, reason: 'Compensation for weekend work on March 16-17',
    status: 'PENDING', appliedOn: '2024-03-22', updatedAt: '2024-03-22',
  },
  {
    id: 6, employeeId: 6, employeeName: 'Lisa Taylor',
    leaveType: 'MATERNITY', startDate: '2024-05-01', endDate: '2024-07-29',
    totalDays: 90, reason: 'Maternity leave',
    status: 'APPROVED', approvedByName: 'HR Admin',
    appliedOn: '2024-03-01', updatedAt: '2024-03-05',
  },
];

const mockBalance: LeaveBalance = {
  employeeId: 1, annual: 18, sick: 12, casual: 6,
  compensatory: 3, used: 10, remaining: 29,
};

// ─── Pending Count ─────────────────────────────────────
const pendingCount = mockLeaves.filter((l) => l.status === 'PENDING').length;
dayjs.extend(customParseFormat);
// ─── Leave Balance Card ────────────────────────────────
const LeaveBalanceCard: React.FC<{
  type: string; total: number; used: number;
}> = ({ type, total, used }) => {
  const cfg  = LEAVE_TYPE_CONFIG[type] || { color:'#6b7280', bg:'#f9fafb', icon:'📋' };
  const left = total - used;
  const pct  = Math.round((used / total) * 100);
  return (
    <div style={{
      background: cfg.bg, borderRadius: 14, padding: '16px',
      border: `1px solid ${cfg.color}22`, position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', right: -8, top: -8,
        fontSize: 42, opacity: 0.15, lineHeight: 1,
      }}>
        {cfg.icon}
      </div>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{cfg.icon}</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#1f2937', marginBottom: 2 }}>
        {type.charAt(0) + type.slice(1).toLowerCase()} Leave
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: cfg.color }}>{left}</span>
        <span style={{ color: '#9ca3af', fontSize: 13 }}>/ {total} days left</span>
      </div>
      <Progress
        percent={pct} size="small" showInfo={false}
        strokeColor={cfg.color} trailColor={`${cfg.color}22`}
        style={{ margin: 0 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={{ color: '#9ca3af', fontSize: 11 }}>Used: {used}</Text>
        <Text style={{ color: cfg.color, fontWeight: 700, fontSize: 11 }}>
          {100 - pct}% available
        </Text>
      </div>
    </div>
  );
};

// ─── Leave Status Badge ────────────────────────────────
const StatusBadge: React.FC<{ status: LeaveStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <Tag
      icon={cfg.icon}
      style={{
        borderRadius: 20, padding: '3px 12px',
        fontWeight: 600, fontSize: 12,
        background: cfg.bg, color: cfg.color,
        border: `1px solid ${cfg.color}33`,
      }}
    >
      {cfg.label}
    </Tag>
  );
};

// ─── Leave Type Badge ──────────────────────────────────
const LeaveTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const cfg = LEAVE_TYPE_CONFIG[type] || { color: '#6b7280', bg: '#f9fafb', icon: '📋' };
  return (
    <Tag style={{
      borderRadius: 20, padding: '2px 10px',
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}33`,
      fontWeight: 600, fontSize: 12,
    }}>
      {cfg.icon} {type.charAt(0) + type.slice(1).toLowerCase()}
    </Tag>
  );
};

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
const LeaveList: React.FC = () => {
  const { user, isAdmin, isHR }  = useAuth();

  // ── State ──────────────────────────────────────────
  const [leaves,        setLeaves]        = useState<Leave[]>([]);
  const [employees,     setEmployees]     = useState<{ id:number; fullName:string }[]>([]);
  const [leaveBalance,  setLeaveBalance]  = useState<LeaveBalance>({
  employeeId: user?.id || 0, annual: 0, sick: 0, casual: 0,
  compensatory: 0, used: 0, remaining: 0,});
  const [loading,       setLoading]       = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [activeTab,     setActiveTab]     = useState('list');
  const [searchText,    setSearchText]    = useState('');
  const [filterStatus,  setFilterStatus]  = useState<LeaveStatus | ''>('');
  const [filterType,    setFilterType]    = useState<LeaveType | ''>('');
  const [filterEmpId,   setFilterEmpId]   = useState<number | null>(null);
  const [dateRange,     setDateRange]     = useState<[Dayjs|null, Dayjs|null]|null>(null);

  // Modals
  const [applyOpen,     setApplyOpen]     = useState(false);
  const [viewLeave,     setViewLeave]     = useState<Leave | null>(null);
  const [viewOpen,      setViewOpen]      = useState(false);
  const [approveOpen,   setApproveOpen]   = useState(false);
  const [rejectOpen,    setRejectOpen]    = useState(false);
  const [cancelOpen,    setCancelOpen]    = useState(false);
  const [actionLeave,   setActionLeave]   = useState<Leave | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [approveNote,   setApproveNote]   = useState('');
  const [rejectNote,    setRejectNote]    = useState('');

  const debouncedSearch = useDebounce(searchText, 400);

  // ── Form ───────────────────────────────────────────
  const {
    control, handleSubmit, watch, reset,
    setValue, formState: { errors },
  } = useForm<LeaveRequest>({
    resolver: yupResolver(applyLeaveSchema) as any,
    defaultValues: {
      employeeId: user?.id || 0,
      leaveType:  'ANNUAL',
      startDate:  '',
      endDate:    '',
      reason:     '',
    },
  });

  const watchStart    = watch('startDate');
  const watchEnd      = watch('endDate');
  const watchType     = watch('leaveType') as LeaveType;
  const leaveDays     = watchStart && watchEnd
    ? dayjs(watchEnd,DATE_FORMAT).diff(dayjs(watchStart,DATE_FORMAT), 'day') + 1
    : 0;

  // ── Fetch ──────────────────────────────────────────
  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, [currentPage, filterStatus, filterType, filterEmpId, debouncedSearch]);

  const fetchLeaves = useCallback(async () => {
  setLoading(true);
  try {
    // Call your actual API. Make sure your API function accepts these params.
    const res = await leaveApi.getAll({
  page: currentPage - 1,
  size: PAGE_SIZE,
  status: filterStatus || undefined,
  leaveType: filterType || undefined,
  employeeId: filterEmpId || undefined,
  search: debouncedSearch || undefined,
   } as any); // The "as any" tells TypeScript to ignore the strict type checking
    
    // Adjust these based on your actual API response structure
    setLeaves(res.data?.content || []);
    setTotalElements(res.data?.totalElements || 0);
  } catch {
    message.error('Failed to load leave records');
  } finally {
    setLoading(false);
  }
}, [currentPage, filterStatus, filterType, filterEmpId, debouncedSearch]);

  const fetchEmployees = async () => {
    try {
      const res = await employeeApi.getAll({ page: 0, size: 300 });
      setEmployees((res.data?.content || []).map((e: any) => ({
        id:       e.id,
        fullName: e.fullName || `${e.firstName} ${e.lastName}`,
      })));
    } catch { /* silent */ }
  };

  // ── Apply Leave ────────────────────────────────────
  const onApplySubmit = async (data: LeaveRequest) => {
  setSubmitLoading(true);
  try {
    const completePayload: LeaveRequest = {
      ...data,
      employeeId: user?.id || 0,
    };
    await leaveApi.apply(completePayload);
    message.success('Leave application submitted successfully!');
    setApplyOpen(false);
    reset();
    
    fetchLeaves(); // Re-fetch from the server instead of manually pushing to state
  } catch (e: any) {
    message.error(e.response?.data?.message || 'Apply failed');
  } finally {
    setSubmitLoading(false);
  }
};

  // ── Approve ────────────────────────────────────────
  const handleApprove = async () => {
    if (!actionLeave) return;
    setActionLoading(true);
    try {
      await leaveApi.approve(actionLeave.id, approveNote);
      setLeaves((prev) => prev.map((l) =>
        l.id === actionLeave.id
          ? { ...l, status: 'APPROVED', approvalNote: approveNote, approvedByName: user?.username }
          : l
      ));
      message.success('Leave approved successfully!');
      setApproveOpen(false);
      setApproveNote('');
    } catch {
      message.error('Approve failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject ─────────────────────────────────────────
  const handleReject = async () => {
    if (!actionLeave || !rejectNote.trim()) {
      message.warning('Please provide a reason for rejection');
      return;
    }
    setActionLoading(true);
    try {
       await leaveApi.reject(actionLeave.id, rejectNote);
      setLeaves((prev) => prev.map((l) =>
        l.id === actionLeave.id
          ? { ...l, status: 'REJECTED', approvalNote: rejectNote, approvedByName: user?.username }
          : l
      ));
      message.success('Leave rejected');
      setRejectOpen(false);
      setRejectNote('');
    } catch {
      message.error('Reject failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Cancel ─────────────────────────────────────────
  const handleCancel = async () => {
    if (!actionLeave) return;
    setActionLoading(true);
    try {
      await leaveApi.cancel(actionLeave.id, 1);
      setLeaves((prev) => prev.map((l) =>
        l.id === actionLeave.id ? { ...l, status: 'CANCELLED' } : l
      ));
      message.success('Leave cancelled successfully');
      setCancelOpen(false);
    } catch {
      message.error('Cancel failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Stats ──────────────────────────────────────────
  const stats = {
    total:    leaves.length,
    pending:  leaves.filter((l) => l.status === 'PENDING').length,
    approved: leaves.filter((l) => l.status === 'APPROVED').length,
    rejected: leaves.filter((l) => l.status === 'REJECTED').length,
  };

  // ── Table Columns ──────────────────────────────────
  const columns = [
    {
      title: 'Employee',
      key:   'employee',
      render: (_: any, r: Leave) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size={40}
            style={{
              background: getAvatarColor(r.employeeName),
              fontWeight: 700, fontSize: 14, flexShrink: 0,
            }}>
            {getInitials(r.employeeName)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{r.employeeName}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              Applied {formatDate(r.appliedOn)}
            </div>
          </div>
        </div>
      ),
      sorter: (a: Leave, b: Leave) => a.employeeName.localeCompare(b.employeeName),
    },
    {
      title:     'Leave Type',
      dataIndex: 'leaveType',
      key:       'leaveType',
      render:    (v: string) => <LeaveTypeBadge type={v} />,
    },
    {
      title: 'Duration',
      key:   'duration',
      render: (_: any, r: Leave) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <CalendarOutlined style={{ color: '#6b7280', fontSize: 12 }} />
            <Text style={{ fontSize: 13, color: '#374151' }}>
              {formatDate(r.startDate)}
            </Text>
            {r.startDate !== r.endDate && (
              <>
                <Text style={{ color: '#9ca3af' }}>→</Text>
                <Text style={{ fontSize: 13, color: '#374151' }}>
                  {formatDate(r.endDate)}
                </Text>
              </>
            )}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: '#f1f5f9', borderRadius: 20,
            padding: '1px 10px',
          }}>
            <Text style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>
              {r.totalDays} {r.totalDays === 1 ? 'day' : 'days'}
            </Text>
          </div>
        </div>
      ),
      sorter: (a: Leave, b: Leave) => b.totalDays - a.totalDays,
    },
    {
      title:     'Reason',
      dataIndex: 'reason',
      key:       'reason',
      width:     200,
      render: (v: string) => (
        <Tooltip title={v}>
          <Text style={{ color: '#6b7280', fontSize: 13 }}>
            {v.length > 40 ? `${v.slice(0, 40)}…` : v}
          </Text>
        </Tooltip>
      ),
    },
    {
      title:     'Status',
      dataIndex: 'status',
      key:       'status',
      render:    (v: LeaveStatus) => <StatusBadge status={v} />,
      filters: Object.entries(STATUS_CONFIG).map(([k, v]) => ({
        text: v.label, value: k,
      })),
    },
    {
      title:  'Actions',
      key:    'actions',
      width:  180,
      render: (_: any, record: Leave) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view', icon: <EyeOutlined />, label: 'View Details',
            onClick: () => { setViewLeave(record); setViewOpen(true); },
          },
          ...(isHR && record.status === 'PENDING' ? [
            { type: 'divider' as const },
            {
              key: 'approve', icon: <CheckOutlined style={{ color: '#22c55e' }} />,
              label: <span style={{ color: '#22c55e', fontWeight: 600 }}>Approve</span>,
              onClick: () => { setActionLeave(record); setApproveOpen(true); },
            },
            {
              key: 'reject', icon: <CloseCircleOutlined style={{ color: '#ef4444' }} />,
              label: <span style={{ color: '#ef4444', fontWeight: 600 }}>Reject</span>,
              onClick: () => { setActionLeave(record); setRejectOpen(true); },
            },
          ] : []),
          ...(record.status === 'PENDING' ? [
            { type: 'divider' as const },
            {
              key: 'cancel', icon: <StopOutlined />, label: 'Cancel',
              onClick: () => { setActionLeave(record); setCancelOpen(true); },
            },
          ] : []),
        ];

        return (
          <Space size={6}>
            <Tooltip title="View">
              <Button size="small" icon={<EyeOutlined />}
                onClick={() => { setViewLeave(record); setViewOpen(true); }}
                style={{ borderRadius: 8, color: '#6366f1', borderColor: '#6366f1' }} />
            </Tooltip>

            {/* Approve / Reject for HR */}
            {isHR && record.status === 'PENDING' && (
              <>
                <Tooltip title="Approve">
                  <Button size="small" icon={<CheckOutlined />}
                    onClick={() => { setActionLeave(record); setApproveOpen(true); }}
                    style={{
                      borderRadius: 8, background: '#f0fdf4',
                      color: '#22c55e', borderColor: '#22c55e',
                    }} />
                </Tooltip>
                <Tooltip title="Reject">
                  <Button size="small" icon={<CloseCircleOutlined />}
                    onClick={() => { setActionLeave(record); setRejectOpen(true); }}
                    style={{
                      borderRadius: 8, background: '#fef2f2',
                      color: '#ef4444', borderColor: '#ef4444',
                    }} />
                </Tooltip>
              </>
            )}

            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button size="small" icon={<MoreOutlined />} style={{ borderRadius: 8 }} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Leave Management"
        subtitle={`${stats.pending} pending approvals · ${totalElements} total requests`}
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.DASHBOARD },
          { label: 'Leave Management' },
        ]}
        actions={
          <Space>
            {stats.pending > 0 && isHR && (
              <Badge count={stats.pending} size="small">
                <Button icon={<BellOutlined />}
                  style={{ borderRadius: 10, height: 40, color: '#f59e0b', borderColor: '#f59e0b' }}>
                  {stats.pending} Pending
                </Button>
              </Badge>
            )}
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={fetchLeaves}
                style={{ borderRadius: 10, height: 40 }} />
            </Tooltip>
            <Button icon={<DownloadOutlined />}
              style={{ borderRadius: 10, height: 40 }}>
              Export
            </Button>
            <Button
              type="primary" icon={<PlusOutlined />}
              onClick={() => {
                reset({ employeeId: user?.id || 0, leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' });
                setApplyOpen(true);
              }}
              style={{
                borderRadius: 10, height: 40,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border: 'none', fontWeight: 600,
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              }}
            >
              Apply Leave
            </Button>
          </Space>
        }
      />

      {/* ── Leave Balance ── */}
      <Card style={{
        borderRadius: 16, border: 'none',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        marginBottom: 24,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 20,
        }}>
          <div>
            <Title level={5} style={{ margin: 0 }}>My Leave Balance — {dayjs().year()}</Title>
            <Text style={{ color: '#6b7280', fontSize: 13 }}>
              Total {leaveBalance.remaining} days remaining out of {leaveBalance.annual + leaveBalance.sick + leaveBalance.casual + leaveBalance.compensatory}
            </Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Total Used</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#6366f1' }}>
              {leaveBalance.used} days
            </div>
          </div>
        </div>
        <Row gutter={[14, 14]}>
          {[
            { type: 'ANNUAL',       total: leaveBalance.annual,       used: 0  },
            { type: 'SICK',         total: leaveBalance.sick,         used: 0  },
            { type: 'CASUAL',       total: leaveBalance.casual,       used: 0  },
            { type: 'COMPENSATORY', total: leaveBalance.compensatory, used: 0  },
          ].map((b) => (
            <Col xs={12} sm={6} key={b.type}>
              <LeaveBalanceCard {...b} />
            </Col>
          ))}
        </Row>
      </Card>

      {/* ── Stats Row ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label:'Total Requests', value: stats.total,    color:'#6366f1', bg:'#eef2ff', icon:<FileTextOutlined />         },
          { label:'Pending',        value: stats.pending,  color:'#f59e0b', bg:'#fffbeb', icon:<ClockCircleOutlined />       },
          { label:'Approved',       value: stats.approved, color:'#22c55e', bg:'#f0fdf4', icon:<CheckCircleOutlined />       },
          { label:'Rejected',       value: stats.rejected, color:'#ef4444', bg:'#fef2f2', icon:<CloseCircleOutlined />       },
        ].map((s) => (
          <Col xs={12} md={6} key={s.label}>
            <Card style={{
              borderRadius: 16, border: 'none',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              background: s.bg,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text style={{ color: '#6b7280', fontSize: 13 }}>{s.label}</Text>
                  <div style={{ fontSize: 30, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  background: `${s.color}18`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: s.color,
                }}>
                  {s.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Main Content Tabs ── */}
      <Card style={{
        borderRadius: 16, border: 'none',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ fontWeight: 600 }}
          items={[
            // ── ALL LEAVES TAB ──────────────────────
            {
              key:   'list',
              label: <span><UnorderedListOutlined /> All Leaves</span>,
              children: (
                <div>
                  {/* Filters Row */}
                  <div style={{
                    display: 'flex', gap: 12, flexWrap: 'wrap',
                    marginBottom: 16, alignItems: 'center',
                  }}>
                    <Input
                      placeholder="Search employee..."
                      prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                      value={searchText}
                      onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                      style={{ width: 220, borderRadius: 10, height: 40 }}
                      allowClear
                    />
                    <Select
                      value={filterStatus || undefined}
                      onChange={(v) => { setFilterStatus(v || ''); setCurrentPage(1); }}
                      placeholder="All Status"
                      allowClear style={{ width: 140 }}
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <Option key={k} value={k}>
                          <StatusBadge status={k as LeaveStatus} />
                        </Option>
                      ))}
                    </Select>
                    <Select
                      placeholder="Select Leave Type"
                      onChange={(v) => {
                        setFilterType(v || ''); setCurrentPage(1);
                      }}
                    >
                      {LEAVE_TYPE_OPTIONS.map((o) => (
                        <Option key={o.value} value={o.value}>
                          <span>
                            {LEAVE_TYPE_CONFIG[o.value]?.icon} {o.label}
                          </span>
                        </Option>
                      ))}
                    </Select>
                    {isHR && (
                      <Select
                        onChange={(v) => { setFilterEmpId(v || null); setCurrentPage(1); }}
                        placeholder="All Employees"
                        allowClear showSearch
                        optionFilterProp="children"
                        style={{ width: 190 }}
                      >
                        {employees.map((e) => (
                          <Option key={e.id} value={e.id}>
                            <Avatar size={18} style={{
                              background: getAvatarColor(e.fullName),
                              fontSize: 8, fontWeight: 700, marginRight: 6,
                            }}>
                              {getInitials(e.fullName)}
                            </Avatar>
                            {e.fullName}
                          </Option>
                        ))}
                      </Select>
                    )}
                    {(filterStatus || filterType || filterEmpId || searchText) && (
                      <Button size="small"
                        onClick={() => {
                          setFilterStatus(''); setFilterType('');
                          setFilterEmpId(null); setSearchText('');
                        }}
                        style={{ borderRadius: 8, color: '#ef4444', borderColor: '#ef4444' }}>
                        Clear Filters
                      </Button>
                    )}
                  </div>

                  {/* Pending Alert */}
                  {isHR && stats.pending > 0 && (
                    <Alert
                      message={`${stats.pending} leave request${stats.pending > 1 ? 's' : ''} awaiting your approval`}
                      type="warning"
                      showIcon
                      icon={<BellOutlined />}
                      style={{ marginBottom: 16, borderRadius: 10 }}
                      action={
                        <Button size="small" style={{ borderRadius: 8 }}
                          onClick={() => setFilterStatus('PENDING')}>
                          View Pending
                        </Button>
                      }
                    />
                  )}

                  <Table
                    dataSource={leaves}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      current:  currentPage,
                      pageSize: PAGE_SIZE,
                      total:    totalElements,
                      onChange: (p) => setCurrentPage(p),
                      showSizeChanger: false,
                      showTotal: (t) => (
                        <Text style={{ color: '#6b7280', fontSize: 13 }}>
                          Total <strong>{t}</strong> leave requests
                        </Text>
                      ),
                    }}
                    size="middle"
                    style={{ borderRadius: 12, overflow: 'hidden' }}
                    rowClassName={(r) =>
                      r.status === 'PENDING'
                        ? 'pending-row'
                        : r.status === 'REJECTED'
                          ? 'rejected-row'
                          : ''
                    }
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={<Text style={{ color: '#9ca3af' }}>No leave requests found</Text>}
                        >
                          <Button type="primary" icon={<PlusOutlined />}
                            onClick={() => setApplyOpen(true)}
                            style={{ borderRadius: 10, background: '#6366f1', border: 'none' }}>
                            Apply Leave
                          </Button>
                        </Empty>
                      ),
                    }}
                  />
                </div>
              ),
            },

            // ── PENDING APPROVALS TAB ───────────────
            ...(isHR ? [{
              key:   'pending',
              label: (
                <span>
                  <ClockCircleOutlined />
                  Pending Approvals
                  {stats.pending > 0 && (
                    <Badge count={stats.pending} size="small"
                      style={{ marginLeft: 6, background: '#f59e0b' }} />
                  )}
                </span>
              ),
              children: (
                <div>
                  {leaves.filter((l) => l.status === 'PENDING').length === 0 ? (
                    <Result
                      icon={<CheckCircleOutlined style={{ color: '#22c55e', fontSize: 64 }} />}
                      title="All Caught Up!"
                      subTitle="No pending leave approvals at the moment."
                    />
                  ) : (
                    <Row gutter={[16, 16]}>
                      {leaves
                        .filter((l) => l.status === 'PENDING')
                        .map((leave) => {
                          const typeCfg = LEAVE_TYPE_CONFIG[leave.leaveType] ||
                            { color: '#6b7280', bg: '#f9fafb', icon: '📋' };
                          return (
                            <Col xs={24} md={12} lg={8} key={leave.id}>
                              <Card style={{
                                borderRadius: 16,
                                border: '1px solid #fde68a',
                                boxShadow: '0 1px 6px rgba(245,158,11,0.1)',
                                overflow: 'hidden',
                              }} bodyStyle={{ padding: 0 }}>
                                {/* Card Header */}
                                <div style={{
                                  background: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
                                  padding: '16px 20px',
                                  borderBottom: '1px solid #fde68a',
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                      <Avatar size={42}
                                        style={{ background: getAvatarColor(leave.employeeName),
                                                 fontWeight: 700, fontSize: 16 }}>
                                        {getInitials(leave.employeeName)}
                                      </Avatar>
                                      <div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>
                                          {leave.employeeName}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#9ca3af' }}>
                                          Applied {formatDate(leave.appliedOn)}
                                        </div>
                                      </div>
                                    </div>
                                    <Badge status="warning"
                                      text={<span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 11 }}>Pending</span>}
                                    />
                                  </div>
                                </div>

                                {/* Card Body */}
                                <div style={{ padding: '16px 20px' }}>
                                  {/* Leave Type */}
                                  <div style={{ marginBottom: 14 }}>
                                    <LeaveTypeBadge type={leave.leaveType} />
                                  </div>

                                  {/* Duration */}
                                  <div style={{
                                    display: 'flex', alignItems: 'center',
                                    gap: 8, marginBottom: 12,
                                    padding: '10px 12px',
                                    background: '#f8fafc',
                                    borderRadius: 10,
                                    border: '1px solid #f1f5f9',
                                  }}>
                                    <CalendarOutlined style={{ color: '#6366f1' }} />
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                                        {formatDate(leave.startDate)}
                                        {leave.startDate !== leave.endDate && ` → ${formatDate(leave.endDate)}`}
                                      </div>
                                      <div style={{ fontSize: 11, color: '#9ca3af' }}>
                                        {leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}
                                      </div>
                                    </div>
                                    <div style={{
                                      width: 36, height: 36, borderRadius: 10,
                                      background: '#eef2ff', display: 'flex',
                                      alignItems: 'center', justifyContent: 'center',
                                      fontWeight: 800, color: '#6366f1', fontSize: 14,
                                    }}>
                                      {leave.totalDays}d
                                    </div>
                                  </div>

                                  {/* Reason */}
                                  <Text style={{ color: '#6b7280', fontSize: 13, display: 'block', marginBottom: 16 }}>
                                    💬 {leave.reason.length > 60
                                      ? `${leave.reason.slice(0, 60)}…`
                                      : leave.reason}
                                  </Text>

                                  {/* Action Buttons */}
                                  <div style={{ display: 'flex', gap: 8 }}>
                                    <Button block icon={<CheckOutlined />}
                                      onClick={() => { setActionLeave(leave); setApproveOpen(true); }}
                                      style={{
                                        borderRadius: 10, height: 40, fontWeight: 600,
                                        background: '#f0fdf4', color: '#22c55e',
                                        borderColor: '#22c55e',
                                      }}>
                                      Approve
                                    </Button>
                                    <Button block icon={<CloseCircleOutlined />}
                                      onClick={() => { setActionLeave(leave); setRejectOpen(true); }}
                                      style={{
                                        borderRadius: 10, height: 40, fontWeight: 600,
                                        background: '#fef2f2', color: '#ef4444',
                                        borderColor: '#ef4444',
                                      }}>
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            </Col>
                          );
                        })}
                    </Row>
                  )}
                </div>
              ),
            }] : []),

            // ── ANALYTICS TAB ──────────────────────
            {
              key:   'analytics',
              label: <span><BarChartOutlined /> Analytics</span>,
              children: (
                <Row gutter={[20, 20]}>
                  {/* Leave Type Distribution */}
                  <Col xs={24} lg={12}>
                    <Card title={<span style={{ fontWeight: 700 }}>Leave Type Distribution</span>}
                      style={innerCardStyle}>
                      {Object.entries(
                        mockLeaves.reduce((acc, l) => {
                          acc[l.leaveType] = (acc[l.leaveType] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([type, count]) => {
                        const cfg = LEAVE_TYPE_CONFIG[type] || { color: '#6b7280', bg: '#f9fafb', icon: '📋' };
                        const pct = Math.round((count / mockLeaves.length) * 100);
                        return (
                          <div key={type} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>{cfg.icon}</span>
                                <Text style={{ fontWeight: 500, fontSize: 13 }}>
                                  {type.charAt(0) + type.slice(1).toLowerCase()} Leave
                                </Text>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Text style={{ fontWeight: 700, color: cfg.color }}>{count}</Text>
                                <Text style={{ color: '#9ca3af', fontSize: 12 }}>({pct}%)</Text>
                              </div>
                            </div>
                            <Progress
                              percent={pct} strokeColor={cfg.color}
                              trailColor="#f1f5f9" showInfo={false}
                              style={{ margin: 0 }}
                            />
                          </div>
                        );
                      })}
                    </Card>
                  </Col>

                  {/* Status Summary */}
                  <Col xs={24} lg={12}>
                    <Card title={<span style={{ fontWeight: 700 }}>Status Summary</span>}
                      style={innerCardStyle}>
                      {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                        const count = mockLeaves.filter((l) => l.status === status).length;
                        const pct   = Math.round((count / mockLeaves.length) * 100) || 0;
                        return (
                          <div key={status} style={{ marginBottom: 18 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: cfg.color }}>{cfg.icon}</span>
                                <Text style={{ fontWeight: 600, fontSize: 13 }}>{cfg.label}</Text>
                              </div>
                              <div>
                                <Text style={{ fontWeight: 800, color: cfg.color, fontSize: 18 }}>{count}</Text>
                                <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 4 }}>({pct}%)</Text>
                              </div>
                            </div>
                            <Progress
                              percent={pct} strokeColor={cfg.color}
                              trailColor="#f1f5f9" showInfo={false}
                              style={{ margin: 0 }}
                            />
                          </div>
                        );
                      })}
                    </Card>
                  </Col>

                  {/* Monthly Summary */}
                  <Col xs={24}>
                    <Card title={<span style={{ fontWeight: 700 }}>Top Leave Takers — {dayjs().year()}</span>}
                      style={innerCardStyle}>
                      <Row gutter={[16, 16]}>
                        {mockLeaves
                          .reduce((acc, l) => {
                            const e = acc.find((x) => x.id === l.employeeId);
                            if (e) e.days += l.totalDays;
                            else acc.push({ id: l.employeeId, name: l.employeeName, days: l.totalDays });
                            return acc;
                          }, [] as { id:number; name:string; days:number }[])
                          .sort((a, b) => b.days - a.days)
                          .slice(0, 6)
                          .map((e, i) => (
                            <Col xs={24} sm={12} md={8} key={e.id}>
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 14px', background: '#fafbfc',
                                borderRadius: 12, border: '1px solid #f1f5f9',
                              }}>
                                <div style={{
                                  width: 28, height: 28, borderRadius: '50%',
                                  background: i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : i === 2 ? '#f97316' : '#e5e7eb',
                                  display: 'flex', alignItems: 'center',
                                  justifyContent: 'center', fontWeight: 800,
                                  fontSize: 12, color: i < 3 ? '#fff' : '#6b7280',
                                  flexShrink: 0,
                                }}>
                                  #{i + 1}
                                </div>
                                <Avatar size={36}
                                  style={{ background: getAvatarColor(e.name), fontWeight: 700, fontSize: 13 }}>
                                  {getInitials(e.name)}
                                </Avatar>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 13 }}>{e.name}</div>
                                  <div style={{ color: '#6366f1', fontWeight: 700, fontSize: 13 }}>
                                    {e.days} days taken
                                  </div>
                                </div>
                              </div>
                            </Col>
                          ))}
                      </Row>
                    </Card>
                  </Col>
                </Row>
              ),
            },
          ]}
        />
      </Card>

      {/* ══════════════════════════════════════════════
          APPLY LEAVE MODAL
      ══════════════════════════════════════════════ */}
      <Modal
        open={applyOpen}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CalendarOutlined style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Apply for Leave</div>
              <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 400 }}>
                Submit a new leave request
              </div>
            </div>
          </div>
        }
        onCancel={() => { setApplyOpen(false); reset(); }}
        footer={null}
        width={600}
        centered
        destroyOnClose
      >
        <Divider style={{ margin: '12px 0 20px' }} />

        {/* Leave Type Quick Select */}
        <div style={{ marginBottom: 20 }}>
          <Text style={{ ...labelStyle, display: 'block', marginBottom: 8 }}>
            Select Leave Type
          </Text>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(LEAVE_TYPE_CONFIG).slice(0, 4).map(([type, cfg]) => (
              <div
                key={type}
                onClick={() => setValue('leaveType', type as LeaveType)}
                style={{
                  padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                  border: `2px solid ${watchType === type ? cfg.color : '#e5e7eb'}`,
                  background: watchType === type ? cfg.bg : '#fff',
                  transition: 'all 0.2s', fontSize: 13,
                  color: watchType === type ? cfg.color : '#6b7280',
                  fontWeight: watchType === type ? 700 : 400,
                }}
              >
                {cfg.icon} {type.charAt(0) + type.slice(1).toLowerCase()}
              </div>
            ))}
          </div>
        </div>

        <Form layout="vertical" onFinish={handleSubmit(onApplySubmit)} size="large">
          <Row gutter={[16, 0]}>
            {/* Employee (HR can select; employee is fixed) */}
            {isHR && (
              <Col xs={24}>
                <Form.Item label={<span style={labelStyle}>Employee <span style={reqStyle}>*</span></span>}>
                  <Controller name="employeeId" control={control} render={({ field }) => (
                    <Select {...field} placeholder="Select employee"
                      showSearch optionFilterProp="children"
                      style={{ width: '100%' }}>
                      {employees.map((e) => (
                        <Option key={e.id} value={e.id}>
                          <Avatar size={20}
                            style={{ background: getAvatarColor(e.fullName), fontSize: 9, fontWeight: 700, marginRight: 6 }}>
                            {getInitials(e.fullName)}
                          </Avatar>
                          {e.fullName}
                        </Option>
                      ))}
                    </Select>
                  )} />
                  
                </Form.Item>
              </Col>
            )}

            {/* Leave Type (hidden select, driven by quick select above) */}
            <Col xs={24}>
              <Form.Item
                label={<span style={labelStyle}>Leave Type <span style={reqStyle}>*</span></span>}
                validateStatus={errors.leaveType ? 'error' : ''}
                help={errors.leaveType?.message}
              >
                <Controller name="leaveType" control={control} render={({ field }) => (
                  <Select {...field} style={{ width: '100%' }}>
                    {LEAVE_TYPE_OPTIONS.map((o) => (
                      <Option key={o.value} value={o.value}>
                        <span>
                          {LEAVE_TYPE_CONFIG[o.value]?.icon} {o.label}
                        </span>
                      </Option>
                    ))}
                  </Select>
                )} />
              </Form.Item>
            </Col>

            {/* Date Range */}
            <Col xs={24} md={12}>
              <Form.Item
                label={<span style={labelStyle}>Start Date <span style={reqStyle}>*</span></span>}
                validateStatus={errors.startDate ? 'error' : ''}
                help={errors.startDate?.message}
              >
                <Controller name="startDate" control={control} render={({ field }) => (
                  <DatePicker
                    style={{ width: '100%', borderRadius: 10, height: 44 }}
                    format={DISPLAY_DATE_FORMAT}
                    onChange={(date) => field.onChange(date ? date.format(DATE_FORMAT) : null)}  
                  value={field.value ? dayjs(field.value, DATE_FORMAT) : null}              
                  />
                )} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span style={labelStyle}>End Date <span style={reqStyle}>*</span></span>}
                validateStatus={errors.endDate ? 'error' : ''}
                help={errors.endDate?.message}
              >
                <Controller name="endDate" control={control} render={({ field }) => (
                  <DatePicker
                    style={{ width: '100%', borderRadius: 10, height: 44 }}
                    format={DISPLAY_DATE_FORMAT}
                    onChange={(date) => field.onChange(date ? date.format(DATE_FORMAT) : null)}  
                  value={field.value ? dayjs(field.value, DATE_FORMAT) : null}
                    disabledDate={(d) =>
                      d.isBefore(dayjs(), 'day') ||
                      (!!watchStart && d.isBefore(dayjs(watchStart), 'day'))
                    }
                  />
                )} />
              </Form.Item>
            </Col>

            {/* Days Preview */}
            {leaveDays > 0 && (
              <Col xs={24}>
                <Alert
                  message={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <InfoCircleOutlined style={{ color: '#6366f1' }} />
                      <span>
                        You are applying for <strong style={{ color: '#6366f1' }}>
                          {leaveDays} day{leaveDays !== 1 ? 's' : ''}
                        </strong> of {watchType?.toLowerCase()} leave
                      </span>
                    </div>
                  }
                  type="info"
                  style={{ borderRadius: 10, marginBottom: 4, border: '1px solid #c7d2fe' }}
                  showIcon={false}
                />
              </Col>
            )}

            {/* Reason */}
            <Col xs={24} style={{ marginTop: 8 }}>
              <Form.Item
                label={<span style={labelStyle}>Reason <span style={reqStyle}>*</span></span>}
                validateStatus={errors.reason ? 'error' : ''}
                help={errors.reason?.message}
              >
                <Controller name="reason" control={control} render={({ field }) => (
                  <TextArea {...field}
                    placeholder="Please provide a detailed reason for your leave request (min 10 characters)..."
                    rows={4} maxLength={500} showCount
                    style={{ borderRadius: 10 }}
                  />
                )} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 16px' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => { setApplyOpen(false); reset(); }}
              style={{ borderRadius: 10, height: 42, paddingInline: 20 }}>
              Cancel
            </Button>
            <Button
              type="primary" htmlType="submit" loading={submitLoading}
              icon={<SendOutlined />}
              style={{
                borderRadius: 10, height: 42, paddingInline: 28,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border: 'none', fontWeight: 600,
              }}
            >
              {submitLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ══════════════════════════════════════════════
          VIEW LEAVE DRAWER
      ══════════════════════════════════════════════ */}
      <Drawer
        open={viewOpen}
        onClose={() => { setViewOpen(false); setViewLeave(null); }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalendarOutlined style={{ color: '#6366f1' }} />
            <span style={{ fontWeight: 700 }}>Leave Details</span>
          </div>
        }
        width={400}
        extra={
          isHR && viewLeave?.status === 'PENDING' && (
            <Space>
              <Button size="small" icon={<CheckOutlined />}
                onClick={() => { setViewOpen(false); setActionLeave(viewLeave); setApproveOpen(true); }}
                style={{ borderRadius: 8, background: '#f0fdf4', color: '#22c55e', borderColor: '#22c55e' }}>
                Approve
              </Button>
              <Button size="small" icon={<CloseCircleOutlined />}
                onClick={() => { setViewOpen(false); setActionLeave(viewLeave); setRejectOpen(true); }}
                style={{ borderRadius: 8, background: '#fef2f2', color: '#ef4444', borderColor: '#ef4444' }}>
                Reject
              </Button>
            </Space>
          )
        }
      >
        {viewLeave && (() => {
          const typeCfg   = LEAVE_TYPE_CONFIG[viewLeave.leaveType] || { color:'#6b7280', bg:'#f9fafb', icon:'📋' };
          const statusCfg = STATUS_CONFIG[viewLeave.status];
          return (
            <div>
              {/* Employee Header */}
              <div style={{
                textAlign: 'center', padding: '20px 0 24px',
                borderBottom: '1px solid #f1f5f9', marginBottom: 20,
              }}>
                <Avatar size={72}
                  style={{ background: getAvatarColor(viewLeave.employeeName),
                           fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
                  {getInitials(viewLeave.employeeName)}
                </Avatar>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{viewLeave.employeeName}</div>
                <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
                  Applied on {formatDate(viewLeave.appliedOn)}
                </div>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 8 }}>
                  <LeaveTypeBadge type={viewLeave.leaveType} />
                  <StatusBadge status={viewLeave.status} />
                </div>
              </div>

              {/* Duration Card */}
              <div style={{
                background: typeCfg.bg, borderRadius: 14,
                padding: '16px', border: `1px solid ${typeCfg.color}33`,
                marginBottom: 16, textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>{typeCfg.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: typeCfg.color }}>
                  {viewLeave.totalDays} {viewLeave.totalDays === 1 ? 'Day' : 'Days'}
                </div>
                <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
                  {formatDate(viewLeave.startDate)}
                  {viewLeave.startDate !== viewLeave.endDate && ` — ${formatDate(viewLeave.endDate)}`}
                </div>
              </div>

              {/* Reason */}
              <div style={{
                background: '#f8fafc', borderRadius: 12,
                padding: '14px 16px', marginBottom: 16,
                border: '1px solid #f1f5f9',
              }}>
                <Text style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>
                  📝 Reason
                </Text>
                <Text style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6 }}>
                  {viewLeave.reason}
                </Text>
              </div>

              {/* Approval Info */}
              {(viewLeave.approvedByName || viewLeave.approvalNote) && (
                <div style={{
                  background: viewLeave.status === 'APPROVED' ? '#f0fdf4' : '#fef2f2',
                  borderRadius: 12, padding: '14px 16px', marginBottom: 16,
                  border: `1px solid ${viewLeave.status === 'APPROVED' ? '#bbf7d0' : '#fecaca'}`,
                }}>
                  <Text style={{
                    fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6,
                    color: viewLeave.status === 'APPROVED' ? '#166534' : '#991b1b',
                  }}>
                    {viewLeave.status === 'APPROVED' ? '✅ Approved' : '❌ Rejected'} by {viewLeave.approvedByName}
                  </Text>
                  {viewLeave.approvalNote && (
                    <Text style={{
                      fontSize: 13, lineHeight: 1.6,
                      color: viewLeave.status === 'APPROVED' ? '#166534' : '#991b1b',
                    }}>
                      "{viewLeave.approvalNote}"
                    </Text>
                  )}
                </div>
              )}

              {/* Timeline */}
              <Timeline style={{ marginTop: 16 }}>
                <Timeline.Item color="blue">
                  <Text style={{ fontWeight: 600, fontSize: 13 }}>Applied</Text>
                  <br />
                  <Text style={{ color: '#9ca3af', fontSize: 12 }}>{formatDate(viewLeave.appliedOn)}</Text>
                </Timeline.Item>
                {viewLeave.status !== 'PENDING' && (
                  <Timeline.Item
                    color={viewLeave.status === 'APPROVED' ? 'green'
                           : viewLeave.status === 'CANCELLED' ? 'gray' : 'red'}
                  >
                    <Text style={{ fontWeight: 600, fontSize: 13 }}>{STATUS_CONFIG[viewLeave.status].label}</Text>
                    <br />
                    <Text style={{ color: '#9ca3af', fontSize: 12 }}>{formatDate(viewLeave.updatedAt)}</Text>
                  </Timeline.Item>
                )}
                {viewLeave.status === 'APPROVED' && (
                  <Timeline.Item color="green">
                    <Text style={{ fontWeight: 600, fontSize: 13 }}>Leave Period</Text>
                    <br />
                    <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                      {formatDate(viewLeave.startDate)} — {formatDate(viewLeave.endDate)}
                    </Text>
                  </Timeline.Item>
                )}
              </Timeline>

              {/* Cancel button for pending leaves */}
              {viewLeave.status === 'PENDING' && (
                <Button block danger icon={<StopOutlined />}
                  onClick={() => {
                    setViewOpen(false);
                    setActionLeave(viewLeave);
                    setCancelOpen(true);
                  }}
                  style={{ borderRadius: 10, height: 42, marginTop: 8 }}>
                  Cancel This Request
                </Button>
              )}
            </div>
          );
        })()}
      </Drawer>

      {/* ── Approve Modal ── */}
      <Modal
        open={approveOpen}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 20 }} />
            <span style={{ fontWeight: 700 }}>Approve Leave Request</span>
          </div>
        }
        onOk={handleApprove}
        onCancel={() => { setApproveOpen(false); setApproveNote(''); }}
        okText="Approve"
        okButtonProps={{
          loading: actionLoading,
          style: { borderRadius: 8, background: '#22c55e', border: 'none', fontWeight: 600 },
        }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        centered width={440}
      >
        {actionLeave && (
          <div>
            <Alert
              message={
                <span>
                  Approving <strong>{actionLeave.totalDays}-day</strong> {actionLeave.leaveType.toLowerCase()} leave
                  for <strong>{actionLeave.employeeName}</strong>
                </span>
              }
              type="success"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
            <Form layout="vertical">
              <Form.Item label="Approval Note (optional)">
                <TextArea
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                  placeholder="Add a note e.g. 'Approved. Enjoy your leave!'"
                  rows={3} maxLength={200}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* ── Reject Modal ── */}
      <Modal
        open={rejectOpen}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CloseCircleOutlined style={{ color: '#ef4444', fontSize: 20 }} />
            <span style={{ fontWeight: 700 }}>Reject Leave Request</span>
          </div>
        }
        onOk={handleReject}
        onCancel={() => { setRejectOpen(false); setRejectNote(''); }}
        okText="Reject"
        okButtonProps={{
          loading: actionLoading, danger: true,
          style: { borderRadius: 8, fontWeight: 600 },
        }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        centered width={440}
      >
        {actionLeave && (
          <div>
            <Alert
              message={
                <span>
                  Rejecting leave request from <strong>{actionLeave.employeeName}</strong>
                </span>
              }
              type="error"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
            <Form layout="vertical">
              <Form.Item
                label={<span>Rejection Reason <span style={{ color: '#ef4444' }}>*</span></span>}
                required
              >
                <TextArea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={3} maxLength={300}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* ── Cancel Confirm ── */}
      <ConfirmDialog
        open={cancelOpen}
        title="Cancel Leave Request"
        message={`Are you sure you want to cancel this ${actionLeave?.leaveType?.toLowerCase()} leave request?`}
        type="warning"
        confirmText="Yes, Cancel"
        cancelText="No"
        loading={actionLoading}
        onConfirm={handleCancel}
        onCancel={() => { setCancelOpen(false); setActionLeave(null); }}
      />
    </div>
  );
};

// ─── Shared Styles ─────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontWeight: 500, fontSize: 13, color: '#374151',
};
const reqStyle: React.CSSProperties = { color: '#ef4444' };
const innerCardStyle: React.CSSProperties = {
  borderRadius: 14, border: '1px solid #f1f5f9', boxShadow: 'none',
};

export default LeaveList;