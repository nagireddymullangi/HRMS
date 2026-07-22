import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card, Table, Button, Input, Select, DatePicker,
  Tag, Typography, Row, Col, Avatar, Tooltip,
  Badge, Statistic, Progress, Space, Modal, Form,
  TimePicker, message, Tabs, Calendar, Alert,
  Drawer, Divider, Empty, Switch, MenuProps, Dropdown,
} from 'antd';
import {
  ClockCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, SearchOutlined, ReloadOutlined,
  ExportOutlined, PlusOutlined, EditOutlined,
  UserOutlined, CalendarOutlined, BarChartOutlined,
  TeamOutlined, FireOutlined, ThunderboltOutlined,
  ArrowUpOutlined, ArrowDownOutlined, EyeOutlined,
  MoreOutlined, FilterOutlined, DownloadOutlined,
  LoginOutlined, LogoutOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate }           from 'react-router-dom';
import { useForm, Controller }   from 'react-hook-form';
import dayjs, { Dayjs }          from 'dayjs';
import { attendanceApi }         from '../../api/attendanceApi';
import { employeeApi }           from '../../api/employeeApi';
import {
  Attendance, AttendanceRequest,
  AttendanceStatus, AttendanceSummary,
}                                from '../../types/attendance.types';
import {
  formatDate, formatDateTime,
  getInitials, getAvatarColor,
}                                from '../../utils/helpers';
import {
  ROUTES, PAGE_SIZE,
  ATTENDANCE_STATUS_COLORS,
}                                from '../../constants';
import PageHeader                from '../../components/common/PageHeader';
import ConfirmDialog             from '../../components/common/ConfirmDialog';
import LoadingSpinner            from '../../components/common/LoadingSpinner';
import { useDebounce }           from '../../hooks/useDebounce';
import { useAuth }               from '../../hooks/useAuth';
import { UnorderedListOutlined } from '@ant-design/icons';
import { Module } from 'module';
const MONTHS = [
  'January','February','March',   'April',
  'May',     'June',    'July',    'August',
  'September','October','November','December',
];

const { Text, Title }     = Typography;
const { TabPane }         = Tabs;
const { Option }          = Select;
const { RangePicker }     = DatePicker;


// ─── Mock Weekly Data ──────────────────────────────────
const weeklyData = [
  { day: 'Mon', present: 210, absent: 20, late: 10, date: '2024-03-18' },
  { day: 'Tue', present: 205, absent: 25, late: 8,  date: '2024-03-19' },
  { day: 'Wed', present: 215, absent: 18, late: 7,  date: '2024-03-20' },
  { day: 'Thu', present: 198, absent: 32, late: 14, date: '2024-03-21' },
  { day: 'Fri', present: 201, absent: 29, late: 12, date: '2024-03-22' },
];

// ─── Status Config ─────────────────────────────────────
const STATUS_CONFIG: Record<AttendanceStatus, {
  color: string; bg: string; label: string; icon: React.ReactNode;
}> = {
  PRESENT:  { color: '#22c55e', bg: '#f0fdf4', label: 'Present',  icon: <CheckCircleOutlined /> },
  ABSENT:   { color: '#ef4444', bg: '#fef2f2', label: 'Absent',   icon: <CloseCircleOutlined /> },
  LATE:     { color: '#f59e0b', bg: '#fffbeb', label: 'Late',     icon: <WarningOutlined />     },
  HALF_DAY: { color: '#8b5cf6', bg: '#faf5ff', label: 'Half Day', icon: <ClockCircleOutlined /> },
  ON_LEAVE: { color: '#6366f1', bg: '#eef2ff', label: 'On Leave', icon: <CalendarOutlined />    },
  HOLIDAY:  { color: '#ec4899', bg: '#fdf2f8', label: 'Holiday',  icon: <FireOutlined />         },
  WEEKEND:  { color: '#6b7280', bg: '#f9fafb', label: 'Weekend',  icon: <ClockCircleOutlined /> },
};

// ─── Stat Mini Card ────────────────────────────────────
const MiniStatCard: React.FC<{
  label: string; value: number; color: string;
  bg: string; icon: React.ReactNode; percent?: number;
}> = ({ label, value, color, bg, icon, percent }) => (
  <div style={{
    background: bg, borderRadius: 14, padding: '16px 14px',
    textAlign: 'center', border: `1px solid ${color}22`,
    flex: 1, minWidth: 100,
  }}>
    <div style={{ color, fontSize: 22, marginBottom: 6 }}>{icon}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{label}</div>
    {percent !== undefined && (
      <Progress
        percent={percent} size="small" showInfo={false}
        strokeColor={color} trailColor={`${color}22`}
        style={{ margin: '6px 0 0' }}
      />
    )}
  </div>
);

