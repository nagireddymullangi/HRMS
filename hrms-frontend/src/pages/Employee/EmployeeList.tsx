import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Card, Table, Button, Input, Select, Tag, Typography,
  Row, Col, Avatar, Tooltip, Badge, Progress, Space,
  Dropdown, Modal, Form, message, Divider, Empty,
  Switch, Statistic, Alert, Upload, MenuProps, Drawer,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined,
  DeleteOutlined, MoreOutlined, TeamOutlined,
  UserOutlined, ReloadOutlined, ExportOutlined,
  EyeOutlined, FilterOutlined, DownloadOutlined,
  UploadOutlined, MailOutlined, PhoneOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  ClockCircleOutlined, CalendarOutlined,
  BankOutlined, ManOutlined, WomanOutlined,
  AppstoreOutlined, UnorderedListOutlined,
  IdcardOutlined, DollarOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
  StarOutlined, CrownOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';
import { useNavigate }           from 'react-router-dom';
import { employeeApi }           from '../../api/employeeApi';
import { departmentApi }         from '../../api/departmentApi';
import {
  Employee, EmployeeStatus,
}                                from '../../types/employee.types';
import { Department }            from '../../types/department.types';
import {
  formatDate, formatCurrency,
  getInitials, getAvatarColor,
  getYearsOfExperience, truncate,
}                                from '../../utils/helpers';
import {
  ROUTES, PAGE_SIZE, PAGE_SIZE_OPTIONS,
  EMPLOYEE_STATUS_COLORS,
  EMPLOYMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
}                                from '../../constants';
import PageHeader                from '../../components/common/PageHeader';
import ConfirmDialog             from '../../components/common/ConfirmDialog';
import LoadingSpinner            from '../../components/common/LoadingSpinner';
import { useDebounce }           from '../../hooks/useDebounce';
import { useAuth }               from '../../hooks/useAuth';

const { Text, Title }           = Typography;
const { Option }                = Select;

// ─── Types ─────────────────────────────────────────────
type ViewMode = 'table' | 'grid';
type SortField = 'name' | 'department' | 'joinDate' | 'status';

// ─── Status Config ─────────────────────────────────────
const STATUS_CONFIG: Record<EmployeeStatus, {
  color: string; bg: string; label: string;
  icon: React.ReactNode; dotColor: string;
}> = {
  ACTIVE: {
    color: '#22c55e', bg: '#f0fdf4',
    label: 'Active', icon: <CheckCircleOutlined />,
    dotColor: '#22c55e',
  },
  INACTIVE: {
    color: '#6b7280', bg: '#f9fafb',
    label: 'Inactive', icon: <CloseCircleOutlined />,
    dotColor: '#6b7280',
  },
  TERMINATED: {
    color: '#ef4444', bg: '#fef2f2',
    label: 'Terminated', icon: <CloseCircleOutlined />,
    dotColor: '#ef4444',
  },
  ON_LEAVE: {
    color: '#f59e0b', bg: '#fffbeb',
    label: 'On Leave', icon: <ClockCircleOutlined />,
    dotColor: '#f59e0b',
  },
};

