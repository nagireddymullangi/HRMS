import React,{ useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Button, Input, Space, Tag, Typography,
  Row, Col, Avatar, Tooltip, Dropdown, Modal, Form,
  Select, Switch, Badge, Statistic, Progress, Empty,
  message, Alert, Divider, MenuProps, Drawer,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined,
  DeleteOutlined, MoreOutlined, ApartmentOutlined,
  TeamOutlined, UserOutlined, ReloadOutlined,
  ExportOutlined, EyeOutlined, FilterOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  BankOutlined, CrownOutlined, FolderOutlined,
  AppstoreOutlined, UnorderedListOutlined,
  BarChartOutlined, TrophyOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate }           from 'react-router-dom';
import { useForm, Controller }   from 'react-hook-form';
import { yupResolver }           from '@hookform/resolvers/yup';
import { departmentApi }         from '../../api/departmentApi';
import { employeeApi }           from '../../api/employeeApi';
import {
  Department, DepartmentRequest,
}                                from '../../types/department.types';
import { departmentSchema }      from '../../utils/validators';
import {
  formatDate, getInitials,
  getAvatarColor, truncate,
}                                from '../../utils/helpers';
import {
  ROUTES, PAGE_SIZE,
}                                from '../../constants';
import PageHeader                from '../../components/common/PageHeader';
import ConfirmDialog             from '../../components/common/ConfirmDialog';
import LoadingSpinner            from '../../components/common/LoadingSpinner';
import { useDebounce }           from '../../hooks/useDebounce';
import { useAuth }               from '../../hooks/useAuth';
import { useDispatch, UseDispatch } from 'react-redux';
import { updateDepartment } from '../../store/slices/departmentSlice';
import { AppDispatch } from '../../store/store';

const { Text, Title, Paragraph } = Typography;
const { TextArea }               = Input;
const { Option }                 = Select;

// ─── Types ─────────────────────────────────────────────
type ViewMode = 'table' | 'grid';

interface FormValues {
  name:                string;
  code:                string;
  description?:        string;
  headId?:             number;
  parentDepartmentId?: number;
  isActive:            boolean;
}