// ─── Weekly Bar Chart (Custom SVG) ─────────────────────
const WeeklyBarChart: React.FC = () => {
  const maxVal = Math.max(...weeklyData.map((d) => d.present));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120, padding: '0 8px' }}>
      {weeklyData.map((d) => {
        const h = Math.round((d.present / maxVal) * 100);
        const isToday = d.day === 'Fri';
        return (
          <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{d.present}</Text>
            <Tooltip title={`${d.day}: ${d.present} present, ${d.absent} absent, ${d.late} late`}>
              <div style={{
                width: '100%', height: `${h}%`, borderRadius: '6px 6px 0 0',
                background: isToday
                  ? 'linear-gradient(180deg,#6366f1,#8b5cf6)'
                  : 'linear-gradient(180deg,#a5b4fc,#c7d2fe)',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: isToday ? '0 4px 12px rgba(99,102,241,0.35)' : 'none',
                minHeight: 8,
              }} />
            </Tooltip>
            <Text style={{
              fontSize: 12, fontWeight: isToday ? 700 : 500,
              color: isToday ? '#6366f1' : '#9ca3af',
            }}>
              {d.day}
            </Text>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
const AttendanceList: React.FC = () => {
  const { user, isAdmin, isHR } = useAuth();
  const navigate                = useNavigate();

  // ── State ──────────────────────────────────────────
  const [attendances,    setAttendances]    = useState<Attendance[]>([]);
  const [employees,      setEmployees]      = useState<{ id: number; fullName: string; departmentName: string }[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [submitLoading,  setSubmitLoading]  = useState(false);
  const [totalElements,  setTotalElements]  = useState(0);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [activeTab,      setActiveTab]      = useState('list');
  const [searchText,     setSearchText]     = useState('');
  const [filterStatus,   setFilterStatus]   = useState<AttendanceStatus | ''>('');
  const [filterMonth,    setFilterMonth]    = useState<number>(dayjs().month() + 1);
  const [filterYear,     setFilterYear]     = useState<number>(dayjs().year());
  const [filterEmpId,    setFilterEmpId]    = useState<number | null>(null);
  const [dateRange,      setDateRange]      = useState<[Dayjs | null, Dayjs | null] | null>(null);

  // Modals
  const [modalOpen,      setModalOpen]      = useState(false);
  const [editRecord,     setEditRecord]     = useState<Attendance | null>(null);
  const [viewRecord,     setViewRecord]     = useState<Attendance | null>(null);
  const [viewOpen,       setViewOpen]       = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading,setCheckOutLoading]= useState(false);
  const [todayRecord,    setTodayRecord]    = useState<Attendance | null>(null);
  const [selectedDate,    setSelectedDate]    = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debouncedSearch = useDebounce(searchText, 400);

  // ── Form ───────────────────────────────────────────
  const { control, handleSubmit, reset, watch,
    formState: { errors } } = useForm<AttendanceRequest>({
    defaultValues: {
      employeeId: 0,
      date:       dayjs().format('YYYY-MM-DD'),
      status:     'PRESENT',
      checkIn:    '',
      checkOut:   '',
      notes:      '',
    },
  });

  const watchStatus = watch('status');


  // ─── Mock Today Summary ────────────────────────────────
const todaySummary = useMemo(() => {
  const totalCount = attendances.length;
  const presentCount = attendances.filter((record) => record.status === 'PRESENT').length;
  return {
    total:   totalCount,
    present: presentCount,
    absent:  attendances.filter((record) => record.status === 'ABSENT').length,
    late:    attendances.filter((record) => record.status === 'LATE').length,
    onLeave: attendances.filter((record) => record.status === 'ON_LEAVE').length,
  halfDay: attendances.filter((record) => record.status === 'HALF_DAY').length,
  percent: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
};
}, [attendances]);

  // ── Fetch ──────────────────────────────────────────
  useEffect(() => {
    fetchAttendances();
  }, [currentPage, debouncedSearch, filterStatus, filterMonth, filterYear, filterEmpId]);

  useEffect(() => {
    fetchEmployees();
    if (user?.id) fetchTodayRecord();
  }, []);

  const fetchAttendances = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page:   currentPage - 1,
        size:   PAGE_SIZE,
        month:  filterMonth,
        year:   filterYear,
      };
      if (filterStatus) params.status     = filterStatus;
      if (filterEmpId)  params.employeeId = filterEmpId;
      if (debouncedSearch) params.search  = debouncedSearch;
      const res = await attendanceApi.getAll(params);
      setAttendances(res.data?.content      || []);
      setTotalElements(res.data?.totalElements || 0);
    } catch {
      message.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterStatus, filterMonth, filterYear, filterEmpId]);

  const fetchEmployees = async () => {
    try {
      const res = await employeeApi.getAll({ page: 0, size: 300 });
      const list = (res.data?.content || []).map((e: any) => ({
        id:             e.id,
        fullName:       e.fullName || `${e.firstName} ${e.lastName}`,
        departmentName: e.departmentName,
      }));
      setEmployees(list);
    } catch { /* silent */ }
  };

  const fetchTodayRecord = async () => {
    try {
      if (!user?.id) return;
      const res = await attendanceApi.getTodayStatus(user.id);
      setTodayRecord(res.data || null);
    } catch { /* silent */ }
  };

  // ── Check In / Out ─────────────────────────────────
  const handleCheckIn = async () => {
    if (!user?.id) return;
    setCheckInLoading(true);
    try {
      const res = await attendanceApi.checkIn(user.id);
      setTodayRecord(res.data || null);
      message.success(`✅ Checked in at ${dayjs().format('hh:mm A')}`);
      fetchAttendances();
    } catch {
      message.error('Check-in failed. Please try again.');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user?.id) return;
    setCheckOutLoading(true);
    try {
      const res = await attendanceApi.checkOut(user.id);
      setTodayRecord(res.data || null);
      message.success(`✅ Checked out at ${dayjs().format('hh:mm A')}`);
      fetchAttendances();
    } catch {
      message.error('Check-out failed. Please try again.');
    } finally {
      setCheckOutLoading(false);
    }
  };

  // ── Modal Open ─────────────────────────────────────
  const openAddModal = () => {
    setEditRecord(null);
    reset({
      employeeId: 0,
      date:       dayjs().format('YYYY-MM-DD'),
      status:     'PRESENT',
      checkIn:    '',
      checkOut:   '',
      notes:      '',
    });
    setModalOpen(true);
  };

  const openEditModal = (record: Attendance) => {
    setEditRecord(record);
    reset({
      employeeId: record.employeeId,
      date:       record.date,
      status:     record.status,
      checkIn:    record.checkIn || '',
      checkOut:   record.checkOut || '',
      notes:      record.notes || '',
    });
    setModalOpen(true);
  };

  // ── Submit ─────────────────────────────────────────
  const onSubmit = async (data: AttendanceRequest) => {
    setSubmitLoading(true);
    try {
      if (editRecord) {
        await attendanceApi.update(editRecord.id, data);
        message.success('Attendance updated successfully');
      } else {
        await attendanceApi.create(data);
        message.success('Attendance marked successfully');
      }
      setModalOpen(false);
      fetchAttendances();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Calendar Cell Render ───────────────────────────
  const calendarCellRender = (date: Dayjs) => {
    const dateStr  = date.format('YYYY-MM-DD');
    const dayRecs  = attendances.filter((a) => a.date === dateStr);
    if (!dayRecs.length) return null;
    const rec      = dayRecs[0];
    const cfg      = STATUS_CONFIG[rec.status];
    return (
      <div style={{
        background: cfg.bg, borderRadius: 6, padding: '2px 6px',
        fontSize: 11, color: cfg.color, fontWeight: 600,
        display: 'inline-block',
      }}>
        {cfg.label}
      </div>
    );
  };

  // ── Table Columns ──────────────────────────────────
  const columns = [
    {
      title:     'Employee',
      key:       'employee',
      render: (_: any, record: Attendance) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size={38}
            style={{
              background: getAvatarColor(record.employeeName),
              fontWeight: 700, fontSize: 14, flexShrink: 0,
            }}>
            {getInitials(record.employeeName)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>
              {record.employeeName}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              <CalendarOutlined style={{ marginRight: 3 }} />
              {formatDate(record.date)}
            </div>
          </div>
        </div>
      ),
      sorter: (a: Attendance, b: Attendance) =>
        a.employeeName.localeCompare(b.employeeName),
    },
    {
      title:     'Check In',
      dataIndex: 'checkIn',
      key:       'checkIn',
      render: (v?: string) => v ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#f0fdf4', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <LoginOutlined style={{ color: '#22c55e', fontSize: 14 }} />
          </div>
          <Text style={{ fontWeight: 600, color: '#22c55e', fontSize: 14 }}>{v}</Text>
        </div>
      ) : (
        <Text style={{ color: '#d1d5db' }}>—</Text>
      ),
    },
    {
      title:     'Check Out',
      dataIndex: 'checkOut',
      key:       'checkOut',
      render: (v?: string) => v ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#eef2ff', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <LogoutOutlined style={{ color: '#6366f1', fontSize: 14 }} />
          </div>
          <Text style={{ fontWeight: 600, color: '#6366f1', fontSize: 14 }}>{v}</Text>
        </div>
      ) : (
        <Text style={{ color: '#d1d5db' }}>—</Text>
      ),
    },
    {
      title:     'Work Hours',
      dataIndex: 'workHours',
      key:       'workHours',
      render: (h?: number) => {
        if (!h) return <Text style={{ color: '#d1d5db' }}>—</Text>;
        const pct   = Math.min(Math.round((h / 9) * 100), 100);
        const color = h >= 8 ? '#22c55e' : h >= 4 ? '#f59e0b' : '#ef4444';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontWeight: 700, color, minWidth: 36 }}>{h}h</Text>
            <Progress
              percent={pct} size="small" strokeColor={color}
              showInfo={false} style={{ width: 70, margin: 0 }}
              trailColor="#f1f5f9"
            />
          </div>
        );
      },
      sorter: (a: Attendance, b: Attendance) => (a.workHours || 0) - (b.workHours || 0),
    },
    {
      title:     'Overtime',
      dataIndex: 'overtime',
      key:       'overtime',
      render: (v?: number) => v && v > 0 ? (
        <Tag color="orange" style={{ borderRadius: 20, fontWeight: 600 }}>
          <ThunderboltOutlined /> +{v}h
        </Tag>
      ) : <Text style={{ color: '#d1d5db' }}>—</Text>,
    },
    {
      title:     'Status',
      dataIndex: 'status',
      key:       'status',
      render: (status: AttendanceStatus) => {
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
      },
      filters: Object.entries(STATUS_CONFIG).map(([k, v]) => ({
        text: v.label, value: k,
      })),
    },
    {
      title:  'Actions',
      key:    'actions',
      width:  120,
      render: (_: any, record: Attendance) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view', icon: <EyeOutlined />, label: 'View Details',
            onClick: () => { setViewRecord(record); setViewOpen(true); },
          },
          {
            key: 'edit', icon: <EditOutlined />, label: 'Edit Record',
            onClick: () => openEditModal(record),
          },
        ];
        return (
          <Space>
            <Tooltip title="View">
              <Button size="small" icon={<EyeOutlined />}
                onClick={() => { setViewRecord(record); setViewOpen(true); }}
                style={{ borderRadius: 8, color: '#6366f1', borderColor: '#6366f1' }} />
            </Tooltip>
            {isHR && (
              <Tooltip title="Edit">
                <Button size="small" icon={<EditOutlined />}
                  onClick={() => openEditModal(record)}
                  style={{ borderRadius: 8 }} />
              </Tooltip>
            )}
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button size="small" icon={<MoreOutlined />}
                style={{ borderRadius: 8 }} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];
