import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Button, Input, Select, Tag, Typography,
  Row, Col, Avatar, Tooltip, Badge, Progress, Space,
  Modal, Form, message, Tabs, Drawer, Divider, Empty,
  Alert, Statistic, Steps, InputNumber, Switch,
  Dropdown, MenuProps, Result, DatePicker, Descriptions,
} from 'antd';
import {
  DollarOutlined, CheckCircleOutlined, CloseCircleOutlined,
  SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined,
  UserOutlined, CalendarOutlined, BarChartOutlined,
  TeamOutlined, ThunderboltOutlined, DownloadOutlined,
  EyeOutlined, MoreOutlined, PrinterOutlined,
  FileTextOutlined, BankOutlined, CalculatorOutlined,
  ArrowUpOutlined, ArrowDownOutlined, WalletOutlined,
  SendOutlined, SafetyOutlined, PieChartOutlined,
  UnorderedListOutlined, FilterOutlined, ExportOutlined,
  CreditCardOutlined, FundOutlined, RiseOutlined,
  PercentageOutlined, MinusOutlined, PlusCircleOutlined,
  CheckOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { useForm, Controller }   from 'react-hook-form';
import { yupResolver }           from '@hookform/resolvers/yup';
import * as yup                  from 'yup';
import dayjs, { Dayjs }          from 'dayjs';
import { payrollApi, Payroll }   from '../../api/payrollApi';
import { employeeApi }           from '../../api/employeeApi';
import {
  formatDate, formatCurrency,
  getInitials, getAvatarColor,
}                                from '../../utils/helpers';
import {
  ROUTES, PAGE_SIZE,
}                                from '../../constants';
import PageHeader                from '../../components/common/PageHeader';
import ConfirmDialog             from '../../components/common/ConfirmDialog';
import LoadingSpinner            from '../../components/common/LoadingSpinner';
import { useDebounce }           from '../../hooks/useDebounce';
import { useAuth }               from '../../hooks/useAuth';

const { Text, Title, Paragraph } = Typography;
const { TextArea }               = Input;
const { Option }                 = Select;

// ─── Types ─────────────────────────────────────────────
type PayrollStatus = 'PENDING' | 'PROCESSED' | 'PAID';

interface SalaryStructure {
  employeeId:   number;
  basicSalary:  number;
  hra:          number;
  da:           number;
  ta:           number;
  medicalAllow: number;
  otherAllow:   number;
  pf:           number;
  esi:          number;
  tds:          number;
  otherDeduct:  number;
 }

// ─── Mock Payroll Data ─────────────────────────────────
const mockPayrolls: Payroll[] = [
  {
    id: 1, employeeId: 1, employeeName: 'John Doe',
    month: 3, year: 2024, basicSalary: 45000,
    hra: 18000, allowances: 9000,
    deductions: 5500, taxDeduction: 4200,
    netSalary: 62300, status: 'PAID',
    paidOn: '2024-03-31', createdAt: '2024-03-01',
    monthName: '', da: 0, grossSalary: 0,
    pfDeduction: 0, esiDeduction: 0,
    tdsDeduction: 0, profTax: 0,
    totalDeductions: 0, workingDays: 0,
    presentDays: 0, absentDays: 0,
    leaveDays: 0
  },
  {
    id: 2, employeeId: 2, employeeName: 'Sarah Smith',
    month: 3, year: 2024, basicSalary: 55000,
    hra: 22000, allowances: 11000,
    deductions: 6800, taxDeduction: 6500,
    netSalary: 74700, status: 'PAID',
    paidOn: '2024-03-31', createdAt: '2024-03-01',
    monthName: '', da: 0, grossSalary: 0,
    pfDeduction: 0, esiDeduction: 0,
    tdsDeduction: 0, profTax: 0,
    totalDeductions: 0, workingDays: 0,
    presentDays: 0, absentDays: 0,
    leaveDays: 0
  },
  {
    id: 3, employeeId: 3, employeeName: 'Alex Johnson',
    month: 3, year: 2024, basicSalary: 35000,
    hra: 14000, allowances: 7000,
    deductions: 4200, taxDeduction: 2800,
    netSalary: 49000, status: 'PROCESSED',
    createdAt: '2024-03-01', monthName: '',
    da: 0, grossSalary: 0, pfDeduction: 0,
    esiDeduction: 0, tdsDeduction: 0, profTax: 0,
    totalDeductions: 0, workingDays: 0,
    presentDays: 0, absentDays: 0, leaveDays: 0
  },
  {
    id: 4, employeeId: 4, employeeName: 'Emma Wilson',
    month: 3, year: 2024, basicSalary: 65000,
    hra: 26000, allowances: 13000,
    deductions: 8000, taxDeduction: 9500,
    netSalary: 86500, status: 'PROCESSED',
    createdAt: '2024-03-01', monthName: '',
    da: 0, grossSalary: 0, pfDeduction: 0,
    esiDeduction: 0, tdsDeduction: 0,
    profTax: 0, totalDeductions: 0, workingDays: 0,
    presentDays: 0, absentDays: 0, leaveDays: 0
  },
  {
    id: 5, employeeId: 5, employeeName: 'Mike Davis',
    month: 3, year: 2024, basicSalary: 40000,
    hra: 16000, allowances: 8000,
    deductions: 4800, taxDeduction: 3200,
    netSalary: 56000, status: 'PENDING',
    createdAt: '2024-03-01', monthName: '',
    da: 0, grossSalary: 0, pfDeduction: 0,
    esiDeduction: 0, tdsDeduction: 0,
    profTax: 0, totalDeductions: 0,
    workingDays: 0, presentDays: 0, absentDays: 0, leaveDays: 0
  },
  {
    id: 6, employeeId: 6, employeeName: 'Lisa Taylor',
    month: 3, year: 2024, basicSalary: 50000,
    hra: 20000, allowances: 10000,
    deductions: 6000, taxDeduction: 5500,
    netSalary: 68500, status: 'PENDING',
    createdAt: '2024-03-01',
    monthName: '', da: 0, grossSalary: 0, pfDeduction: 0,
    esiDeduction: 0, tdsDeduction: 0, profTax: 0,
    totalDeductions: 0, workingDays: 0,
    presentDays: 0, absentDays: 0, leaveDays: 0
  },
];

// ─── Month Labels ──────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ─── Status Config ─────────────────────────────────────
// ✅ FIXED - 'antColor' added to type AND object
const STATUS_CONFIG: Record<PayrollStatus, {
  color: string; bg: string; label: string;
  icon: React.ReactNode; step: number; antColor: string;
}> = {
  PENDING:   {
    color: '#f59e0b', bg: '#fffbeb',
    label: 'Pending', icon: <ClockCircleOutlined />, step: 0,
    antColor: 'warning',
  },
  PROCESSED: {
    color: '#6366f1', bg: '#eef2ff',
    label: 'Processed', icon: <CheckCircleOutlined />, step: 1,
    antColor: 'processing',
  },
  PAID: {
    color: '#22c55e', bg: '#f0fdf4',
    label: 'Paid', icon: <DollarOutlined />, step: 2,
    antColor: 'success',
  },
};

// ─── Salary Component Row ──────────────────────────────
const SalaryRow: React.FC<{
  label: string; value: number;
  type?: 'earn' | 'deduct'; isTotal?: boolean;
  color?: string;
}> = ({ label, value, type = 'earn', isTotal = false, color }) => (
  <div style={{
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        isTotal ? '14px 16px' : '10px 16px',
    background:     isTotal
      ? type === 'earn'
        ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)'
        : 'linear-gradient(135deg,#fef2f2,#fee2e2)'
      : '#fafbfc',
    borderRadius: isTotal ? 12 : 8,
    border:       isTotal
      ? `1px solid ${type === 'earn' ? '#bbf7d0' : '#fecaca'}`
      : '1px solid #f1f5f9',
    marginBottom: 6,
    transition:   'all 0.2s',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {!isTotal && (
        <div style={{
          width:  8, height: 8, borderRadius: '50%',
          background: color || (type === 'earn' ? '#22c55e' : '#ef4444'),
        }} />
      )}
      <Text style={{
        fontWeight: isTotal ? 700 : 500,
        fontSize:   isTotal ? 15 : 13,
        color:      '#1f2937',
      }}>
        {label}
      </Text>
    </div>
    <Text style={{
      fontWeight: isTotal ? 800 : 600,
      fontSize:   isTotal ? 16 : 14,
      color:      color || (type === 'earn' ? '#22c55e' : '#ef4444'),
    }}>
      {type === 'deduct' && !isTotal ? '- ' : ''}
      {formatCurrency(value)}
    </Text>
  </div>
);

// ─── Mini Stat Card ────────────────────────────────────
const MiniStat: React.FC<{
  label: string; value: string | number;
  color: string; bg: string; icon: React.ReactNode;
  change?: number;
}> = ({ label, value, color, bg, icon, change }) => (
  <Card style={{
    borderRadius: 16, border: 'none',
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    background: bg, overflow: 'hidden',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <Text style={{ color: '#6b7280', fontSize: 12, fontWeight: 500 }}>{label}</Text>
        <div style={{ fontSize: 24, fontWeight: 800, color, marginTop: 4, lineHeight: 1.2 }}>
          {value}
        </div>
        {change !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
            {change >= 0
              ? <ArrowUpOutlined style={{ color: '#22c55e', fontSize: 11 }} />
              : <ArrowDownOutlined style={{ color: '#ef4444', fontSize: 11 }} />}
            <Text style={{ fontSize: 11, color: change >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
              {Math.abs(change)}% vs last month
            </Text>
          </div>
        )}
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: `${color}18`, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 22, color,
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
const PayrollList: React.FC = () => {
  const { user, isAdmin, isHR } = useAuth();

  // ── State ──────────────────────────────────────────
  const [payrolls,       setPayrolls]       = useState<Payroll[]>([]);
  const [employees,      setEmployees]      = useState<{ id: number; fullName: string; departmentName: string }[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [submitLoading,  setSubmitLoading]  = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [totalElements,  setTotalElements]  = useState(0);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [activeTab,      setActiveTab]      = useState('list');
  const [searchText,     setSearchText]     = useState('');
  const [filterStatus,   setFilterStatus]   = useState<PayrollStatus | ''>('');
  const [filterMonth,    setFilterMonth]    = useState<number>(new Date().getMonth() + 1);
  const [filterYear,     setFilterYear]     = useState<number>(new Date().getFullYear());

  // Modals & Drawers
  const [viewPayroll,    setViewPayroll]    = useState<Payroll | null>(null);
  const [viewOpen,       setViewOpen]       = useState(false);
  const [processOpen,    setProcessOpen]    = useState(false);
  const [payOpen,        setPayOpen]        = useState(false);
  const [payRecord,      setPayRecord]      = useState<Payroll | null>(null);
  const [payLoading,     setPayLoading]     = useState(false);
  const [bulkProcess,    setBulkProcess]    = useState(false);

  const debouncedSearch = useDebounce(searchText, 400);

  // ── Computed Stats ─────────────────────────────────
  const totalGross   = payrolls.reduce((s, p) =>
    s + p.basicSalary + p.hra + p.allowances, 0);
  const totalNet     = payrolls.reduce((s, p) => s + p.netSalary, 0);
  const totalTax     = payrolls.reduce((s, p) => s + p.taxDeduction, 0);
  const totalDeduct  = payrolls.reduce((s, p) => s + p.deductions, 0);
  const paidCount    = payrolls.filter((p) => p.status === 'PAID').length;
  const pendingCount = payrolls.filter((p) => p.status === 'PENDING').length;
  const processedCount = payrolls.filter((p) => p.status === 'PROCESSED').length;

  // ── Fetch ──────────────────────────────────────────
  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, [filterStatus, filterMonth, filterYear, debouncedSearch]);

  const fetchPayrolls = useCallback(async () => {
    setLoading(true);
    try {
      const response = await payrollApi.getAll({
        status: filterStatus || undefined,
        month:  filterMonth,
        year:   filterYear,
        search: debouncedSearch || undefined,
      });
      const data: any = response.data;
      const fetchedData: any[] = data?.content || data || [];
      const total = response.data?.totalElements || fetchedData.length;
      setPayrolls(fetchedData);
      setTotalElements(total);
    } catch {
      message.error('Failed to load payroll records');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterMonth, filterYear, debouncedSearch]);

  const fetchEmployees = async () => {
    try {
      const res = await employeeApi.getAll({ page: 0, size: 300 });
      setEmployees((res.data?.content || []).map((e: any) => ({
        id:             e.id,
        fullName:       e.fullName || `${e.firstName} ${e.lastName}`,
        departmentName: e.departmentName || '',
      })));
    } catch { /* silent */ }
  };

  // ── Process Payroll ────────────────────────────────
  const handleProcess = async () => {
    setProcessLoading(true);
    try {
      // await payrollApi.process(filterMonth, filterYear);
      setPayrolls((prev) =>
        prev.map((p) =>
          p.status === 'PENDING' ? { ...p, status: 'PROCESSED' as PayrollStatus } : p
        )
      );
      message.success(`Payroll processed for ${MONTHS[filterMonth - 1]} ${filterYear}`);
      setProcessOpen(false);
    } catch {
      message.error('Processing failed');
    } finally {
      setProcessLoading(false);
    }
  };

  // ── Mark as Paid ───────────────────────────────────
  const handleMarkPaid = async () => {
    if (!payRecord) return;
    setPayLoading(true);
    try {
      setPayrolls((prev) =>
        prev.map((p) =>
          p.id === payRecord.id
            ? { ...p, status: 'PAID' as PayrollStatus, paidOn: dayjs().format('YYYY-MM-DD') }
            : p
        )
      );
      message.success(`Payslip marked as paid for ${payRecord.employeeName}`);
      setPayOpen(false);
    } catch {
      message.error('Failed to mark as paid');
    } finally {
      setPayLoading(false);
    }
  };

  // ── Download Payslip ───────────────────────────────
  const handleDownload = (record: Payroll) => {
    message.loading('Generating payslip...', 1.5);
    setTimeout(() => message.success('Payslip downloaded successfully!'), 1500);
  };

  // ── Table Columns ──────────────────────────────────
  const columns = [
    {
      title: 'Employee',
      key:   'employee',
      render: (_: any, r: Payroll) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size={40}
            style={{
              background: getAvatarColor(r.employeeName),
              fontWeight: 700, fontSize: 14, flexShrink: 0,
            }}>
            {getInitials(r.employeeName)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>
              {r.employeeName}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              {MONTHS[r.month - 1]} {r.year}
            </div>
          </div>
        </div>
      ),
      sorter: (a: Payroll, b: Payroll) => a.employeeName.localeCompare(b.employeeName),
    },
    {
      title:     'Basic Salary',
      dataIndex: 'basicSalary',
      key:       'basicSalary',
      render: (v: number) => (
        <Text style={{ fontWeight: 600, fontSize: 14 }}>{formatCurrency(v)}</Text>
      ),
      sorter: (a: Payroll, b: Payroll) => a.basicSalary - b.basicSalary,
    },
    {
      title: 'Earnings',
      key:   'earnings',
      render: (_: any, r: Payroll) => {
        const gross = r.basicSalary + r.hra + r.allowances;
        return (
          <div>
            <Text style={{ fontWeight: 700, color: '#22c55e', fontSize: 14 }}>
              {formatCurrency(gross)}
            </Text>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
              HRA: {formatCurrency(r.hra)} + Allow: {formatCurrency(r.allowances)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Deductions',
      key:   'deductions',
      render: (_: any, r: Payroll) => {
        const total = r.deductions + r.taxDeduction;
        return (
          <div>
            <Text style={{ fontWeight: 700, color: '#ef4444', fontSize: 14 }}>
              -{formatCurrency(total)}
            </Text>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
              PF: {formatCurrency(r.deductions)} + Tax: {formatCurrency(r.taxDeduction)}
            </div>
          </div>
        );
      },
    },
    {
      title:     'Net Salary',
      dataIndex: 'netSalary',
      key:       'netSalary',
      render: (v: number) => (
        <div style={{
          background: '#f0fdf4', borderRadius: 10,
          padding: '6px 12px', display: 'inline-block',
          border: '1px solid #bbf7d0',
        }}>
          <Text style={{ fontWeight: 800, color: '#22c55e', fontSize: 15 }}>
            {formatCurrency(v)}
          </Text>
        </div>
      ),
      sorter: (a: Payroll, b: Payroll) => a.netSalary - b.netSalary,
    },
    {
      title:     'Status',
      dataIndex: 'status',
      key:       'status',
      render: (status: PayrollStatus) => {
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
    },
    {
      title:  'Paid On',
      key:    'paidOn',
      render: (_: any, r: Payroll) => r.paidOn ? (
        <Text style={{ color: '#6b7280', fontSize: 13 }}>{formatDate(r.paidOn)}</Text>
      ) : (
        <Text style={{ color: '#d1d5db' }}>—</Text>
      ),
    },
    {
      title:  'Actions',
      key:    'actions',
      width:  180,
      render: (_: any, record: Payroll) => {
        const menuItems: MenuProps['items'] = [
          {
            key:     'view',
            icon:    <EyeOutlined />,
            label:   'View Payslip',
            onClick: () => { setViewPayroll(record); setViewOpen(true); },
          },
          {
            key:     'download',
            icon:    <DownloadOutlined />,
            label:   'Download PDF',
            onClick: () => handleDownload(record),
          },
          ...(isHR && record.status === 'PROCESSED' ? [
            { type: 'divider' as const },
            {
              key:     'pay',
              icon:    <DollarOutlined style={{ color: '#22c55e' }} />,
              label:   <span style={{ color: '#22c55e', fontWeight: 600 }}>Mark as Paid</span>,
              onClick: () => { setPayRecord(record); setPayOpen(true); },
            },
          ] : []),
        ];

        return (
          <Space size={6}>
            <Tooltip title="View Payslip">
              <Button size="small" icon={<EyeOutlined />}
                onClick={() => { setViewPayroll(record); setViewOpen(true); }}
                style={{ borderRadius: 8, color: '#6366f1', borderColor: '#6366f1' }} />
            </Tooltip>
            <Tooltip title="Download">
              <Button size="small" icon={<DownloadOutlined />}
                onClick={() => handleDownload(record)}
                style={{ borderRadius: 8 }} />
            </Tooltip>
            {isHR && record.status === 'PROCESSED' && (
              <Tooltip title="Mark as Paid">
                <Button size="small" icon={<DollarOutlined />}
                  onClick={() => { setPayRecord(record); setPayOpen(true); }}
                  style={{
                    borderRadius: 8, background: '#f0fdf4',
                    color: '#22c55e', borderColor: '#22c55e',
                  }} />
              </Tooltip>
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
        title="Payroll Management"
        subtitle={`${MONTHS[filterMonth - 1]} ${filterYear} · ${totalElements} records`}
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.DASHBOARD },
          { label: 'Payroll' },
        ]}
        actions={
          <Space>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={fetchPayrolls}
                style={{ borderRadius: 10, height: 40 }} />
            </Tooltip>
            <Button icon={<ExportOutlined />}
              style={{ borderRadius: 10, height: 40 }}>
              Export
            </Button>
            {isHR && (
              <Button
                type="primary" icon={<CalculatorOutlined />}
                onClick={() => setProcessOpen(true)}
                style={{
                  borderRadius: 10, height: 40,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: 'none', fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                }}
              >
                Process Payroll
              </Button>
            )}
          </Space>
        }
      />

      {/* ── Payroll Summary Hero ── */}
      <Card style={{
        borderRadius: 20, border: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: 24, overflow: 'hidden',
        background: 'linear-gradient(135deg,#1e293b 0%,#334155 50%,#1e293b 100%)',
      }}>
        {/* Pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 10% 50%,rgba(99,102,241,0.2),transparent 40%),' +
            'radial-gradient(circle at 90% 50%,rgba(34,197,94,0.15),transparent 40%)',
        }} />

        <Row gutter={[24, 24]} style={{ position: 'relative' }}>
          {/* Left: Month selector + Total */}
          <Col xs={24} md={8}>
            <div>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                Payroll Period
              </Text>
              <div style={{ display: 'flex', gap: 10, marginTop: 8, marginBottom: 16 }}>
                <Select
                  value={filterMonth}
                  onChange={(v) => setFilterMonth(v)}
                  style={{ flex: 1 }}
                  dropdownStyle={{ borderRadius: 10 }}
                >
                  {MONTHS.map((m, i) => (
                    <Option key={i + 1} value={i + 1}>{m}</Option>
                  ))}
                </Select>
                <Select
                  value={filterYear}
                  onChange={(v) => setFilterYear(v)}
                  style={{ width: 90 }}
                >
                  {[2022, 2023, 2024, 2025].map((y) => (
                    <Option key={y} value={y}>{y}</Option>
                  ))}
                </Select>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 4 }}>
                Total Net Payable
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                {formatCurrency(totalNet)}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>
                Gross: {formatCurrency(totalGross)} · Deductions: {formatCurrency(totalDeduct + totalTax)}
              </div>
            </div>
          </Col>

          {/* Center: Status Pills */}
          <Col xs={24} md={8}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                const count = payrolls.filter((p) => p.status === status).length;
                const pct   = totalElements ? Math.round((count / totalElements) * 100) : 0;
                return (
                  <div key={status} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 12, padding: '12px 16px',
                    border: `1px solid ${cfg.color}33`,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: `${cfg.color}22`,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: cfg.color,
                      fontSize: 16,
                    }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
                        {count} {cfg.label}
                      </div>
                      <Progress
                        percent={pct} size="small" showInfo={false}
                        strokeColor={cfg.color} trailColor="rgba(255,255,255,0.1)"
                        style={{ margin: 0 }}
                      />
                    </div>
                    <Text style={{ color: cfg.color, fontWeight: 700 }}>{pct}%</Text>
                  </div>
                );
              })}
            </div>
          </Col>

          {/* Right: Quick Actions */}
          <Col xs={24} md={8}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 4 }}>
                Quick Actions
              </div>
              {[
                {
                  label:   'Process All Pending',
                  icon:    <CalculatorOutlined />,
                  color:   '#6366f1',
                  onClick: () => setProcessOpen(true),
                  disabled: pendingCount === 0,
                },
                {
                  label:   'Export Payroll Report',
                  icon:    <ExportOutlined />,
                  color:   '#22c55e',
                  onClick: () => message.info('Exporting...'),
                  disabled: false,
                },
                {
                  label:   'Send Payslips via Email',
                  icon:    <SendOutlined />,
                  color:   '#f59e0b',
                  onClick: () => message.info('Sending payslips...'),
                  disabled: paidCount === 0,
                },
              ].map((action) => (
                <Button key={action.label}
                  icon={action.icon}
                  disabled={action.disabled}
                  onClick={action.onClick}
                  style={{
                    height: 44, borderRadius: 12, fontWeight: 600,
                    background: action.disabled ? 'rgba(255,255,255,0.05)' : `${action.color}22`,
                    border: `1px solid ${action.color}44`,
                    color: action.disabled ? 'rgba(255,255,255,0.3)' : action.color,
                    textAlign: 'left',
                  }}
                >
                  {action.label}
                  {action.label === 'Process All Pending' && pendingCount > 0 && (
                    <Badge count={pendingCount} size="small"
                      style={{ marginLeft: 8, background: action.color }} />
                  )}
                </Button>
              ))}
            </div>
          </Col>
        </Row>
      </Card>

      {/* ── Stat Cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <MiniStat
            label="Total Employees"
            value={totalElements}
            color="#6366f1" bg="#fff"
            icon={<TeamOutlined />}
          />
        </Col>
        <Col xs={12} md={6}>
          <MiniStat
            label="Total Gross"
            value={formatCurrency(totalGross)}
            color="#22c55e" bg="#fff"
            icon={<RiseOutlined />}
            change={8}
          />
        </Col>
        <Col xs={12} md={6}>
          <MiniStat
            label="Total Deductions"
            value={formatCurrency(totalDeduct + totalTax)}
            color="#ef4444" bg="#fff"
            icon={<MinusOutlined />}
          />
        </Col>
        <Col xs={12} md={6}>
          <MiniStat
            label="Total Net Salary"
            value={formatCurrency(totalNet)}
            color="#f59e0b" bg="#fff"
            icon={<WalletOutlined />}
            change={5}
          />
        </Col>
      </Row>

      {/* ── Main Tabs ── */}
      <Card style={{
        borderRadius: 16, border: 'none',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ fontWeight: 600 }}
          items={[
            // ── PAYROLL LIST TAB ─────────────────────
            {
              key:   'list',
              label: <span><UnorderedListOutlined /> Payroll List</span>,
              children: (
                <div>
                  {/* Filters */}
                  <div style={{
                    display: 'flex', gap: 12, flexWrap: 'wrap',
                    marginBottom: 16, alignItems: 'center',
                  }}>
                    <Input
                      placeholder="Search employee..."
                      prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ width: 240, borderRadius: 10, height: 40 }}
                      allowClear
                    />
                    <Select
                      value={filterStatus || undefined}
                      onChange={(v) => { setFilterStatus(v || ''); setCurrentPage(1); }}
                      placeholder="All Status"
                      allowClear style={{ width: 160 }}
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <Option key={k} value={k}>
                          <Tag
                            style={{
                              borderRadius: 20, background: v.bg,
                              color: v.color, border: 'none',
                              fontWeight: 600, margin: 0,
                            }}
                          >
                            {v.icon} {v.label}
                          </Tag>
                        </Option>
                      ))}
                    </Select>
                    {(filterStatus || searchText) && (
                      <Button size="small"
                        onClick={() => { setFilterStatus(''); setSearchText(''); }}
                        style={{ borderRadius: 8, color: '#ef4444', borderColor: '#ef4444' }}>
                        Clear
                      </Button>
                    )}
                    <div style={{ marginLeft: 'auto' }}>
                      <Text style={{ color: '#6b7280', fontSize: 13 }}>
                        Showing <strong>{payrolls.length}</strong> of {totalElements} records
                      </Text>
                    </div>
                  </div>

                  {/* Pending Alert */}
                  {isHR && pendingCount > 0 && (
                    <Alert
                      message={
                        <span>
                          <strong>{pendingCount}</strong> payroll record{pendingCount > 1 ? 's' : ''} pending processing
                        </span>
                      }
                      type="warning"
                      showIcon
                      icon={<ClockCircleOutlined />}
                      style={{ marginBottom: 16, borderRadius: 10 }}
                      action={
                        <Button size="small" onClick={() => setProcessOpen(true)}
                          style={{ borderRadius: 8 }}>
                          Process Now
                        </Button>
                      }
                    />
                  )}

                  <Table
                    dataSource={payrolls}
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
                    scroll={{ x: 900 }}
                    locale={{
                      emptyText: (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={<Text style={{ color: '#9ca3af' }}>No payroll records found</Text>} />
                      ),
                    }}
                  />
                </div>
              ),
            },

            // ── ANALYTICS TAB ────────────────────────
            {
              key:   'analytics',
              label: <span><BarChartOutlined /> Analytics</span>,
              children: (
                <Row gutter={[20, 20]}>
                  {/* Salary Distribution */}
                  <Col xs={24} lg={14}>
                    <Card title={<span style={{ fontWeight: 700 }}>Salary Distribution</span>}
                      style={innerCardStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {payrolls
                          .sort((a, b) => b.netSalary - a.netSalary)
                          .slice(0, 6)
                          .map((p) => {
                            const maxNet = Math.max(...payrolls.map((x) => x.netSalary));
                            const pct    = Math.round((p.netSalary / maxNet) * 100);
                            return (
                              <div key={p.id}>
                                <div style={{
                                  display: 'flex', justifyContent: 'space-between',
                                  marginBottom: 6, alignItems: 'center',
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Avatar size={28}
                                      style={{ background: getAvatarColor(p.employeeName),
                                               fontSize: 11, fontWeight: 700 }}>
                                      {getInitials(p.employeeName)}
                                    </Avatar>
                                    <Text style={{ fontWeight: 500, fontSize: 13 }}>
                                      {p.employeeName}
                                    </Text>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Text style={{ fontWeight: 700, color: '#22c55e', fontSize: 13 }}>
                                      {formatCurrency(p.netSalary)}
                                    </Text>
                                    <Tag color={STATUS_CONFIG[p.status as PayrollStatus].antColor as any}
                                      style={{ borderRadius: 20, margin: 0, fontSize: 11 }}>
                                      {STATUS_CONFIG[p.status as PayrollStatus].label}
                                    </Tag>
                                  </div>
                                </div>
                                <Progress
                                  percent={pct}
                                  strokeColor={getAvatarColor(p.employeeName)}
                                  trailColor="#f1f5f9" showInfo={false}
                                  style={{ margin: 0 }}
                                />
                              </div>
                            );
                          })}
                      </div>
                    </Card>
                  </Col>

                  {/* Summary Stats */}
                  <Col xs={24} lg={10}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Salary Breakdown */}
                      <Card title={<span style={{ fontWeight: 700 }}>Payroll Breakdown</span>}
                        style={innerCardStyle}>
                        {[
                          { label: 'Basic Salary', value: mockPayrolls.reduce((s,p) => s + p.basicSalary, 0),   color: '#6366f1', type: 'earn' as const },
                          { label: 'HRA',           value: mockPayrolls.reduce((s,p) => s + p.hra, 0),           color: '#22c55e', type: 'earn' as const },
                          { label: 'Allowances',    value: mockPayrolls.reduce((s,p) => s + p.allowances, 0),    color: '#0ea5e9', type: 'earn' as const },
                          { label: 'PF / ESI',      value: mockPayrolls.reduce((s,p) => s + p.deductions, 0),    color: '#f59e0b', type: 'deduct' as const },
                          { label: 'Tax (TDS)',      value: mockPayrolls.reduce((s,p) => s + p.taxDeduction, 0),  color: '#ef4444', type: 'deduct' as const },
                        ].map((item) => (
                          <SalaryRow key={item.label} {...item} />
                        ))}
                        <div style={{ margin: '8px 0' }}>
                          <SalaryRow
                            label="Total Net Payable"
                            value={totalNet}
                            type="earn"
                            isTotal
                            color="#22c55e"
                          />
                        </div>
                      </Card>

                      {/* Status Summary */}
                      <Card title={<span style={{ fontWeight: 700 }}>Status Overview</span>}
                        style={innerCardStyle}>
                        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                          const count = mockPayrolls.filter((p) => p.status === status).length;
                          const pct   = Math.round((count / mockPayrolls.length) * 100);
                          return (
                            <div key={status} style={{ marginBottom: 14 }}>
                              <div style={{
                                display: 'flex', justifyContent: 'space-between', marginBottom: 6,
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ color: cfg.color }}>{cfg.icon}</span>
                                  <Text style={{ fontWeight: 500, fontSize: 13 }}>{cfg.label}</Text>
                                </div>
                                <div>
                                  <Text style={{ fontWeight: 700, color: cfg.color }}>{count}</Text>
                                  <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 4 }}>
                                    ({pct}%)
                                  </Text>
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
                    </div>
                  </Col>

                  {/* Monthly Comparison */}
                  <Col xs={24}>
                    <Card
                      title={<span style={{ fontWeight: 700 }}>Monthly Payroll Trend</span>}
                      style={innerCardStyle}
                    >
                      <Row gutter={[16, 16]}>
                        {[
                          { month: 'Jan', gross: 38200000, net: 32100000, trend: 2 },
                          { month: 'Feb', gross: 39100000, net: 32800000, trend: 2.2 },
                          { month: 'Mar', gross: 40500000, net: 34000000, trend: 3.7 },
                        ].map((m) => (
                          <Col xs={24} md={8} key={m.month}>
                            <div style={{
                              background: '#fafbfc', borderRadius: 14,
                              padding: '16px', border: '1px solid #f1f5f9',
                            }}>
                              <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', marginBottom: 10,
                              }}>
                                <Text style={{ fontWeight: 700, fontSize: 15 }}>{m.month} 2024</Text>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <ArrowUpOutlined style={{ color: '#22c55e', fontSize: 11 }} />
                                  <Text style={{ color: '#22c55e', fontWeight: 600, fontSize: 12 }}>
                                    +{m.trend}%
                                  </Text>
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>Gross</div>
                                <div style={{ fontWeight: 700, color: '#6366f1', fontSize: 16 }}>
                                  {formatCurrency(m.gross / 100)}
                                </div>
                              </div>
                              <Divider style={{ margin: '8px 0' }} />
                              <div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>Net</div>
                                <div style={{ fontWeight: 800, color: '#22c55e', fontSize: 18 }}>
                                  {formatCurrency(m.net / 100)}
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

            // ── PAYSLIP PREVIEW TAB ──────────────────
            {
              key:   'payslip',
              label: <span><FileTextOutlined /> Payslip Preview</span>,
              children: viewPayroll ? (
                <PayslipPreview payroll={viewPayroll} />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Select a payroll record to preview the payslip"
                >
                  <Button type="primary" onClick={() => setActiveTab('list')}
                    style={{ borderRadius: 10, background: '#6366f1', border: 'none' }}>
                    Go to Payroll List
                  </Button>
                </Empty>
              ),
            },
          ]}
        />
      </Card>

      {/* ══════════════════════════════════════════════
          VIEW PAYSLIP DRAWER
      ══════════════════════════════════════════════ */}
      <Drawer
        open={viewOpen}
        onClose={() => { setViewOpen(false); setViewPayroll(null); }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <DollarOutlined style={{ color: '#6366f1' }} />
            <span style={{ fontWeight: 700 }}>Payslip Details</span>
          </div>
        }
        width={440}
        extra={
          <Space>
            <Button icon={<PrinterOutlined />}
              style={{ borderRadius: 8 }} onClick={() => window.print()}>
              Print
            </Button>
            <Button icon={<DownloadOutlined />} type="primary"
              style={{ borderRadius: 8, background: '#6366f1', border: 'none' }}
              onClick={() => viewPayroll && handleDownload(viewPayroll)}>
              Download
            </Button>
          </Space>
        }
      >
        {viewPayroll && <PayslipPreview payroll={viewPayroll} compact />}
      </Drawer>

      {/* ══════════════════════════════════════════════
          PROCESS PAYROLL MODAL
      ══════════════════════════════════════════════ */}
      <Modal
        open={processOpen}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CalculatorOutlined style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Process Payroll</div>
              <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 400 }}>
                {MONTHS[filterMonth - 1]} {filterYear}
              </div>
            </div>
          </div>
        }
        onCancel={() => setProcessOpen(false)}
        onOk={handleProcess}
        okText="Process Payroll"
        okButtonProps={{
          loading: processLoading,
          style: {
            borderRadius: 8, fontWeight: 600,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            border: 'none',
          },
        }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        centered width={500}
      >
        <Divider style={{ margin: '12px 0 20px' }} />

        {/* Summary */}
        <div style={{
          background: '#f8fafc', borderRadius: 14,
          padding: '20px', marginBottom: 20,
          border: '1px solid #f1f5f9',
        }}>
          <Row gutter={[16, 16]}>
            {[
              { label: 'Total Employees',   value: totalElements,          color: '#6366f1' },
              { label: 'Pending Records',   value: pendingCount,           color: '#f59e0b' },
              { label: 'Total Net Payable', value: formatCurrency(totalNet), color: '#22c55e' },
            ].map((s) => (
              <Col span={8} key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Process Steps */}
        <Steps
          size="small"
          direction="vertical"
          current={1}
          style={{ marginBottom: 20 }}
          items={[
            { title: 'Calculate Salaries',    description: 'Basic + HRA + Allowances',        status: 'finish'  },
            { title: 'Apply Deductions',       description: 'PF, ESI, TDS, Other deductions',  status: 'process' },
            { title: 'Generate Payslips',      description: 'PDF payslips for all employees',  status: 'wait'    },
            { title: 'Send Notifications',     description: 'Email payslips to employees',     status: 'wait'    },
          ]}
        />

        <Alert
          message="This will process payroll for all pending records"
          description="Salary calculations will be finalized and payslips will be generated. This action can be reviewed before final payment."
          type="info"
          showIcon
          style={{ borderRadius: 10 }}
        />
      </Modal>

      {/* ── Mark as Paid Modal ── */}
      <Modal
        open={payOpen}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <DollarOutlined style={{ color: '#22c55e', fontSize: 20 }} />
            <span style={{ fontWeight: 700 }}>Mark as Paid</span>
          </div>
        }
        onOk={handleMarkPaid}
        onCancel={() => { setPayOpen(false); setPayRecord(null); }}
        okText="Confirm Payment"
        okButtonProps={{
          loading: payLoading,
          style: { borderRadius: 8, background: '#22c55e', border: 'none', fontWeight: 600 },
        }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        centered width={440}
      >
        {payRecord && (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#f0fdf4', borderRadius: 12, padding: '16px',
              border: '1px solid #bbf7d0', marginBottom: 16, marginTop: 12,
            }}>
              <Avatar size={48}
                style={{ background: getAvatarColor(payRecord.employeeName),
                         fontWeight: 700, fontSize: 18 }}>
                {getInitials(payRecord.employeeName)}
              </Avatar>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{payRecord.employeeName}</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>
                  {MONTHS[payRecord.month - 1]} {payRecord.year}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>
                  {formatCurrency(payRecord.netSalary)}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Net Salary</div>
              </div>
            </div>
            <Alert
              message="Confirm salary disbursement for this employee"
              type="success"
              showIcon
              icon={<SafetyOutlined />}
              style={{ borderRadius: 10 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// PAYSLIP PREVIEW COMPONENT
// ═══════════════════════════════════════════════════════
const PayslipPreview: React.FC<{
  payroll: Payroll; compact?: boolean;
}> = ({ payroll, compact = false }) => {
  const gross      = payroll.basicSalary + payroll.hra + payroll.allowances;
  const totalDeduct = payroll.deductions + payroll.taxDeduction;

  return (
    <div style={{
      background: '#fff',
      fontFamily: "'Inter', sans-serif",
      maxWidth:   compact ? '100%' : 720,
      margin:     '0 auto',
    }}>
      {/* Payslip Header */}
      <div style={{
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        padding: compact ? '20px' : '28px 32px',
        borderRadius: compact ? '12px 12px 0 0' : 12,
        color: '#fff',
        marginBottom: compact ? 0 : 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>TechCorp Solutions</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              123 Business Park, Mumbai, Maharashtra 400001
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              hr@techcorp.com | +91 22 1234 5678
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 10, padding: '8px 16px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>PAYSLIP</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>
                {MONTHS[payroll.month - 1]} {payroll.year}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Info */}
      <div style={{
        background: '#f8fafc', padding: compact ? '16px' : '20px 24px',
        border: '1px solid #f1f5f9',
        borderRadius: compact ? 0 : 12,
        marginBottom: compact ? 0 : 20,
      }}>
        <Row gutter={[16, 12]}>
          {[
            { label: 'Employee Name',  value: payroll.employeeName },
            { label: 'Employee ID',    value: `EMP${payroll.employeeId.toString().padStart(4, '0')}` },
            { label: 'Pay Period',     value: `${MONTHS[payroll.month - 1]} ${payroll.year}` },
            { label: 'Payment Date',   value: payroll.paidOn ? formatDate(payroll.paidOn) : 'Pending' },
            { label: 'Payment Mode',   value: 'Bank Transfer' },
            { label: 'PAN Number',     value: 'ABCDE1234F' },
          ].map((item) => (
            <Col xs={12} key={item.label}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>{item.value}</div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Salary Table */}
      <div style={{
        border: '1px solid #f1f5f9', borderRadius: compact ? 0 : 12,
        overflow: 'hidden', marginBottom: compact ? 0 : 20,
      }}>
        <Row>
          {/* Earnings */}
          <Col xs={24} md={12} style={{ borderRight: compact ? 'none' : '1px solid #f1f5f9' }}>
            <div style={{
              background: '#f0fdf4', padding: '10px 16px',
              fontWeight: 700, fontSize: 13, color: '#166534',
              borderBottom: '1px solid #f1f5f9',
            }}>
              💰 Earnings
            </div>
            <div style={{ padding: '12px 16px' }}>
              {[
                { label: 'Basic Salary',    value: payroll.basicSalary },
                { label: 'House Rent Allowance (HRA)', value: payroll.hra },
                { label: 'Transport Allowance', value: Math.round(payroll.allowances * 0.3) },
                { label: 'Medical Allowance',   value: Math.round(payroll.allowances * 0.2) },
                { label: 'Special Allowance',   value: Math.round(payroll.allowances * 0.5) },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 0', borderBottom: '1px dashed #f1f5f9',
                  fontSize: 13,
                }}>
                  <Text style={{ color: '#374151' }}>{item.label}</Text>
                  <Text style={{ fontWeight: 600, color: '#22c55e' }}>
                    {formatCurrency(item.value)}
                  </Text>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 0 0', fontWeight: 800, fontSize: 14,
                borderTop: '2px solid #bbf7d0', marginTop: 6,
                color: '#166534',
              }}>
                <span>Gross Earnings</span>
                <span>{formatCurrency(gross)}</span>
              </div>
            </div>
          </Col>

          {/* Deductions */}
          <Col xs={24} md={12}>
            <div style={{
              background: '#fef2f2', padding: '10px 16px',
              fontWeight: 700, fontSize: 13, color: '#991b1b',
              borderBottom: '1px solid #f1f5f9',
            }}>
              📉 Deductions
            </div>
            <div style={{ padding: '12px 16px' }}>
              {[
                { label: 'Provident Fund (PF)',  value: Math.round(payroll.deductions * 0.7) },
                { label: 'ESI',                  value: Math.round(payroll.deductions * 0.3) },
                { label: 'Income Tax (TDS)',      value: payroll.taxDeduction },
                { label: 'Professional Tax',      value: 200 },
                { label: 'Other Deductions',      value: 0 },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 0', borderBottom: '1px dashed #f1f5f9',
                  fontSize: 13,
                }}>
                  <Text style={{ color: '#374151' }}>{item.label}</Text>
                  <Text style={{ fontWeight: 600, color: '#ef4444' }}>
                    {item.value > 0 ? `- ${formatCurrency(item.value)}` : '—'}
                  </Text>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 0 0', fontWeight: 800, fontSize: 14,
                borderTop: '2px solid #fecaca', marginTop: 6,
                color: '#991b1b',
              }}>
                <span>Total Deductions</span>
                <span>- {formatCurrency(totalDeduct)}</span>
              </div>
            </div>
          </Col>
        </Row>

        {/* Net Salary Footer */}
        <div style={{
          background: 'linear-gradient(135deg,#22c55e,#16a34a)',
          padding: '16px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Net Salary Payable</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
              {gross > 0
                ? `${((payroll.netSalary / gross) * 100).toFixed(1)}% of gross earnings`
                : ''}
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>
            {formatCurrency(payroll.netSalary)}
          </div>
        </div>
      </div>

      {/* Status & Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: compact ? '12px 0 0' : '16px 0 0',
        borderTop: compact ? '1px solid #f1f5f9' : 'none',
        marginTop: compact ? 12 : 0,
      }}>
        <div>
          <Tag
            icon={STATUS_CONFIG[payroll.status as PayrollStatus]?.icon}
            style={{
              borderRadius: 20, padding: '4px 14px',
              fontWeight: 700, fontSize: 13,
              background: STATUS_CONFIG[payroll.status as PayrollStatus]?.bg,
              color:      STATUS_CONFIG[payroll.status as PayrollStatus]?.color,
              border:     `1px solid ${STATUS_CONFIG[payroll.status as PayrollStatus]?.color}44`,
            }}
          >
            {STATUS_CONFIG[payroll.status as PayrollStatus]?.label}
          </Tag>
          {payroll.paidOn && (
            <Text style={{ color: '#6b7280', fontSize: 12, marginLeft: 8 }}>
              Paid on {formatDate(payroll.paidOn)}
            </Text>
          )}
        </div>
        <Text style={{ color: '#9ca3af', fontSize: 11 }}>
          This is a computer-generated payslip. No signature required.
        </Text>
      </div>
    </div>
  );
};

// ─── Shared Styles ─────────────────────────────────────
const innerCardStyle: React.CSSProperties = {
  borderRadius: 14, border: '1px solid #f1f5f9', boxShadow: 'none',
};

const STATUS_CONFIG_EXTENDED = {
  ...STATUS_CONFIG,
};

// Add antColor to STATUS_CONFIG
Object.assign(STATUS_CONFIG.PENDING,   { antColor: 'warning'   });
Object.assign(STATUS_CONFIG.PROCESSED, { antColor: 'processing' });
Object.assign(STATUS_CONFIG.PAID,      { antColor: 'success'   });

export default PayrollList;