// ─── Stat Card ─────────────────────────────────────────
const StatCard: React.FC<{
  title: string; value: number | string;
  icon: React.ReactNode; color: string;
  bg: string; suffix?: string;
}> = ({ title, value, icon, color, bg, suffix }) => (
  <Card style={{
    borderRadius: 16, border: 'none',
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    background: bg, overflow: 'hidden',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Text style={{ color: '#6b7280', fontSize: 13, fontWeight: 500 }}>{title}</Text>
        <div style={{ fontSize: 28, fontWeight: 800, color, marginTop: 4 }}>
          {value}{suffix}
        </div>
      </div>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `${color}18`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 24,
        color,
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

// ─── Grid Card ─────────────────────────────────────────
const DepartmentGridCard: React.FC<{
  dept: Department;
  onEdit:   (d: Department) => void;
  onDelete: (d: Department) => void;
  onView:   (d: Department) => void;
}> = ({ dept, onEdit, onDelete, onView }) => {
  const empPercent = Math.min(Math.round((dept.employeeCount / 50) * 100), 100);

  const menuItems: MenuProps['items'] = [
    { key: 'view',   icon: <EyeOutlined />,    label: 'View Details', onClick: () => onView(dept) },
    { key: 'edit',   icon: <EditOutlined />,   label: 'Edit',         onClick: () => onEdit(dept) },
    { type: 'divider' },
    { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true, onClick: () => onDelete(dept) },
  ];

  return (
    <Card
      hoverable
      style={{
        borderRadius: 16, border: '1px solid #f1f5f9',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
        transition: 'all 0.25s',
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Card Header */}
      <div style={{
        background: `linear-gradient(135deg, ${getAvatarColor(dept.name)}dd, ${getAvatarColor(dept.name)}99)`,
        padding: '20px 20px 28px',
        borderRadius: '16px 16px 0 0',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 24,
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            <ApartmentOutlined style={{ color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge
              status={dept.active ? 'success' : 'error'}
              text={
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600 }}>
                  {dept.active ? 'Active' : 'Inactive'}
                </span>
              }
            />
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button
                size="small"
                icon={<MoreOutlined style={{ color: '#fff' }} />}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 8, color: '#fff',
                }}
              />
            </Dropdown>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, lineHeight: 1.3 }}>
            {dept.name}
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 12, marginTop: 3, fontFamily: 'monospace',
          }}>
            #{dept.code}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div style={{
        padding: '16px 20px 20px',
        marginTop: -10, background: '#fff',
        borderRadius: '12px 12px 16px 16px',
      }}>
        {/* Description */}
        {dept.description && (
          <Paragraph
            style={{ color: '#6b7280', fontSize: 13, marginBottom: 14 }}
            ellipsis={{ rows: 2 }}
          >
            {dept.description}
          </Paragraph>
        )}

        {/* Head */}
        {dept.headName && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 14, padding: '8px 12px',
            background: '#fafbfc', borderRadius: 10,
            border: '1px solid #f1f5f9',
          }}>
            <Avatar size={28}
              style={{ background: getAvatarColor(dept.headName), fontSize: 11, fontWeight: 700 }}>
              {getInitials(dept.headName)}
            </Avatar>
            <div>
              <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1 }}>Head</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{dept.headName}</div>
            </div>
            <CrownOutlined style={{ color: '#f59e0b', marginLeft: 'auto' }} />
          </div>
        )}

        {/* Employee Count */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <TeamOutlined style={{ color: '#6366f1', fontSize: 14 }} />
              <Text style={{ fontSize: 13, fontWeight: 500 }}>Employees</Text>
            </div>
            <Text style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>
              {dept.employeeCount}
            </Text>
          </div>
          <Progress
            percent={empPercent}
            strokeColor={getAvatarColor(dept.name)}
            trailColor="#f1f5f9"
            showInfo={false}
            style={{ margin: 0 }}
            size="small"
          />
        </div>

        {/* Footer */}
        <Divider style={{ margin: '12px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#9ca3af', fontSize: 11 }}>
            Created {formatDate(dept.createdAt)}
          </Text>
          {dept.parentDepartmentName && (
            <Tag style={{ borderRadius: 20, fontSize: 11, padding: '0 8px' }}>
              <FolderOutlined style={{ marginRight: 4 }} />
              {dept.parentDepartmentName}
            </Tag>
          )}
        </div>
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
const DepartmentList: React.FC = () => {
  const navigate        = useNavigate();
  const { isAdmin, isHR } = useAuth();

  // ── State ──────────────────────────────────────────
  const [departments,   setDepartments]   = useState<Department[]>([]);
  const [allDepts,      setAllDepts]      = useState<Department[]>([]);
  const [employees,     setEmployees]     = useState<{ id: number; fullName: string }[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [viewMode,      setViewMode]      = useState<ViewMode>('table');
  const [searchText,    setSearchText]    = useState('');
  const [filterActive,  setFilterActive]  = useState<boolean | null>(null);
  const [filterDrawer,  setFilterDrawer]  = useState(false);

  // Modals
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editDept,      setEditDept]      = useState<Department | null>(null);
  const [deleteDept,    setDeleteDept]    = useState<Department | null>(null);
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [viewDept,      setViewDept]      = useState<Department | null>(null);
  const [viewOpen,      setViewOpen]      = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const debouncedSearch = useDebounce(searchText, 400);

  // ── Form ───────────────────────────────────────────
  const {
    control, handleSubmit, reset, setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver:      yupResolver(departmentSchema) as any,
    defaultValues: { name: '', code: '', description: '', isActive: true },
  });

  // ── Fetch ──────────────────────────────────────────
  useEffect(() => {
    fetchDepartments();
    fetchEmployeeList();
  }, [currentPage, debouncedSearch, filterActive]);

  useEffect(() => {
    fetchAllDepts();
  }, []);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page:   currentPage - 1,
        size:   PAGE_SIZE,
        search: debouncedSearch || undefined,
      };
      if (filterActive !== null) params.isActive = filterActive;
      const res = await departmentApi.getAll(params);
      setDepartments(res.data?.content      || []);
      setTotalElements(res.data?.totalElements || 0);
    } catch {
      message.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterActive]);

  const fetchAllDepts = async () => {
    try {
      const res = await departmentApi.getAllList();
      setAllDepts(res.data || []);
    } catch { /* silent */ }
  };

  const fetchEmployeeList = async () => {
    try {
      const res = await employeeApi.getAll({ page: 0, size: 200 });
      const list = (res.data?.content || []).map((e: any) => ({
        id:       e.id,
        fullName: e.fullName || `${e.firstName} ${e.lastName}`,
      }));
      setEmployees(list);
    } catch { /* silent */ }
  };

  // ── Modal Open ─────────────────────────────────────
  const openAddModal = () => {
    setEditDept(null);
    reset({ name: '', code: '', description: '', isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditDept(dept);
    reset({
      name:                dept.name,
      code:                dept.code,
      description:         dept.description || '',
      headId:              dept.headId,
      parentDepartmentId:  dept.parentDepartmentId,
      isActive:            dept.active,
    });
    setModalOpen(true);
  };

  const openDeleteModal = (dept: Department) => {
    setDeleteDept(dept);
    setDeleteOpen(true);
  };

  const openViewDrawer = (dept: Department) => {
    setViewDept(dept);
    setViewOpen(true);
  };

  // ── Submit ─────────────────────────────────────────
  const onSubmit = async (data: FormValues) => {
    setSubmitLoading(true);
    try {
      if (editDept) {
        await dispatch(updateDepartment({id: editDept.id,data: data as DepartmentRequest})).unwrap();
        message.success('Department updated successfully');
      } else {
        await departmentApi.create(data as DepartmentRequest);
        message.success('Department created successfully');
      }
      setModalOpen(false);
      fetchDepartments();
      fetchAllDepts();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteDept) return;
    setDeleting(true);
    try {
      await departmentApi.delete(deleteDept.id);
      message.success('Department deleted successfully');
      setDeleteOpen(false);
      setDeleteDept(null);
      fetchDepartments();
      fetchAllDepts();
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  // ── Stats ──────────────────────────────────────────
  const totalEmployees  = departments.reduce((s, d) => s + d.employeeCount, 0);
  const activeDepts     = departments.filter((d) => d.active).length;
  const inactiveDepts   = departments.filter((d) => !d.active).length;
  const avgEmployees    = departments.length
    ? Math.round(totalEmployees / departments.length) : 0;

  // ── Table Columns ──────────────────────────────────
  const columns = [
    {
      title:     'Department',
      dataIndex: 'name',
      key:       'name',
      render: (name: string, record: Department) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: `${getAvatarColor(name)}22`,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18,
            color: getAvatarColor(name), flexShrink: 0,
          }}>
            <ApartmentOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>{name}</div>
            <div style={{
              fontSize: 11, color: '#9ca3af',
              fontFamily: 'monospace', marginTop: 1,
            }}>
              #{record.code}
            </div>
          </div>
        </div>
      ),
      sorter: (a: Department, b: Department) => a.name.localeCompare(b.name),
    },
    {
      title:     'Head',
      dataIndex: 'headName',
      key:       'headName',
      render: (name?: string) => name ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size={28}
            style={{ background: getAvatarColor(name), fontSize: 11, fontWeight: 700 }}>
            {getInitials(name)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
            <div style={{ fontSize: 11, color: '#f59e0b' }}>
              <CrownOutlined style={{ marginRight: 3 }} />Department Head
            </div>
          </div>
        </div>
      ) : (
        <Text style={{ color: '#9ca3af', fontSize: 13 }}>— Not Assigned</Text>
      ),
    },
    {
      title:     'Parent Dept',
      dataIndex: 'parentDepartmentName',
      key:       'parent',
      render: (name?: string) => name ? (
        <Tag icon={<FolderOutlined />} style={{ borderRadius: 20, padding: '2px 10px' }}>
          {name}
        </Tag>
      ) : (
        <Tag color="blue" style={{ borderRadius: 20, padding: '2px 10px' }}>
          Root
        </Tag>
      ),
    },
    {
      title:     'Employees',
      dataIndex: 'employeeCount',
      key:       'employeeCount',
      render: (count: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: count > 0 ? '#eef2ff' : '#f9fafb',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700,
            fontSize: 14, color: count > 0 ? '#6366f1' : '#9ca3af',
          }}>
            {count}
          </div>
          <Progress
            percent={Math.min(Math.round((count / 50) * 100), 100)}
            size="small"
            strokeColor="#6366f1"
            showInfo={false}
            style={{ width: 70, margin: 0 }}
          />
        </div>
      ),
      sorter: (a: Department, b: Department) => a.employeeCount - b.employeeCount,
    },
    {
      title:     'Status',
      dataIndex: 'active',
      key:       'active',
      render: (active: boolean) => (
        <Badge
          status={active ? 'success' : 'error'}
          text={
            <span style={{
              fontWeight: 600, fontSize: 13,
              color: active ? '#22c55e' : '#ef4444',
            }}>
              {active ? 'Active' : 'Inactive'}
            </span>
          }
        />
      ),
      filters: [
        { text: 'Active',   value: true  },
        { text: 'Inactive', value: false },
      ],
    },
    {
      title:     'Created',
      dataIndex: 'createdAt',
      key:       'createdAt',
      render: (d: string) => (
        <Text style={{ color: '#6b7280', fontSize: 13 }}>{formatDate(d)}</Text>
      ),
    },
    {
      title:  'Actions',
      key:    'actions',
      width:  120,
      render: (_: any, record: Department) => {
        const menuItems: MenuProps['items'] = [
          {
            key:     'view',
            icon:    <EyeOutlined />,
            label:   'View Details',
            onClick: () => openViewDrawer(record),
          },
          {
            key:     'edit',
            icon:    <EditOutlined />,
            label:   'Edit',
            onClick: () => openEditModal(record),
          },
          { type: 'divider' },
          {
            key:     'delete',
            icon:    <DeleteOutlined />,
            label:   'Delete',
            danger:  true,
            onClick: () => openDeleteModal(record),
          },
        ];
        return (
          <Space>
            <Tooltip title="View">
              <Button size="small" icon={<EyeOutlined />}
                onClick={() => openViewDrawer(record)}
                style={{ borderRadius: 8, color: '#6366f1', borderColor: '#6366f1' }} />
            </Tooltip>
            <Tooltip title="Edit">
              <Button size="small" icon={<EditOutlined />}
                onClick={() => openEditModal(record)}
                style={{ borderRadius: 8 }} />
            </Tooltip>
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button size="small" icon={<MoreOutlined />}
                style={{ borderRadius: 8 }} />
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
        title="Department Management"
        subtitle={`${totalElements} departments in your organization`}
        breadcrumbs={[
          { label: 'Dashboard',   path: ROUTES.DASHBOARD },
          { label: 'Departments' },
        ]}
        actions={
          <Space>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={fetchDepartments}
                style={{ borderRadius: 10, height: 40 }} />
            </Tooltip>
            <Button icon={<ExportOutlined />}
              style={{ borderRadius: 10, height: 40 }}>
              Export
            </Button>
            {isHR && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openAddModal}
                style={{
                  borderRadius: 10, height: 40,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: 'none', fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                }}
              >
                Add Department
              </Button>
            )}
          </Space>
        }
      />

      {/* ── Stats Row ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <StatCard
            title="Total Departments"
            value={totalElements}
            icon={<ApartmentOutlined />}
            color="#6366f1"
            bg="#fff"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Active"
            value={activeDepts}
            icon={<CheckCircleOutlined />}
            color="#22c55e"
            bg="#fff"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Inactive"
            value={inactiveDepts}
            icon={<CloseCircleOutlined />}
            color="#ef4444"
            bg="#fff"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Total Employees"
            value={totalEmployees}
            icon={<TeamOutlined />}
            color="#f59e0b"
            bg="#fff"
          />
        </Col>
      </Row>

      {/* ── Main Card ── */}
      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12,
          marginBottom: 20,
        }}>
          {/* Search */}
          <Input
            placeholder="Search departments..."
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
            style={{ width: 280, borderRadius: 10, height: 40 }}
            allowClear
          />

          {/* Right Toolbar */}
          <Space>
            {/* Filter */}
            <Select
              value={filterActive}
              onChange={(v) => { setFilterActive(v); setCurrentPage(1); }}
              style={{ width: 140, borderRadius: 10 }}
              placeholder="All Status"
              allowClear
            >
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>

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
                    color:      viewMode === 'table' ? '#6366f1' : '#6b7280',
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
                    color:      viewMode === 'grid' ? '#6366f1' : '#6b7280',
                  }}
                />
              </Tooltip>
            </div>
          </Space>
        </div>

        {/* ── TABLE VIEW ── */}
        {viewMode === 'table' && (
          <Table
            dataSource={departments}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              current:   currentPage,
              pageSize:  PAGE_SIZE,
              total:     totalElements,
              onChange:  (p) => setCurrentPage(p),
              showSizeChanger: false,
              showTotal: (t) => (
                <Text style={{ color: '#6b7280', fontSize: 13 }}>
                  Total <strong>{t}</strong> departments
                </Text>
              ),
              style: { marginTop: 16 },
            }}
            style={{ borderRadius: 12, overflow: 'hidden' }}
            size="middle"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span style={{ color: '#9ca3af' }}>
                      {searchText ? 'No departments match your search' : 'No departments found'}
                    </span>
                  }
                >
                  {!searchText && isHR && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}
                      style={{ borderRadius: 10, background: '#6366f1', border: 'none' }}>
                      Add First Department
                    </Button>
                  )}
                </Empty>
              ),
            }}
            rowClassName={() => 'dept-table-row'}
          />
        )}

        {/* ── GRID VIEW ── */}
        {viewMode === 'grid' && (
          loading ? (
            <LoadingSpinner tip="Loading departments..." />
          ) : departments.length === 0 ? (
            <Empty description="No departments found" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              {isHR && (
                <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}
                  style={{ borderRadius: 10, background: '#6366f1', border: 'none' }}>
                  Add Department
                </Button>
              )}
            </Empty>
          ) : (
            <Row gutter={[16, 16]}>
              {departments.map((dept) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={dept.id}>
                  <DepartmentGridCard
                    dept={dept}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    onView={openViewDrawer}
                  />
                </Col>
              ))}
            </Row>
          )
        )}
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
              <ApartmentOutlined style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {editDept ? 'Edit Department' : 'Add New Department'}
              </div>
              <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 400 }}>
                {editDept ? 'Update department information' : 'Fill in details to create a new department'}
              </div>
            </div>
          </div>
        }
        onCancel={() => { setModalOpen(false); setEditDept(null); }}
        footer={null}
        width={600}
        centered
        destroyOnClose
      >
        <Divider style={{ margin: '12px 0 20px' }} />
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)} size="large">
          <Row gutter={[16, 0]}>
            {/* Name */}
            <Col xs={24} md={16}>
              <Form.Item
                label={<span style={labelStyle}>Department Name <span style={reqStyle}>*</span></span>}
                validateStatus={errors.name ? 'error' : ''}
                help={errors.name?.message}
              >
                <Controller name="name" control={control} render={({ field }) => (
                  <Input
                    {...field}
                    prefix={<ApartmentOutlined style={{ color: '#9ca3af' }} />}
                    placeholder="e.g. Engineering"
                    style={{ borderRadius: 10 }}
                  />
                )} />
              </Form.Item>
            </Col>

            {/* Code */}
            <Col xs={24} md={8}>
              <Form.Item
                label={<span style={labelStyle}>Code <span style={reqStyle}>*</span></span>}
                validateStatus={errors.code ? 'error' : ''}
                help={errors.code?.message}
              >
                <Controller name="code" control={control} render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="ENG"
                    maxLength={10}
                    style={{ borderRadius: 10, fontFamily: 'monospace', textTransform: 'uppercase' }}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                )} />
              </Form.Item>
            </Col>

            {/* Description */}
            <Col xs={24}>
              <Form.Item label={<span style={labelStyle}>Description</span>}>
                <Controller name="description" control={control} render={({ field }) => (
                  <TextArea
                    {...field}
                    placeholder="Brief description of the department..."
                    rows={3}
                    maxLength={500}
                    showCount
                    style={{ borderRadius: 10 }}
                  />
                )} />
              </Form.Item>
            </Col>

            {/* Department Head */}
            <Col xs={24} md={12}>
              <Form.Item label={<span style={labelStyle}>Department Head</span>}>
                <Controller name="headId" control={control} render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Assign head"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                  >
                    {employees.map((e) => (
                      <Option key={e.id} value={e.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar size={20}
                            style={{ background: getAvatarColor(e.fullName), fontSize: 9, fontWeight: 700 }}>
                            {getInitials(e.fullName)}
                          </Avatar>
                          {e.fullName}
                        </div>
                      </Option>
                    ))}
                  </Select>
                )} />
              </Form.Item>
            </Col>

            {/* Parent Department */}
            <Col xs={24} md={12}>
              <Form.Item label={<span style={labelStyle}>Parent Department</span>}>
                <Controller name="parentDepartmentId" control={control} render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select parent (optional)"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                  >
                    {allDepts
                      .filter((d) => !editDept || d.id !== editDept.id)
                      .map((d) => (
                        <Option key={d.id} value={d.id}>
                          <FolderOutlined style={{ marginRight: 6, color: '#6b7280' }} />
                          {d.name}
                        </Option>
                      ))}
                  </Select>
                )} />
              </Form.Item>
            </Col>

            {/* Is Active */}
            <Col xs={24}>
              <Form.Item label={<span style={labelStyle}>Status</span>}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', background: '#fafbfc',
                  borderRadius: 10, border: '1px solid #f1f5f9',
                }}>
                  <Controller name="isActive" control={control} render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      checkedChildren="Active"
                      unCheckedChildren="Inactive"
                      style={{ background: field.value ? '#22c55e' : '#e5e7eb' }}
                    />
                  )} />
                  <div>
                    <Text style={{ fontWeight: 600, fontSize: 13 }}>Department Status</Text>
                    <br />
                    <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                      Inactive departments won't appear in employee assignments
                    </Text>
                  </div>
                </div>
              </Form.Item>
            </Col>
          </Row>

          {/* Modal Footer */}
          <Divider style={{ margin: '8px 0 16px' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={() => { setModalOpen(false); setEditDept(null); }}
              style={{ borderRadius: 10, height: 42, paddingInline: 20 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              style={{
                borderRadius: 10, height: 42, paddingInline: 28,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border: 'none', fontWeight: 600,
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              }}
            >
              {submitLoading
                ? (editDept ? 'Updating...' : 'Creating...')
                : (editDept ? 'Update Department' : 'Create Department')}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ══════════════════════════════════════════════
          VIEW DRAWER
      ══════════════════════════════════════════════ */}
      <Drawer
        open={viewOpen}
        onClose={() => { setViewOpen(false); setViewDept(null); }}
        width={420}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ApartmentOutlined style={{ color: '#6366f1' }} />
            <span style={{ fontWeight: 700 }}>Department Details</span>
          </div>
        }
        extra={
          isHR && viewDept && (
            <Button
              icon={<EditOutlined />}
              type="primary"
              onClick={() => { setViewOpen(false); openEditModal(viewDept); }}
              style={{ borderRadius: 8, background: '#6366f1', border: 'none' }}
            >
              Edit
            </Button>
          )
        }
      >
        {viewDept && (
          <div>
            {/* Dept Header */}
            <div style={{
              background: `linear-gradient(135deg,${getAvatarColor(viewDept.name)}cc,${getAvatarColor(viewDept.name)}88)`,
              borderRadius: 16, padding: '24px 20px',
              marginBottom: 20, textAlign: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: 'rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 30,
                margin: '0 auto 12px',
                backdropFilter: 'blur(8px)',
              }}>
                <ApartmentOutlined style={{ color: '#fff' }} />
              </div>
              <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>{viewDept.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: 'monospace', marginTop: 4 }}>
                #{viewDept.code}
              </div>
              <div style={{ marginTop: 10 }}>
                <Badge
                  status={viewDept.active ? 'success' : 'error'}
                  text={
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600 }}>
                      {viewDept.active ? '● Active' : '● Inactive'}
                    </span>
                  }
                />
              </div>
            </div>

            {/* Description */}
            {viewDept.description && (
              <Card style={{ borderRadius: 12, marginBottom: 16, border: '1px solid #f1f5f9' }}
                bodyStyle={{ padding: '14px 16px' }}>
                <Text style={{ color: '#6b7280', fontSize: 13 }}>{viewDept.description}</Text>
              </Card>
            )}

            {/* Details */}
            {[
              {
                icon: <CrownOutlined style={{ color: '#f59e0b' }} />,
                label: 'Department Head',
                value: viewDept.headName || 'Not Assigned',
              },
              {
                icon: <FolderOutlined style={{ color: '#6366f1' }} />,
                label: 'Parent Department',
                value: viewDept.parentDepartmentName || 'Root Department',
              },
              {
                icon: <TeamOutlined style={{ color: '#22c55e' }} />,
                label: 'Total Employees',
                value: `${viewDept.employeeCount} employees`,
              },
              {
                icon: <CalendarOutlined style={{ color: '#6b7280' }} />,
                label: 'Created On',
                value: formatDate(viewDept.createdAt),
              },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 0', borderBottom: '1px solid #f8fafc',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: '#f8fafc', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>{item.label}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{item.value}</div>
                </div>
              </div>
            ))}

            {/* Employee Progress */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontWeight: 600, fontSize: 13 }}>Department Capacity</Text>
                <Text style={{ color: '#6366f1', fontWeight: 700 }}>
                  {viewDept.employeeCount} / 50
                </Text>
              </div>
              <Progress
                percent={Math.min(Math.round((viewDept.employeeCount / 50) * 100), 100)}
                strokeColor={getAvatarColor(viewDept.name)}
                trailColor="#f1f5f9"
              />
            </div>

            {/* Actions */}
            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              {isHR && (
                <>
                  <Button block icon={<EditOutlined />}
                    onClick={() => { setViewOpen(false); openEditModal(viewDept); }}
                    style={{ borderRadius: 10, height: 42 }}>
                    Edit
                  </Button>
                  <Button block danger icon={<DeleteOutlined />}
                    onClick={() => { setViewOpen(false); openDeleteModal(viewDept); }}
                    style={{ borderRadius: 10, height: 42 }}>
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* ══════════════════════════════════════════════
          DELETE CONFIRM
      ══════════════════════════════════════════════ */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Department"
        message={
          deleteDept
            ? `Are you sure you want to delete "${deleteDept.name}"? All related data will be affected.`
            : ''
        }
        type="danger"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteOpen(false); setDeleteDept(null); }}
      />
    </div>
  );
};

// ─── Shared Styles ─────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontWeight: 500,
  fontSize:   13,
  color:      '#374151',
};

const reqStyle: React.CSSProperties = {
  color: '#ef4444',
};

export default DepartmentList;