const handleDateSelect = (date: any) => {
  setSelectedDate(date);
  setIsModalOpen(true);
}
  
  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Attendance Management"
        subtitle={`Tracking ${totalElements} records — ${dayjs().format('MMMM YYYY')}`}
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.DASHBOARD },
          { label: 'Attendance' },
        ]}
        actions={
          <Space>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={fetchAttendances}
                style={{ borderRadius: 10, height: 40 }} />
            </Tooltip>
            <Button icon={<ExportOutlined />}
              style={{ borderRadius: 10, height: 40 }}>
              Export
            </Button>
            {isHR && (
              <Button
                type="primary" icon={<PlusOutlined />}
                onClick={openAddModal}
                style={{
                  borderRadius: 10, height: 40,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: 'none', fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                }}
              >
                Mark Attendance
              </Button>
            )}
          </Space>
        }
      />

      {/* ── Check In/Out Card (for Employee) ── */}
      <Card style={{
        borderRadius: 16, border: 'none',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        marginBottom: 24,
        background: 'linear-gradient(135deg,#1e293b,#334155)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 80% 50%,rgba(99,102,241,0.15),transparent 60%)',
        }} />

        <Row gutter={[24, 16]} align="middle" style={{ position: 'relative' }}>
          {/* Left: Date & Time */}
          <Col xs={24} md={8}>
            <div>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                {dayjs().format('dddd')}
              </Text>
              <div style={{ color: '#fff', fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
                {dayjs().format('DD MMMM YYYY')}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 20, marginTop: 4, fontFamily: 'monospace' }}>
                {dayjs().format('hh:mm A')}
              </div>
            </div>
          </Col>

          {/* Center: Today Status */}
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              {todayRecord ? (
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: 12, padding: '8px 20px', marginBottom: 12,
                  }}>
                    <Badge status="processing" color="#22c55e" />
                    <Text style={{ color: '#22c55e', fontWeight: 700 }}>Today's Attendance</Text>
                  </div>
                  <Row gutter={[16, 0]}>
                    <Col span={12}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>CHECK IN</div>
                        <div style={{ color: '#22c55e', fontSize: 18, fontWeight: 800 }}>
                          {todayRecord.checkIn || '—'}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>CHECK OUT</div>
                        <div style={{ color: '#818cf8', fontSize: 18, fontWeight: 800 }}>
                          {todayRecord.checkOut || '—'}
                        </div>
                      </div>
                    </Col>
                  </Row>
                  {todayRecord.workHours && (
                    <div style={{ marginTop: 10 }}>
                      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                        Work Hours Today:
                        <span style={{ color: '#fff', fontWeight: 700, marginLeft: 6 }}>
                          {todayRecord.workHours}h
                        </span>
                      </Text>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 }}>
                    You haven't checked in yet
                  </div>
                  <Badge
                    status="warning"
                    text={<Text style={{ color: '#f59e0b', fontWeight: 600 }}>Not Checked In</Text>}
                  />
                </div>
              )}
            </div>
          </Col>

          {/* Right: Check In/Out Buttons */}
          <Col xs={24} md={8}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                type="primary"
                icon={<LoginOutlined />}
                loading={checkInLoading}
                disabled={!!todayRecord?.checkIn}
                onClick={handleCheckIn}
                style={{
                  height: 48, borderRadius: 12, fontWeight: 700,
                  background: todayRecord?.checkIn
                    ? 'rgba(255,255,255,0.1)'
                    : 'linear-gradient(135deg,#22c55e,#16a34a)',
                  border: todayRecord?.checkIn
                    ? '1px solid rgba(255,255,255,0.15)'
                    : 'none',
                  paddingInline: 24, fontSize: 15,
                  boxShadow: todayRecord?.checkIn
                    ? 'none'
                    : '0 4px 12px rgba(34,197,94,0.4)',
                }}
              >
                Check In
              </Button>
              <Button
                icon={<LogoutOutlined />}
                loading={checkOutLoading}
                disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}
                onClick={handleCheckOut}
                style={{
                  height: 48, borderRadius: 12, fontWeight: 700,
                  background: todayRecord?.checkIn && !todayRecord?.checkOut
                    ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                    : 'rgba(255,255,255,0.1)',
                  border: todayRecord?.checkIn && !todayRecord?.checkOut
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', paddingInline: 24, fontSize: 15,
                  boxShadow: todayRecord?.checkIn && !todayRecord?.checkOut
                    ? '0 4px 12px rgba(99,102,241,0.4)'
                    : 'none',
                }}
              >
                Check Out
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ── Today's Summary ── */}
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
            <Title level={5} style={{ margin: 0 }}>Today's Overview</Title>
            <Text style={{ color: '#6b7280', fontSize: 13 }}>
              {dayjs().format('dddd, DD MMMM YYYY')}
            </Text>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#f8fafc', borderRadius: 12,
            padding: '8px 16px', border: '1px solid #f1f5f9',
          }}>
            <div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Attendance Rate</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>
                {todaySummary.percent}%
              </div>
            </div>
            <Progress
              type="circle"
              percent={todaySummary.percent}
              width={56}
              strokeColor={{ '0%': '#22c55e', '100%': '#16a34a' }}
              format={(p) => (
                <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>{p}%</span>
              )}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <MiniStatCard
            label="Total"     value={todaySummary.total}
            color="#6366f1"   bg="#eef2ff"
            icon={<TeamOutlined />}
          />
          <MiniStatCard
            label="Present"   value={todaySummary.present}
            color="#22c55e"   bg="#f0fdf4"
            icon={<CheckCircleOutlined />}
            percent={Math.round((todaySummary.present / todaySummary.total) * 100)}
          />
          <MiniStatCard
            label="Absent"    value={todaySummary.absent}
            color="#ef4444"   bg="#fef2f2"
            icon={<CloseCircleOutlined />}
            percent={Math.round((todaySummary.absent / todaySummary.total) * 100)}
          />
          <MiniStatCard
            label="Late"      value={todaySummary.late}
            color="#f59e0b"   bg="#fffbeb"
            icon={<WarningOutlined />}
          />
          <MiniStatCard
            label="Half Day"  value={todaySummary.halfDay}
            color="#8b5cf6"   bg="#faf5ff"
            icon={<ClockCircleOutlined />}
          />
          <MiniStatCard
            label="On Leave"  value={todaySummary.onLeave}
            color="#6366f1"   bg="#eef2ff"
            icon={<CalendarOutlined />}
          />
        </div>
      </Card>

      {/* ── Main Tabs ── */}
      <Card style={{
        borderRadius: 16, border: 'none',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ fontWeight: 600 }}
          tabBarExtraContent={
            activeTab === 'list' && (
              <Space>
                <Select
                  placeholder="Employee"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  style={{ width: 180 }}
                  onChange={(v) => { setFilterEmpId(v || null); setCurrentPage(1); }}
                >
                  {employees.map((e) => (
                    <Option key={e.id} value={e.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar size={18}
                          style={{ background: getAvatarColor(e.fullName), fontSize: 8, fontWeight: 700 }}>
                          {getInitials(e.fullName)}
                        </Avatar>
                        {e.fullName}
                      </div>
                    </Option>
                  ))}
                </Select>
                <Select
                  value={filterStatus || undefined}
                  onChange={(v) => { setFilterStatus(v || ''); setCurrentPage(1); }}
                  placeholder="Status"
                  allowClear
                  style={{ width: 140 }}
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <Option key={k} value={k}>
                      <Tag color={ATTENDANCE_STATUS_COLORS[k] || 'default'}
                        style={{ borderRadius: 20, margin: 0 }}>
                        {v.label}
                      </Tag>
                    </Option>
                  ))}
                </Select>
                <Select value={filterMonth}
                  onChange={(v) => { setFilterMonth(v); setCurrentPage(1); }}
                  style={{ width: 130 }}>
                  {MONTHS.map((m, i) => (
                    <Option key={i + 1} value={i + 1}>{m}</Option>
                  ))}
                </Select>
                <Select value={filterYear}
                  onChange={(v) => { setFilterYear(v); setCurrentPage(1); }}
                  style={{ width: 100 }}>
                  {[2022, 2023, 2024, 2025].map((y) => (
                    <Option key={y} value={y}>{y}</Option>
                  ))}
                </Select>
              </Space>
            )
          }
          items={[
            // ─── LIST TAB ──────────────────────────────
            {
              key:      'list',
              label:    <span><UnorderedListOutlined /> Attendance List</span>,
              children: (
                <div>
                  {/* Search */}
                  <div style={{ marginBottom: 16 }}>
                    <Input
                      placeholder="Search employee name..."
                      prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                      value={searchText}
                      onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                      style={{ width: 280, borderRadius: 10, height: 40 }}
                      allowClear
                    />
                  </div>

                  <Table
                    dataSource={attendances}
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
                          Total <strong>{t}</strong> records
                        </Text>
                      ),
                    }}
                    size="middle"
                    style={{ borderRadius: 12, overflow: 'hidden' }}
                    rowClassName={(r) => r.status === 'ABSENT' ? 'absent-row' : ''}
                    locale={{
                      emptyText: (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <Text style={{ color: '#9ca3af' }}>No attendance records found</Text>
                          } />
                      ),
                    }}
                  />
                </div>
              ),
            },

            // ─── CALENDAR TAB ──────────────────────────
            {
              key:      'calendar',
              label:    <span><CalendarOutlined /> Calendar View</span>,
              children: (
                <div>
                  <Alert
                    message="Calendar View"
                    description="Color-coded attendance calendar. Click on a date to view details."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16, borderRadius: 10 }}
                  />
                  <Calendar
                    cellRender={(date) => calendarCellRender(date)}
                    style={{ borderRadius: 12 }}
                    onSelect={handleDateSelect}
                  />
                </div>
              ),
            },

            // ─── ANALYTICS TAB ─────────────────────────
            {
              key:      'analytics',
              label:    <span><BarChartOutlined /> Analytics</span>,
              children: (
                <div>
                  <Row gutter={[20, 20]}>
                    {/* Weekly Bar Chart */}
                    <Col xs={24} lg={14}>
                      <Card title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700 }}>Weekly Attendance</span>
                          <Tag color="blue">This Week</Tag>
                        </div>
                      } style={innerCardStyle}>
                        <WeeklyBarChart />
                        <Divider style={{ margin: '16px 0 10px' }} />
                        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
                          {[
                            { label: 'Present', color: '#6366f1' },
                            { label: 'Absent',  color: '#ef4444' },
                            { label: 'Late',    color: '#f59e0b' },
                          ].map((l) => (
                            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                              <Text style={{ fontSize: 12, color: '#6b7280' }}>{l.label}</Text>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </Col>

                    {/* Status Distribution */}
                    <Col xs={24} lg={10}>
                      <Card title={<span style={{ fontWeight: 700 }}>Today's Distribution</span>}
                        style={innerCardStyle}>
                        {Object.entries({
                          Present:  { value: todaySummary.present,  color: '#22c55e' },
                          Absent:   { value: todaySummary.absent,   color: '#ef4444' },
                          Late:     { value: todaySummary.late,     color: '#f59e0b' },
                          'Half Day': { value: todaySummary.halfDay, color: '#8b5cf6' },
                          'On Leave': { value: todaySummary.onLeave, color: '#6366f1' },
                        }).map(([label, { value, color }]) => (
                          <div key={label} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                                <Text style={{ fontSize: 13, fontWeight: 500 }}>{label}</Text>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Text style={{ color, fontWeight: 700 }}>{value}</Text>
                                <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                                  ({Math.round((value / todaySummary.total) * 100)}%)
                                </Text>
                              </div>
                            </div>
                            <Progress
                              percent={Math.round((value / todaySummary.total) * 100)}
                              strokeColor={color} trailColor="#f1f5f9"
                              showInfo={false} style={{ margin: 0 }}
                            />
                          </div>
                        ))}
                      </Card>
                    </Col>

                    {/* Monthly Trend */}
                    <Col xs={24}>
                      <Card title={<span style={{ fontWeight: 700 }}>Monthly Trend — {dayjs().format('MMMM YYYY')}</span>}
                        style={innerCardStyle}>
                        <Row gutter={[16, 16]}>
                          {[
                            { label: 'Avg Attendance Rate', value: '87%',        color: '#22c55e', icon: <ArrowUpOutlined /> },
                            { label: 'Avg Work Hours/Day',  value: '8.4h',       color: '#6366f1', icon: <ClockCircleOutlined /> },
                            { label: 'Total Overtime',      value: '142h',       color: '#f59e0b', icon: <ThunderboltOutlined /> },
                            { label: 'Late Arrivals',       value: '48',         color: '#ef4444', icon: <WarningOutlined /> },
                          ].map((s) => (
                            <Col xs={12} md={6} key={s.label}>
                              <div style={{
                                background: '#fafbfc', borderRadius: 14,
                                padding: '18px 16px', border: '1px solid #f1f5f9',
                                textAlign: 'center',
                              }}>
                                <div style={{ color: s.color, fontSize: 22, marginBottom: 8 }}>
                                  {s.icon}
                                </div>
                                <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>
                                  {s.value}
                                </div>
                                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                                  {s.label}
                                </div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* ══════════════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════════════ */}
      
      <Modal
        open={modalOpen}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ClockCircleOutlined style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {editRecord ? 'Edit Attendance' : 'Mark Attendance'}
              </div>
              <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 400 }}>
                {editRecord ? 'Update attendance record' : 'Manually mark attendance for an employee'}
              </div>
            </div>
          </div>
        }
        onCancel={() => { setModalOpen(false); setEditRecord(null); }}
        footer={null}
        width={560}
        centered
        destroyOnClose
      >
        <Divider style={{ margin: '12px 0 20px' }} />
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)} size="large">
          <Row gutter={[16, 0]}>
            {/* Employee */}
            <Col xs={24}>
              <Form.Item
                label={<span style={labelStyle}>Employee <span style={reqStyle}>*</span></span>}
              >
                <Controller name="employeeId" control={control} render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select employee"
                    showSearch
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                    disabled={!!editRecord}
                  >
                    {employees.map((e) => (
                      <Option key={e.id} value={e.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar size={22}
                            style={{ background: getAvatarColor(e.fullName), fontSize: 9, fontWeight: 700 }}>
                            {getInitials(e.fullName)}
                          </Avatar>
                          <span>{e.fullName}</span>
                          <Tag style={{ marginLeft: 'auto', fontSize: 11 }}>{e.departmentName}</Tag>
                        </div>
                      </Option>
                    ))}
                  </Select>
                )} />
              </Form.Item>
            </Col>

            {/* Date */}
            <Col xs={24} md={12}>
              <Form.Item label={<span style={labelStyle}>Date <span style={reqStyle}>*</span></span>}>
                <Controller name="date" control={control} render={({ field }) => (
                  <DatePicker
                    style={{ width: '100%', borderRadius: 10, height: 44 }}
                    format="DD-MM-YYYY"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(_, ds) => field.onChange(ds)}
                    disabled={!!editRecord}
                  />
                )} />
              </Form.Item>
            </Col>

            {/* Status */}
            <Col xs={24} md={12}>
              <Form.Item label={<span style={labelStyle}>Status <span style={reqStyle}>*</span></span>}>
                <Controller name="status" control={control} render={({ field }) => (
                  <Select {...field} style={{ width: '100%' }}>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <Option key={k} value={k}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: v.color,
                          }} />
                          {v.label}
                        </div>
                      </Option>
                    ))}
                  </Select>
                )} />
              </Form.Item>
            </Col>

            {/* Check In (only for PRESENT / LATE / HALF_DAY) */}
            {['PRESENT', 'LATE', 'HALF_DAY'].includes(watchStatus) && (
              <>
                <Col xs={24} md={12}>
                  <Form.Item label={<span style={labelStyle}>Check In Time</span>}>
                    <Controller name="checkIn" control={control} render={({ field }) => (
                      <TimePicker
                        style={{ width: '100%', borderRadius: 10, height: 44 }}
                        format="HH:mm"
                        value={field.value ? dayjs(field.value, 'HH:mm') : null}
                        onChange={(_, ts) => field.onChange(ts)}
                        placeholder="Select check-in time"
                      />
                    )} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label={<span style={labelStyle}>Check Out Time</span>}>
                    <Controller name="checkOut" control={control} render={({ field }) => (
                      <TimePicker
                        style={{ width: '100%', borderRadius: 10, height: 44 }}
                        format="HH:mm"
                        value={field.value ? dayjs(field.value, 'HH:mm') : null}
                        onChange={(_, ts) => field.onChange(ts)}
                        placeholder="Select check-out time"
                      />
                    )} />
                  </Form.Item>
                </Col>
              </>
            )}

            {/* Notes */}
            <Col xs={24}>
              <Form.Item label={<span style={labelStyle}>Notes</span>}>
                <Controller name="notes" control={control} render={({ field }) => (
                  <Input.TextArea
                    {...field}
                    placeholder="Add any notes about this attendance record..."
                    rows={3}
                    style={{ borderRadius: 10 }}
                    maxLength={300}
                    showCount
                  />
                )} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0 16px' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => { setModalOpen(false); setEditRecord(null); }}
              style={{ borderRadius: 10, height: 42, paddingInline: 20 }}>
              Cancel
            </Button>
            <Button
              type="primary" htmlType="submit"
              loading={submitLoading}
              style={{
                borderRadius: 10, height: 42, paddingInline: 28,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border: 'none', fontWeight: 600,
              }}
            >
              {submitLoading
                ? (editRecord ? 'Updating...' : 'Marking...')
                : (editRecord ? 'Update Record' : 'Mark Attendance')}
            </Button>
          </div>
        </Form>
      </Modal>

      

      {/* ══════════════════════════════════════════════
          VIEW DRAWER
      ══════════════════════════════════════════════ */}
      <Drawer
        open={viewOpen}
        onClose={() => { setViewOpen(false); setViewRecord(null); }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ClockCircleOutlined style={{ color: '#6366f1' }} />
            <span style={{ fontWeight: 700 }}>Attendance Details</span>
          </div>
        }
        width={380}
        extra={
          isHR && viewRecord && (
            <Button icon={<EditOutlined />} type="primary"
              onClick={() => { setViewOpen(false); openEditModal(viewRecord); }}
              style={{ borderRadius: 8, background: '#6366f1', border: 'none' }}>
              Edit
            </Button>
          )
        }
      >
        {viewRecord && (() => {
          const cfg = STATUS_CONFIG[viewRecord.status];
          return (
            <div>
              {/* Employee Header */}
              <div style={{
                textAlign: 'center', padding: '20px 0 24px',
                borderBottom: '1px solid #f1f5f9', marginBottom: 20,
              }}>
                <Avatar size={72}
                  style={{
                    background: getAvatarColor(viewRecord.employeeName),
                    fontSize: 28, fontWeight: 700, marginBottom: 12,
                  }}>
                  {getInitials(viewRecord.employeeName)}
                </Avatar>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#1f2937' }}>
                  {viewRecord.employeeName}
                </div>
                <div style={{ color: '#6b7280', marginTop: 4 }}>
                  {formatDate(viewRecord.date)}
                </div>
                <div style={{ marginTop: 10 }}>
                  <Tag
                    icon={cfg.icon}
                    style={{
                      background: cfg.bg, color: cfg.color,
                      border: `1px solid ${cfg.color}33`,
                      borderRadius: 20, padding: '4px 16px',
                      fontSize: 13, fontWeight: 700,
                    }}
                  >
                    {cfg.label}
                  </Tag>
                </div>
              </div>

              {/* Time Details */}
              <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                <Col span={12}>
                  <div style={{
                    background: '#f0fdf4', borderRadius: 12,
                    padding: '14px', textAlign: 'center',
                    border: '1px solid #bbf7d0',
                  }}>
                    <LoginOutlined style={{ color: '#22c55e', fontSize: 20, marginBottom: 8 }} />
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>CHECK IN</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>
                      {viewRecord.checkIn || '—'}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{
                    background: '#eef2ff', borderRadius: 12,
                    padding: '14px', textAlign: 'center',
                    border: '1px solid #c7d2fe',
                  }}>
                    <LogoutOutlined style={{ color: '#6366f1', fontSize: 20, marginBottom: 8 }} />
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>CHECK OUT</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#6366f1' }}>
                      {viewRecord.checkOut || '—'}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Work Hours */}
              {viewRecord.workHours && (
                <div style={{
                  background: '#fafbfc', borderRadius: 12,
                  padding: '16px', border: '1px solid #f1f5f9',
                  marginBottom: 20,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontWeight: 600 }}>Work Hours</Text>
                    <Text style={{ fontWeight: 800, color: '#6366f1', fontSize: 18 }}>
                      {viewRecord.workHours}h
                    </Text>
                  </div>
                  <Progress
                    percent={Math.min(Math.round((viewRecord.workHours / 9) * 100), 100)}
                    strokeColor={viewRecord.workHours >= 8 ? '#22c55e' : '#f59e0b'}
                    trailColor="#e5e7eb"
                  />
                  {viewRecord.overtime && viewRecord.overtime > 0 && (
                    <div style={{ marginTop: 10, textAlign: 'right' }}>
                      <Tag color="orange" style={{ borderRadius: 20, fontWeight: 600 }}>
                        <ThunderboltOutlined /> Overtime: +{viewRecord.overtime}h
                      </Tag>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {viewRecord.notes && (
                <div style={{
                  background: '#fffbeb', borderRadius: 12,
                  padding: '14px 16px', border: '1px solid #fde68a',
                  marginBottom: 20,
                }}>
                  <Text style={{ color: '#92400e', fontSize: 13 }}>
                    📝 {viewRecord.notes}
                  </Text>
                </div>
              )}

              {/* Metadata */}
              <div style={{ color: '#9ca3af', fontSize: 12 }}>
                <div>Recorded: {formatDateTime(viewRecord.createdAt)}</div>
              </div>

              {/* Edit Action */}
              {isHR && (
                <Button block icon={<EditOutlined />} style={{ borderRadius: 10, height: 42, marginTop: 20 }}
                  onClick={() => { setViewOpen(false); openEditModal(viewRecord); }}>
                  Edit This Record
                </Button>
              )}
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};

// ─── Missing imports ───────────────────────────────────


// ─── Shared Styles ─────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontWeight: 500, fontSize: 13, color: '#374151',
};
const reqStyle: React.CSSProperties = {
  color: '#ef4444',
};
const innerCardStyle: React.CSSProperties = {
  borderRadius: 14, border: '1px solid #f1f5f9',
  boxShadow: 'none',
};

export default AttendanceList;