// ─── Mock Employee Data ────────────────────────────────
const mockEmployees: Employee[] = [
  {
    id: 1, employeeId: 'EMP20240001',
    firstName: 'John', lastName: 'Doe', fullName: 'John Doe',
    email: 'john.doe@company.com', phone: '9876543210',
    gender: 'MALE', dateOfBirth: '1992-05-15', joiningDate: '2022-01-10',
    status: 'ACTIVE', employmentType: 'FULL_TIME',
    departmentId: 1, departmentName: 'Engineering',
    designationId: 1, designationName: 'Senior Developer',
    managerName: 'Alex Manager', salary: 85000,
    createdAt: '2022-01-10', updatedAt: '2024-03-01',
  },
  {
    id: 2, employeeId: 'EMP20240002',
    firstName: 'Sarah', lastName: 'Smith', fullName: 'Sarah Smith',
    email: 'sarah.smith@company.com', phone: '9876543211',
    gender: 'FEMALE', dateOfBirth: '1990-08-22', joiningDate: '2021-06-15',
    status: 'ACTIVE', employmentType: 'FULL_TIME',
    departmentId: 2, departmentName: 'Marketing',
    designationId: 2, designationName: 'Marketing Lead',
    managerName: 'HR Manager', salary: 92000,
    createdAt: '2021-06-15', updatedAt: '2024-03-01',
  },
  {
    id: 3, employeeId: 'EMP20240003',
    firstName: 'Alex', lastName: 'Johnson', fullName: 'Alex Johnson',
    email: 'alex.j@company.com', phone: '9876543212',
    gender: 'MALE', dateOfBirth: '1995-11-08', joiningDate: '2023-03-20',
    status: 'ON_LEAVE', employmentType: 'FULL_TIME',
    departmentId: 1, departmentName: 'Engineering',
    designationId: 3, designationName: 'Junior Developer',
    managerName: 'John Doe', salary: 45000,
    createdAt: '2023-03-20', updatedAt: '2024-03-01',
  },
  {
    id: 4, employeeId: 'EMP20240004',
    firstName: 'Emma', lastName: 'Wilson', fullName: 'Emma Wilson',
    email: 'emma.w@company.com', phone: '9876543213',
    gender: 'FEMALE', dateOfBirth: '1993-02-28', joiningDate: '2020-09-01',
    status: 'ACTIVE', employmentType: 'FULL_TIME',
    departmentId: 3, departmentName: 'HR',
    designationId: 4, designationName: 'HR Manager',
    salary: 95000,
    createdAt: '2020-09-01', updatedAt: '2024-03-01',
  },
  {
    id: 5, employeeId: 'EMP20240005',
    firstName: 'Mike', lastName: 'Davis', fullName: 'Mike Davis',
    email: 'mike.d@company.com', phone: '9876543214',
    gender: 'MALE', dateOfBirth: '1988-07-12', joiningDate: '2019-04-15',
    status: 'ACTIVE', employmentType: 'FULL_TIME',
    departmentId: 4, departmentName: 'Finance',
    designationId: 5, designationName: 'Finance Manager',
    managerName: 'CEO', salary: 110000,
    createdAt: '2019-04-15', updatedAt: '2024-03-01',
  },
  {
    id: 6, employeeId: 'EMP20240006',
    firstName: 'Lisa', lastName: 'Taylor', fullName: 'Lisa Taylor',
    email: 'lisa.t@company.com', phone: '9876543215',
    gender: 'FEMALE', dateOfBirth: '1996-12-03', joiningDate: '2023-09-01',
    status: 'ACTIVE', employmentType: 'PART_TIME',
    departmentId: 2, departmentName: 'Marketing',
    designationId: 6, designationName: 'Content Writer',
    managerName: 'Sarah Smith', salary: 35000,
    createdAt: '2023-09-01', updatedAt: '2024-03-01',
  },
  {
    id: 7, employeeId: 'EMP20240007',
    firstName: 'David', lastName: 'Brown', fullName: 'David Brown',
    email: 'david.b@company.com', phone: '9876543216',
    gender: 'MALE', dateOfBirth: '1991-04-18', joiningDate: '2022-07-10',
    status: 'INACTIVE', employmentType: 'CONTRACT',
    departmentId: 1, departmentName: 'Engineering',
    designationId: 7, designationName: 'DevOps Engineer',
    salary: 75000,
    createdAt: '2022-07-10', updatedAt: '2024-03-01',
  },
  {
    id: 8, employeeId: 'EMP20240008',
    firstName: 'Amy', lastName: 'Chen', fullName: 'Amy Chen',
    email: 'amy.c@company.com', phone: '9876543217',
    gender: 'FEMALE', dateOfBirth: '1994-09-25', joiningDate: '2023-01-15',
    status: 'ACTIVE', employmentType: 'INTERN',
    departmentId: 1, departmentName: 'Engineering',
    designationId: 8, designationName: 'Intern',
    salary: 20000,
    createdAt: '2023-01-15', updatedAt: '2024-03-01',
  },
];

// ─── Mini Stat Card ────────────────────────────────────
const StatCard: React.FC<{
  title: string; value: number | string;
  icon: React.ReactNode; color: string;
  bg: string; change?: number;
}> = ({ title, value, icon, color, bg, change }) => (
  <Card style={{
    borderRadius: 16, border: 'none',
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    background: bg, overflow: 'hidden', position: 'relative',
  }}>
    <div style={{
      position: 'absolute', right: -8, top: -8,
      width: 70, height: 70, borderRadius: '50%',
      background: `${color}12`,
    }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <Text style={{ color: '#6b7280', fontSize: 12, fontWeight: 500 }}>{title}</Text>
        <div style={{ fontSize: 28, fontWeight: 800, color, marginTop: 4, lineHeight: 1 }}>
          {value}
        </div>
        {change !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
            {change >= 0
              ? <ArrowUpOutlined style={{ color: '#22c55e', fontSize: 11 }} />
              : <ArrowDownOutlined style={{ color: '#ef4444', fontSize: 11 }} />}
            <Text style={{
              fontSize: 11, fontWeight: 600,
              color: change >= 0 ? '#22c55e' : '#ef4444',
            }}>
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

// ─── Employee Grid Card ────────────────────────────────
const EmployeeGridCard: React.FC<{
  emp: Employee;
  onView:   (e: Employee) => void;
  onEdit:   (e: Employee) => void;
  onDelete: (e: Employee) => void;
}> = ({ emp, onView, onEdit, onDelete }) => {
  const cfg = STATUS_CONFIG[emp.status];

  const menuItems: MenuProps['items'] = [
    { key: 'view',   icon: <EyeOutlined />,    label: 'View Profile', onClick: () => onView(emp) },
    { key: 'edit',   icon: <EditOutlined />,   label: 'Edit',         onClick: () => onEdit(emp) },
    { type: 'divider' },
    { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true, onClick: () => onDelete(emp) },
  ];

  return (
    <Card
      hoverable
      onClick={() => onView(emp)}
      style={{
        borderRadius: 16, border: '1px solid #f1f5f9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        cursor: 'pointer', transition: 'all 0.3s',
        overflow: 'hidden',
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Top Banner */}
      <div style={{
        height: 56,
        background: `linear-gradient(135deg, ${getAvatarColor(emp.fullName)}cc, ${getAvatarColor(emp.fullName)}88)`,
        position: 'relative',
      }}>
        {/* Dropdown */}
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button
              size="small"
              icon={<MoreOutlined style={{ color: '#fff' }} />}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 8,
              }}
            />
          </Dropdown>
        </div>

        {/* Status Dot */}
        <div style={{
          position: 'absolute', top: 10, left: 12,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: cfg.dotColor, boxShadow: `0 0 8px ${cfg.dotColor}`,
          }} />
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 600 }}>
            {cfg.label}
          </Text>
        </div>
      </div>

      {/* Avatar */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        marginTop: -30, position: 'relative', zIndex: 1,
      }}>
        <Avatar
          size={60}
          src={emp.profilePicture}
          style={{
            background: getAvatarColor(emp.fullName),
            fontSize: 22, fontWeight: 700,
            border: '3px solid #fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          }}
        >
          {getInitials(emp.fullName)}
        </Avatar>
      </div>

      {/* Card Body */}
      <div style={{ padding: '10px 16px 18px', textAlign: 'center' }}>
        {/* Name */}
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1f2937', marginBottom: 2 }}>
          {emp.fullName}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
          {emp.designationName}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          <Tag style={{
            borderRadius: 20, fontSize: 11, padding: '0 8px',
            background: '#eef2ff', color: '#6366f1', border: 'none',
          }}>
            <BankOutlined style={{ marginRight: 3 }} />
            {emp.departmentName}
          </Tag>
          <Tag style={{
            borderRadius: 20, fontSize: 11, padding: '0 8px',
            background: '#f1f5f9', color: '#6b7280', border: 'none',
          }}>
            {emp.employmentType.replace('_', ' ')}
          </Tag>
        </div>

        {/* Info Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 8, marginBottom: 14,
        }}>
          <div style={{
            background: '#f8fafc', borderRadius: 8,
            padding: '8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: '#9ca3af' }}>Joined</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
              {formatDate(emp.joiningDate)}
            </div>
          </div>
          <div style={{
            background: '#f8fafc', borderRadius: 8,
            padding: '8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: '#9ca3af' }}>Experience</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
              {getYearsOfExperience(emp.joiningDate)}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Tooltip title={emp.email}>
            <div
              onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${emp.email}`; }}
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: '#eef2ff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#6366f1', fontSize: 14,
                border: '1px solid #c7d2fe', transition: 'all 0.2s',
              }}
            >
              <MailOutlined />
            </div>
          </Tooltip>
          <Tooltip title={emp.phone}>
            <div
              onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${emp.phone}`; }}
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: '#f0fdf4', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#22c55e', fontSize: 14,
                border: '1px solid #bbf7d0', transition: 'all 0.2s',
              }}
            >
              <PhoneOutlined />
            </div>
          </Tooltip>
          <Tooltip title="View Profile">
            <div
              onClick={(e) => { e.stopPropagation(); onView(emp); }}
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: '#f1f5f9', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#6b7280', fontSize: 14,
                border: '1px solid #e5e7eb', transition: 'all 0.2s',
              }}
            >
              <EyeOutlined />
            </div>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
const EmployeeList: React.FC = () => {
  const navigate          = useNavigate();
  const { isAdmin, isHR } = useAuth();

  // ── State ──────────────────────────────────────────
  const [employees,      setEmployees]      = useState<Employee[]>([]);
  const [departments,    setDepartments]    = useState<Department[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [totalElements,  setTotalElements]  = useState(0);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [pageSize,       setPageSize]       = useState(PAGE_SIZE);
  const [viewMode,       setViewMode]       = useState<ViewMode>('table');
  const [searchText,     setSearchText]     = useState('');
  const [filterStatus,   setFilterStatus]   = useState<EmployeeStatus | ''>('');
  const [filterDept,     setFilterDept]     = useState<number | null>(null);
  const [filterType,     setFilterType]     = useState<string>('');
  const [filterGender,   setFilterGender]   = useState<string>('');
  const [sortField,      setSortField]      = useState<SortField>('name');
  const [sortDir,        setSortDir]        = useState<'asc' | 'desc'>('asc');
  const [showFilters,    setShowFilters]    = useState(false);
  const [selectedRows,   setSelectedRows]   = useState<React.Key[]>([]);

  // Modals
  const [deleteOpen,     setDeleteOpen]     = useState(false);
  const [deleteEmp,      setDeleteEmp]      = useState<Employee | null>(null);
  const [deleting,       setDeleting]       = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const debouncedSearch = useDebounce(searchText, 400);

  // ── Stats ──────────────────────────────────────────
  const stats = {
    total:      employees.length,
    active:     employees.filter((e) => e.status === 'ACTIVE').length,
    inactive:   employees.filter((e) => e.status === 'INACTIVE').length,
    onLeave:    employees.filter((e) => e.status === 'ON_LEAVE').length,
    terminated: employees.filter((e) => e.status === 'TERMINATED').length,
    male:       employees.filter((e) => e.gender === 'MALE').length,
    female:     employees.filter((e) => e.gender === 'FEMALE').length,
  };

  // ── Fetch ──────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('hrms_access_token');
      const response = await axios.get('http://localhost:8080/api/employees', { headers: { Authorization: `Bearer ${token}` } });
      let filtered = response.data.data.content;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        filtered = filtered.filter((e: any) =>
          e.fullName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.departmentName.toLowerCase().includes(q) ||
          e.designationName.toLowerCase().includes(q)
        );
      }
      if (filterStatus) filtered = filtered.filter((e: any) => e.status === filterStatus);
      if (filterDept)   filtered = filtered.filter((e: any) => e.departmentId === filterDept);
      if (filterType)   filtered = filtered.filter((e: any) => e.employmentType === filterType);
      if (filterGender) filtered = filtered.filter((e: any) => e.gender === filterGender);

      setEmployees(filtered);
      setTotalElements(filtered.length);
    } catch {
      message.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterStatus, filterDept, filterType, filterGender]);

  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.getAllList();
      setDepartments(res.data || []);
    } catch { /* silent */ }
  };
  
  useEffect(() => {
    fetchEmployees();
    //fetchDepartments();
  }, [fetchEmployees]);

  

  // ── Actions ────────────────────────────────────────
  const handleView = (emp: Employee) => navigate(`/employees/${emp.id}`);
  const handleEdit = (emp: Employee) => navigate(`/employees/edit/${emp.id}`);

  const handleDelete = async () => {
    if (!deleteEmp) return;
    setDeleting(true);
    try {
      await employeeApi.delete(deleteEmp.id);
      setEmployees((prev) => prev.filter((e) => e.id !== deleteEmp.id));
      setTotalElements((prev) => prev - 1);
      message.success(`${deleteEmp.fullName} deleted successfully`);
      setDeleteOpen(false);
      setDeleteEmp(null);
    } catch {
      message.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setEmployees((prev) => prev.filter((e) => !selectedRows.includes(e.id)));
      setTotalElements((prev) => prev - selectedRows.length);
      message.success(`${selectedRows.length} employees deleted`);
      setSelectedRows([]);
      setBulkDeleteOpen(false);
    } catch {
      message.error('Bulk delete failed');
    }
  };

  const clearFilters = () => {
    setSearchText(''); setFilterStatus(''); setFilterDept(null);
    setFilterType(''); setFilterGender('');
  };

  const hasFilters = !!(searchText || filterStatus || filterDept || filterType || filterGender);
  const activeFiltersCount = [searchText, filterStatus, filterDept, filterType, filterGender]
    .filter(Boolean).length;

  // ── Row Selection ──────────────────────────────────
  const rowSelection = {
    selectedRowKeys: selectedRows,
    onChange: (keys: React.Key[]) => setSelectedRows(keys),
    columnWidth: 48,
  };

  // ── Table Columns ──────────────────────────────────
  const columns = [
    {
      title: 'Employee',
      key:   'employee',
      fixed: 'left' as const,
      width: 280,
      render: (_: any, r: Employee) => (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={() => handleView(r)}
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar size={44}
              src={r.profilePicture}
              style={{
                background: getAvatarColor(r.fullName),
                fontWeight: 700, fontSize: 16,
              }}
            >
              {getInitials(r.fullName)}
            </Avatar>
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 12, height: 12, borderRadius: '50%',
              background: STATUS_CONFIG[r.status].dotColor,
              border: '2px solid #fff',
            }} />
          </div>
          <div>
            <div style={{
              fontWeight: 600, fontSize: 14, color: '#1f2937',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {r.fullName}
              {r.gender === 'MALE'
                ? <ManOutlined style={{ color: '#3b82f6', fontSize: 12 }} />
                : <WomanOutlined style={{ color: '#ec4899', fontSize: 12 }} />}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
              <IdcardOutlined style={{ fontSize: 11 }} />
              {r.employeeId}
            </div>
          </div>
        </div>
      ),
      sorter: (a: Employee, b: Employee) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Designation',
      key:   'designation',
      width: 200,
      render: (_: any, r: Employee) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>
            {r.designationName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <BankOutlined style={{ fontSize: 11, color: '#6366f1' }} />
            <Text style={{ fontSize: 12, color: '#6b7280' }}>{r.departmentName}</Text>
          </div>
        </div>
      ),
    },
    {
      title:     'Contact',
      key:       'contact',
      width:     220,
      render: (_: any, r: Employee) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <MailOutlined style={{ fontSize: 12, color: '#6366f1' }} />
            <Text style={{ fontSize: 12, color: '#374151' }}>{truncate(r.email, 22)}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PhoneOutlined style={{ fontSize: 12, color: '#22c55e' }} />
            <Text style={{ fontSize: 12, color: '#374151' }}>{r.phone}</Text>
          </div>
        </div>
      ),
    },
    {
      title:     'Type',
      key:       'type',
      width:     120,
      render: (_: any, r: Employee) => {
        const typeColors: Record<string, string> = {
          FULL_TIME: 'blue',
          PART_TIME: 'cyan',
          CONTRACT:  'orange',
          INTERN:    'purple',
        };
        return (
          <Tag
            color={typeColors[r.employmentType] || 'default'}
            style={{ borderRadius: 20, fontSize: 11, fontWeight: 600, padding: '2px 10px' }}
          >
            {r.employmentType.replace('_', ' ')}
          </Tag>
        );
      },
    },
    {
      title:     'Joining',
      key:       'joining',
      width:     130,
      render: (_: any, r: Employee) => (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{formatDate(r.joiningDate)}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>
            {getYearsOfExperience(r.joiningDate)}
          </div>
        </div>
      ),
      sorter: (a: Employee, b: Employee) =>
        new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime(),
    },
    {
      title:     'Salary',
      key:       'salary',
      width:     120,
      render: (_: any, r: Employee) => r.salary ? (
        <Text style={{ fontWeight: 700, color: '#22c55e', fontSize: 13 }}>
          {formatCurrency(r.salary)}
        </Text>
      ) : (
        <Text style={{ color: '#d1d5db' }}>—</Text>
      ),
      sorter: (a: Employee, b: Employee) => (a.salary || 0) - (b.salary || 0),
    },
    {
      title:     'Status',
      dataIndex: 'status',
      key:       'status',
      width:     120,
      render: (status: EmployeeStatus) => {
        const cfg = STATUS_CONFIG[status];
        return (
          <Tag
            icon={cfg.icon}
            style={{
              borderRadius: 20, padding: '3px 10px',
              fontWeight: 600, fontSize: 11,
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
      title:  'Actions',
      key:    'actions',
      width:  130,
      fixed:  'right' as const,
      render: (_: any, record: Employee) => {
        const menuItems: MenuProps['items'] = [
          { key: 'view',   icon: <EyeOutlined />,    label: 'View Profile', onClick: () => handleView(record) },
          { key: 'edit',   icon: <EditOutlined />,   label: 'Edit',         onClick: () => handleEdit(record) },
          { type: 'divider' },
          { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true,
            onClick: () => { setDeleteEmp(record); setDeleteOpen(true); },
          },
        ];
        return (
          <Space size={4}>
            <Tooltip title="View">
              <Button size="small" icon={<EyeOutlined />}
                onClick={() => handleView(record)}
                style={{ borderRadius: 8, color: '#6366f1', borderColor: '#6366f1' }} />
            </Tooltip>
            <Tooltip title="Edit">
              <Button size="small" icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                style={{ borderRadius: 8 }} />
            </Tooltip>
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
        title="Employee Directory"
        subtitle={`${totalElements} employees · ${stats.active} active`}
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.DASHBOARD },
          { label: 'Employees' },
        ]}
        actions={
          <Space>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={fetchEmployees}
                style={{ borderRadius: 10, height: 40 }} />
            </Tooltip>
            <Button icon={<DownloadOutlined />}
              style={{ borderRadius: 10, height: 40 }}>
              Export
            </Button>
            {isHR && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/employees/add')}
                style={{
                  borderRadius: 10, height: 40,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: 'none', fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                }}
              >
                Add Employee
              </Button>
            )}
          </Space>
        }
      />

      {/* ── Stats Row ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <StatCard title="Total Employees" value={stats.total}
            icon={<TeamOutlined />} color="#6366f1" bg="#fff" change={12} />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Active" value={stats.active}
            icon={<CheckCircleOutlined />} color="#22c55e" bg="#fff" change={5} />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="On Leave" value={stats.onLeave}
            icon={<ClockCircleOutlined />} color="#f59e0b" bg="#fff" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Inactive" value={stats.inactive + stats.terminated}
            icon={<CloseCircleOutlined />} color="#ef4444" bg="#fff" />
        </Col>
      </Row>

      {/* ── Main Card ── */}
      <Card style={{
        borderRadius: 16, border: 'none',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        {/* ── Toolbar ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12,
          marginBottom: 16,
        }}>
          {/* Search */}
          <Input
            placeholder="Search by name, email, ID, department..."
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
            style={{ width: 320, borderRadius: 10, height: 40 }}
            allowClear
          />

          {/* Right Toolbar */}
          <Space size={8}>
            {/* Filter Toggle */}
            <Badge count={activeFiltersCount} size="small" offset={[-4, 4]}>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  borderRadius: 10, height: 40,
                  background: showFilters ? '#eef2ff' : '#fff',
                  color: showFilters ? '#6366f1' : '#6b7280',
                  borderColor: showFilters ? '#6366f1' : '#e5e7eb',
                }}
              >
                Filters
              </Button>
            </Badge>

            {/* Bulk Delete */}
            {selectedRows.length > 0 && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => setBulkDeleteOpen(true)}
                style={{ borderRadius: 10, height: 40 }}
              >
                Delete ({selectedRows.length})
              </Button>
            )}

            {/* View Toggle */}
            <div style={{
              display: 'flex', borderRadius: 10,
              border: '1px solid #e5e7eb', overflow: 'hidden',
            }}>
              <Tooltip title="Table View">
                <Button
                  icon={<UnorderedListOutlined />}
                  onClick={() => setViewMode('table')}
                  style={{
                    borderRadius: 0, border: 'none', height: 40,
                    background: viewMode === 'table' ? '#eef2ff' : '#fff',
                    color: viewMode === 'table' ? '#6366f1' : '#6b7280',
                  }}
                />
              </Tooltip>
              <Tooltip title="Grid View">
                <Button
                  icon={<AppstoreOutlined />}
                  onClick={() => setViewMode('grid')}
                  style={{
                    borderRadius: 0, border: 'none', height: 40,
                    background: viewMode === 'grid' ? '#eef2ff' : '#fff',
                    color: viewMode === 'grid' ? '#6366f1' : '#6b7280',
                  }}
                />
              </Tooltip>
            </div>
          </Space>
        </div>

        {/* ── Advanced Filters ── */}
        {showFilters && (
          <div style={{
            background: '#f8fafc', borderRadius: 12,
            padding: '16px 20px', marginBottom: 16,
            border: '1px solid #f1f5f9',
            display: 'flex', gap: 12, flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}>
            <div>
              <Text style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
                Status
              </Text>
              <Select
                value={filterStatus || undefined}
                onChange={(v) => { setFilterStatus(v || ''); setCurrentPage(1); }}
                placeholder="All Status" allowClear
                style={{ width: 150 }}
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <Option key={k} value={k}>
                    <Badge color={v.dotColor} text={v.label} />
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <Text style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
                Department
              </Text>
              <Select
                value={filterDept || undefined}
                onChange={(v) => { setFilterDept(v || null); setCurrentPage(1); }}
                placeholder="All Departments" allowClear
                showSearch optionFilterProp="children"
                style={{ width: 170 }}
              >
                {departments.map((d) => (
                  <Option key={d.id} value={d.id}>{d.name}</Option>
                ))}
              </Select>
            </div>
            <div>
              <Text style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
                Employment Type
              </Text>
              <Select
                value={filterType || undefined}
                onChange={(v) => { setFilterType(v || ''); setCurrentPage(1); }}
                placeholder="All Types" allowClear
                style={{ width: 150 }}
              >
                {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                  <Option key={o.value} value={o.value}>{o.label}</Option>
                ))}
              </Select>
            </div>
            <div>
              <Text style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
                Gender
              </Text>
              <Select
                value={filterGender || undefined}
                onChange={(v) => { setFilterGender(v || ''); setCurrentPage(1); }}
                placeholder="All" allowClear
                style={{ width: 120 }}
              >
                {GENDER_OPTIONS.map((o) => (
                  <Option key={o.value} value={o.value}>{o.label}</Option>
                ))}
              </Select>
            </div>
            {hasFilters && (
              <Button
                size="small"
                onClick={clearFilters}
                style={{
                  borderRadius: 8, color: '#ef4444',
                  borderColor: '#ef4444', alignSelf: 'center', marginTop: 18,
                }}
              >
                Clear All
              </Button>
            )}
          </div>
        )}

        {/* Active Filters Alert */}
        {hasFilters && (
          <Alert
            message={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13 }}>
                  Showing <strong>{employees.length}</strong> of {mockEmployees.length} employees
                  {filterStatus && <Tag style={{ marginLeft: 6 }}>{filterStatus}</Tag>}
                  {filterDept && <Tag style={{ marginLeft: 6 }}>Dept #{filterDept}</Tag>}
                  {filterType && <Tag style={{ marginLeft: 6 }}>{filterType}</Tag>}
                  {filterGender && <Tag style={{ marginLeft: 6 }}>{filterGender}</Tag>}
                </Text>
                <Button type="link" size="small" onClick={clearFilters}
                  style={{ color: '#6366f1', fontWeight: 600 }}>
                  Reset
                </Button>
              </div>
            }
            type="info"
            style={{ marginBottom: 16, borderRadius: 10 }}
            showIcon={false}
          />
        )}

        {/* ── TABLE VIEW ── */}
        {viewMode === 'table' && (
          <Table
            dataSource={employees}
            columns={columns}
            rowKey="id"
            loading={loading}
            rowSelection={isHR ? rowSelection : undefined}
            pagination={{
              current:         currentPage,
              pageSize:        pageSize,
              total:           totalElements,
              onChange:        (p, s) => { setCurrentPage(p); setPageSize(s || PAGE_SIZE); },
              showSizeChanger: true,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              showTotal: (t) => (
                <Text style={{ color: '#6b7280', fontSize: 13 }}>
                  Total <strong>{t}</strong> employees
                </Text>
              ),
            }}
            size="middle"
            scroll={{ x: 1200 }}
            style={{ borderRadius: 12, overflow: 'hidden' }}
            rowClassName={(r) =>
              r.status === 'INACTIVE' || r.status === 'TERMINATED'
                ? 'inactive-row' : ''
            }
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span style={{ color: '#9ca3af' }}>
                      {hasFilters
                        ? 'No employees match your filters'
                        : 'No employees found'}
                    </span>
                  }
                >
                  {!hasFilters && isHR && (
                    <Button type="primary" icon={<PlusOutlined />}
                      onClick={() => navigate('/employees/add')}
                      style={{ borderRadius: 10, background: '#6366f1', border: 'none' }}>
                      Add First Employee
                    </Button>
                  )}
                </Empty>
              ),
            }}
          />
        )}

        {/* ── GRID VIEW ── */}
        {viewMode === 'grid' && (
          loading ? (
            <LoadingSpinner tip="Loading employees..." />
          ) : employees.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#9ca3af' }}>No employees found</span>
              }
            >
              {isHR && (
                <Button type="primary" icon={<PlusOutlined />}
                  onClick={() => navigate('/employees/add')}
                  style={{ borderRadius: 10, background: '#6366f1', border: 'none' }}>
                  Add Employee
                </Button>
              )}
            </Empty>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {employees.map((emp) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={emp.id}>
                    <EmployeeGridCard
                      emp={emp}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={(e) => { setDeleteEmp(e); setDeleteOpen(true); }}
                    />
                  </Col>
                ))}
              </Row>

              {/* Grid Pagination */}
              <div style={{
                display: 'flex', justifyContent: 'center',
                marginTop: 24, gap: 8,
              }}>
                <Text style={{ color: '#6b7280', fontSize: 13 }}>
                  Showing <strong>{employees.length}</strong> of {totalElements} employees
                </Text>
              </div>
            </>
          )
        )}
      </Card>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Employee"
        message={
          deleteEmp
            ? `Are you sure you want to delete "${deleteEmp.fullName}"? This action cannot be undone.`
            : ''
        }
        type="danger"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteOpen(false); setDeleteEmp(null); }}
      />

      {/* ── Bulk Delete Confirm ── */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete Selected Employees"
        message={`Are you sure you want to delete ${selectedRows.length} selected employees? This action cannot be undone.`}
        type="danger"
        confirmText={`Delete ${selectedRows.length} Employees`}
        cancelText="Cancel"
        loading={false}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  );
};

export default EmployeeList;