import React, { useState } from 'react';
import {
  Card, Tabs, Form, Input, Button, Switch, Select,
  Typography, Row, Col, Avatar, Upload, Divider,
  Table, Tag, Modal, Space, Badge, Alert, Tooltip,
  InputNumber, ColorPicker, TimePicker, message,
  List, Descriptions, Progress, Steps, Radio,Result,
  Slider, notification,
} from 'antd';
import {
  SettingOutlined, UserOutlined, BellOutlined,
  SafetyCertificateOutlined, TeamOutlined, GlobalOutlined,
  BgColorsOutlined, DatabaseOutlined, MailOutlined,
  SaveOutlined, EditOutlined, DeleteOutlined,
  PlusOutlined, EyeOutlined, EyeInvisibleOutlined,
  CheckCircleOutlined, LockOutlined, KeyOutlined,
  ClockCircleOutlined, MobileOutlined, DesktopOutlined,
  CameraOutlined, UploadOutlined, ReloadOutlined,
  CloudUploadOutlined, PrinterOutlined, ExportOutlined,
  InfoCircleOutlined, WarningOutlined, ThunderboltOutlined,
  ApartmentOutlined, DollarOutlined, CalendarOutlined,CloseCircleOutlined,
  FileTextOutlined, ApiOutlined, MonitorOutlined,PercentageOutlined,
  SafetyOutlined, BankOutlined, PhoneOutlined,SendOutlined
} from '@ant-design/icons';
import { useForm, Controller }   from 'react-hook-form';
import { useAuth }               from '../../hooks/useAuth';
import { getInitials, getAvatarColor } from '../../utils/helpers';
import PageHeader                from '../../components/common/PageHeader';
import { ROUTES, ROLE_LABELS, ROLE_COLORS } from '../../constants';

const { Text, Title, Paragraph } = Typography;
const { TextArea }               = Input;
const { Option }                 = Select;

// ─── Types ─────────────────────────────────────────────
interface CompanySettings {
  name:        string;
  email:       string;
  phone:       string;
  website:     string;
  address:     string;
  city:        string;
  state:       string;
  country:     string;
  pincode:     string;
  gstin:       string;
  pan:         string;
  timezone:    string;
  currency:    string;
  dateFormat:  string;
  fiscalYear:  string;
}

interface NotificationSettings {
  emailNotifications:    boolean;
  leaveApproval:         boolean;
  attendanceAlert:       boolean;
  payrollProcessed:      boolean;
  birthdayReminder:      boolean;
  documentExpiry:        boolean;
  systemAlerts:          boolean;
  weeklyReport:          boolean;
  browserNotifications:  boolean;
  smsNotifications:      boolean;
}

interface SecuritySettings {
  twoFactorAuth:     boolean;
  sessionTimeout:    number;
  passwordExpiry:    number;
  loginAttempts:     number;
  ipWhitelist:       boolean;
  auditLog:          boolean;
  dataEncryption:    boolean;
  passwordStrength:  string;
}

interface LeaveSettings {
  annualLeave:      number;
  sickLeave:        number;
  casualLeave:      number;
  maternityLeave:   number;
  paternityLeave:   number;
  carryForward:     boolean;
  maxCarryForward:  number;
  leaveApproval:    string;
  weekends:         string[];
  holidays:         number;
}

interface PayrollSettings {
  payDay:        number;
  currency:      string;
  pfContribution: number;
  esiContribution: number;
  tdsEnabled:    boolean;
  autoProcess:   boolean;
  payslipEmail:  boolean;
  overtime:      boolean;
  overtimeRate:  number;
}

// ─── Mock Roles & Permissions ──────────────────────────
const mockRoles = [
  {
    id: 1, name: 'Super Admin', color: 'red',
    permissions: ['all'],
    users: 1, description: 'Full system access',
  },
  {
    id: 2, name: 'HR Admin', color: 'orange',
    permissions: ['employees', 'attendance', 'leave', 'payroll', 'reports'],
    users: 2, description: 'HR department full access',
  },
  {
    id: 3, name: 'HR Manager', color: 'blue',
    permissions: ['employees', 'attendance', 'leave', 'reports'],
    users: 5, description: 'HR management access',
  },
  {
    id: 4, name: 'Employee', color: 'green',
    permissions: ['self-attendance', 'self-leave', 'self-payroll'],
    users: 240, description: 'Employee self-service access',
  },
];

// ─── Mock Audit Logs ───────────────────────────────────
const mockAuditLogs = [
  { id:1, user:'superadmin', action:'Updated company settings',  module:'Settings',  ip:'192.168.1.1', time:'2024-03-25 09:15:32', type:'update' },
  { id:2, user:'hr_admin',   action:'Approved leave request #45', module:'Leave',    ip:'192.168.1.2', time:'2024-03-25 10:22:14', type:'approve'},
  { id:3, user:'superadmin', action:'Added new employee',         module:'Employee', ip:'192.168.1.1', time:'2024-03-24 14:35:00', type:'create' },
  { id:4, user:'hr_manager', action:'Processed March payroll',    module:'Payroll',  ip:'192.168.1.3', time:'2024-03-24 11:00:45', type:'process'},
  { id:5, user:'hr_admin',   action:'Deleted department',         module:'Dept',     ip:'192.168.1.2', time:'2024-03-23 16:20:10', type:'delete' },
];

const auditTypeColors: Record<string, string> = {
  update:  'blue',
  approve: 'green',
  create:  'cyan',
  process: 'purple',
  delete:  'red',
};

// ─── Setting Section Wrapper ───────────────────────────
const SettingSection: React.FC<{
  title: string; subtitle?: string;
  icon: React.ReactNode; children: React.ReactNode;
  color?: string;
}> = ({ title, subtitle, icon, children, color = '#6366f1' }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      marginBottom: 20, padding: '14px 18px',
      background: `${color}08`,
      borderRadius: 12,
      border: `1px solid ${color}20`,
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: `${color}15`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 18, color,
      }}>
        {icon}
      </div>
      <div>
        <Text style={{ fontWeight: 700, fontSize: 15, color: '#1f2937', display: 'block' }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ color: '#6b7280', fontSize: 12 }}>{subtitle}</Text>
        )}
      </div>
    </div>
    {children}
  </div>
);

// ─── Toggle Row ────────────────────────────────────────
const ToggleRow: React.FC<{
  label: string; description?: string;
  value: boolean; onChange: (v: boolean) => void;
  icon?: React.ReactNode; badge?: string;
  color?: string;
}> = ({ label, description, value, onChange, icon, badge, color = '#6366f1' }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '14px 16px',
    background: '#fafbfc', borderRadius: 10,
    border: '1px solid #f1f5f9', marginBottom: 8,
    transition: 'all 0.2s',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {icon && (
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: value ? `${color}15` : '#f1f5f9',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: value ? color : '#9ca3af',
          fontSize: 15, transition: 'all 0.2s',
        }}>
          {icon}
        </div>
      )}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>{label}</Text>
          {badge && (
            <Tag color="blue" style={{ borderRadius: 20, fontSize: 10, padding: '0 6px' }}>
              {badge}
            </Tag>
          )}
        </div>
        {description && (
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>{description}</Text>
        )}
      </div>
    </div>
    <Switch
      checked={value}
      onChange={onChange}
      style={{ background: value ? color : '#e5e7eb' }}
    />
  </div>
);

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
const Settings: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // ── State ──────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState('company');
  const [saving,       setSaving]       = useState(false);
  const [logoUrl,      setLogoUrl]      = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [deleteRoleOpen,  setDeleteRoleOpen]  = useState(false);
  const [selectedRole,    setSelectedRole]    = useState<any>(null);
  const [testEmailLoading, setTestEmailLoading] = useState(false);

  // ── Company Settings ───────────────────────────────
  const [company, setCompany] = useState<CompanySettings>({
    name:       'TechCorp Solutions Pvt. Ltd.',
    email:      'hr@techcorp.com',
    phone:      '+91 22 1234 5678',
    website:    'https://techcorp.com',
    address:    '123 Business Park, Andheri East',
    city:       'Mumbai',
    state:      'Maharashtra',
    country:    'India',
    pincode:    '400069',
    gstin:      '27AABCT1234A1Z5',
    pan:        'AABCT1234A',
    timezone:   'Asia/Kolkata',
    currency:   'INR',
    dateFormat: 'DD/MM/YYYY',
    fiscalYear: 'April-March',
  });

  // ── Notification Settings ──────────────────────────
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications:   true,
    leaveApproval:        true,
    attendanceAlert:      true,
    payrollProcessed:     true,
    birthdayReminder:     true,
    documentExpiry:       false,
    systemAlerts:         true,
    weeklyReport:         false,
    browserNotifications: true,
    smsNotifications:     false,
  });

  // ── Security Settings ──────────────────────────────
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth:    false,
    sessionTimeout:   30,
    passwordExpiry:   90,
    loginAttempts:    5,
    ipWhitelist:      false,
    auditLog:         true,
    dataEncryption:   true,
    passwordStrength: 'strong',
  });

  // ── Leave Settings ─────────────────────────────────
  const [leaveSettings, setLeaveSettings] = useState<LeaveSettings>({
    annualLeave:     18,
    sickLeave:       12,
    casualLeave:     6,
    maternityLeave:  90,
    paternityLeave:  15,
    carryForward:    true,
    maxCarryForward: 5,
    leaveApproval:   'manager',
    weekends:        ['Saturday', 'Sunday'],
    holidays:        14,
  });

  // ── Payroll Settings ───────────────────────────────
  const [payroll, setPayrollSettings] = useState<PayrollSettings>({
    payDay:          28,
    currency:        'INR',
    pfContribution:  12,
    esiContribution: 0.75,
    tdsEnabled:      true,
    autoProcess:     false,
    payslipEmail:    true,
    overtime:        true,
    overtimeRate:    1.5,
  });

  // ── Save Handler ───────────────────────────────────
  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      message.success(`${section} settings saved successfully!`);
    } catch {
      message.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // ── Test Email ─────────────────────────────────────
  const handleTestEmail = async () => {
    setTestEmailLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setTestEmailLoading(false);
    message.success('Test email sent successfully!');
  };

  // ── Save Button ────────────────────────────────────
  const SaveButton: React.FC<{ section: string }> = ({ section }) => (
    <div style={{
      display: 'flex', justifyContent: 'flex-end',
      paddingTop: 16, borderTop: '1px solid #f1f5f9', marginTop: 8,
    }}>
      <Space>
        <Button style={{ borderRadius: 10, height: 42 }}>
          Reset to Default
        </Button>
        <Button
          type="primary" icon={<SaveOutlined />}
          loading={saving}
          onClick={() => handleSave(section)}
          style={{
            borderRadius: 10, height: 42, paddingInline: 28,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            border: 'none', fontWeight: 600,
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Space>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // TAB: COMPANY
  // ═══════════════════════════════════════════════════
  const CompanyTab = () => (
    <div>
      {/* Logo Section */}
      <SettingSection
        title="POTLA TECH SOLUTIONS"
        subtitle="file:///C:/Users/Hi/OneDrive/Desktop/potla%20logo.jpeg"
        icon={<BgColorsOutlined />}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 24 }}>
          {/* Logo Preview */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 100, height: 100, borderRadius: 20,
              background: logoUrl ? 'transparent' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', border: '3px solid #f1f5f9',
              boxShadow: '0 4px 14px rgba(99,102,241,0.2)',
            }}>
              {logoUrl
                ? <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Text style={{ color: '#fff', fontSize: 28, fontWeight: 900 }}>HR</Text>
              }
            </div>
            <Upload
              showUploadList={false}
              accept="image/*"
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = () => setLogoUrl(reader.result as string);
                reader.readAsDataURL(file);
                return false;
              }}
            >
              <div style={{
                position: 'absolute', bottom: -4, right: -4,
                width: 30, height: 30, borderRadius: '50%',
                background: '#6366f1', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '3px solid #fff',
                boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
              }}>
                <CameraOutlined style={{ color: '#fff', fontSize: 12 }} />
              </div>
            </Upload>
          </div>
          <div style={{ flex: 1 }}>
            <Text style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>
              Company Logo
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 13, display: 'block', marginBottom: 12 }}>
              Upload a PNG, JPG or SVG file. Recommended size: 200×200px
            </Text>
            <Upload
              showUploadList={false}
              accept="image/*"
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = () => setLogoUrl(reader.result as string);
                reader.readAsDataURL(file);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />} style={{ borderRadius: 10 }}>
                Upload Logo
              </Button>
            </Upload>
          </div>
        </div>
      </SettingSection>

      {/* Basic Info */}
      <SettingSection
        title="Company Information"
        subtitle="Basic company details used across the system"
        icon={<BankOutlined />}
        color="#22c55e"
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item label={<span style={labelStyle}>Company Name</span>}>
              <Input
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                prefix={<BankOutlined style={{ color: '#9ca3af' }} />}
                style={{ borderRadius: 10, height: 44 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<span style={labelStyle}>Official Email</span>}>
              <Input
                value={company.email}
                onChange={(e) => setCompany({ ...company, email: e.target.value })}
                prefix={<MailOutlined style={{ color: '#9ca3af' }} />}
                style={{ borderRadius: 10, height: 44 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<span style={labelStyle}>Phone Number</span>}>
              <Input
                value={company.phone}
                onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                prefix={<PhoneOutlined style={{ color: '#9ca3af' }} />}
                style={{ borderRadius: 10, height: 44 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<span style={labelStyle}>Website</span>}>
              <Input
                value={company.website}
                onChange={(e) => setCompany({ ...company, website: e.target.value })}
                prefix={<GlobalOutlined style={{ color: '#9ca3af' }} />}
                style={{ borderRadius: 10, height: 44 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label={<span style={labelStyle}>Address</span>}>
              <TextArea
                value={company.address}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                rows={2}
                style={{ borderRadius: 10 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span style={labelStyle}>City</span>}>
              <Input
                value={company.city}
                onChange={(e) => setCompany({ ...company, city: e.target.value })}
                style={{ borderRadius: 10, height: 44 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span style={labelStyle}>State</span>}>
              <Input
                value={company.state}
                onChange={(e) => setCompany({ ...company, state: e.target.value })}
                style={{ borderRadius: 10, height: 44 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span style={labelStyle}>PIN Code</span>}>
              <Input
                value={company.pincode}
                onChange={(e) => setCompany({ ...company, pincode: e.target.value })}
                style={{ borderRadius: 10, height: 44 }}
                maxLength={6}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<span style={labelStyle}>GSTIN</span>}>
              <Input
                value={company.gstin}
                onChange={(e) => setCompany({ ...company, gstin: e.target.value })}
                style={{ borderRadius: 10, height: 44 }}
                maxLength={15}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<span style={labelStyle}>PAN Number</span>}>
              <Input
                value={company.pan}
                onChange={(e) => setCompany({ ...company, pan: e.target.value })}
                style={{ borderRadius: 10, height: 44 }}
                maxLength={10}
              />
            </Form.Item>
          </Col>
        </Row>
      </SettingSection>

      {/* System Settings */}
      <SettingSection
        title="Regional & System Preferences"
        subtitle="Configure timezone, currency and date formats"
        icon={<GlobalOutlined />}
        color="#f59e0b"
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} md={6}>
            <Form.Item label={<span style={labelStyle}>Timezone</span>}>
              <Select
                value={company.timezone}
                onChange={(v) => setCompany({ ...company, timezone: v })}
                style={{ width: '100%' }}
              >
                <Option value="Asia/Kolkata">IST (UTC+5:30)</Option>
                <Option value="America/New_York">EST (UTC-5)</Option>
                <Option value="Europe/London">GMT (UTC+0)</Option>
                <Option value="Asia/Dubai">GST (UTC+4)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label={<span style={labelStyle}>Currency</span>}>
              <Select
                value={company.currency}
                onChange={(v) => setCompany({ ...company, currency: v })}
                style={{ width: '100%' }}
              >
                <Option value="INR">₹ INR - Indian Rupee</Option>
                <Option value="USD">$ USD - US Dollar</Option>
                <Option value="EUR">€ EUR - Euro</Option>
                <Option value="GBP">£ GBP - British Pound</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label={<span style={labelStyle}>Date Format</span>}>
              <Select
                value={company.dateFormat}
                onChange={(v) => setCompany({ ...company, dateFormat: v })}
                style={{ width: '100%' }}
              >
                <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                <Option value="DD MMM YYYY">DD MMM YYYY</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label={<span style={labelStyle}>Fiscal Year</span>}>
              <Select
                value={company.fiscalYear}
                onChange={(v) => setCompany({ ...company, fiscalYear: v })}
                style={{ width: '100%' }}
              >
                <Option value="April-March">April – March</Option>
                <Option value="January-December">January – December</Option>
                <Option value="July-June">July – June</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </SettingSection>
      <SaveButton section="Company" />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // TAB: NOTIFICATIONS
  // ═══════════════════════════════════════════════════
  const NotificationsTab = () => (
    <div>
      {/* Email Notifications */}
      <SettingSection
        title="Email Notifications"
        subtitle="Control which events trigger email alerts"
        icon={<MailOutlined />}
      >
        {[
          { key: 'emailNotifications',  label: 'Enable Email Notifications', description: 'Master toggle for all email notifications', badge: 'Master', icon: <MailOutlined />    },
          { key: 'leaveApproval',       label: 'Leave Approval Alerts',      description: 'Get notified when leave is approved/rejected',  icon: <CalendarOutlined />  },
          { key: 'attendanceAlert',     label: 'Attendance Alerts',          description: 'Daily attendance summary and alerts',            icon: <ClockCircleOutlined />},
          { key: 'payrollProcessed',    label: 'Payroll Notifications',      description: 'Alert when payroll is processed or paid',        icon: <DollarOutlined />    },
          { key: 'birthdayReminder',    label: 'Birthday Reminders',         description: 'Employee birthday notifications',                icon: <CalendarOutlined />  },
          { key: 'weeklyReport',        label: 'Weekly Reports',             description: 'Automated weekly HR summary reports',            icon: <FileTextOutlined />  },
        ].map((item) => (
          <ToggleRow
            key={item.key}
            label={item.label}
            description={item.description}
            value={notifications[item.key as keyof NotificationSettings] as boolean}
            onChange={(v) => setNotifications({ ...notifications, [item.key]: v })}
            icon={item.icon}
            badge={item.badge}
          />
        ))}

        {/* Test Email */}
        <div style={{
          marginTop: 16, padding: '14px 16px',
          background: '#f0f9ff', borderRadius: 10,
          border: '1px solid #bae6fd',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <Text style={{ fontWeight: 600, color: '#0369a1' }}>Test Email Configuration</Text>
            <br />
            <Text style={{ color: '#0ea5e9', fontSize: 12 }}>Send a test email to verify your settings</Text>
          </div>
          <Button
            icon={<SendOutlined />}
            loading={testEmailLoading}
            onClick={handleTestEmail}
            style={{ borderRadius: 10, color: '#0ea5e9', borderColor: '#0ea5e9' }}
          >
            Send Test Email
          </Button>
        </div>
      </SettingSection>

      {/* System Notifications */}
      <SettingSection
        title="System & Push Notifications"
        subtitle="In-app and browser notification settings"
        icon={<BellOutlined />}
        color="#f59e0b"
      >
        {[
          { key: 'systemAlerts',        label: 'System Alerts',          description: 'Critical system notifications',           icon: <WarningOutlined />   },
          { key: 'documentExpiry',      label: 'Document Expiry Alerts', description: 'Alert before documents expire',           icon: <FileTextOutlined />  },
          { key: 'browserNotifications',label: 'Browser Notifications',  description: 'Desktop browser push notifications',      icon: <DesktopOutlined />,  badge: 'Beta' },
          { key: 'smsNotifications',    label: 'SMS Notifications',      description: 'Mobile SMS for critical alerts',          icon: <MobileOutlined />,   badge: 'Premium' },
        ].map((item) => (
          <ToggleRow
            key={item.key}
            label={item.label}
            description={item.description}
            value={notifications[item.key as keyof NotificationSettings] as boolean}
            onChange={(v) => setNotifications({ ...notifications, [item.key]: v })}
            icon={item.icon}
            badge={item.badge}
            color="#f59e0b"
          />
        ))}
      </SettingSection>
      <SaveButton section="Notification" />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // TAB: SECURITY
  // ═══════════════════════════════════════════════════
  const SecurityTab = () => (
    <div>
      {/* Authentication */}
      <SettingSection
        title="Authentication & Access"
        subtitle="Control login security and session management"
        icon={<LockOutlined />}
        color="#ef4444"
      >
        {/* 2FA Toggle */}
        <ToggleRow
          label="Two-Factor Authentication (2FA)"
          description="Add an extra layer of security to all accounts"
          value={security.twoFactorAuth}
          onChange={(v) => setSecurity({ ...security, twoFactorAuth: v })}
          icon={<SafetyOutlined />}
          badge="Recommended"
          color="#ef4444"
        />
        <ToggleRow
          label="IP Whitelist"
          description="Restrict logins to approved IP addresses only"
          value={security.ipWhitelist}
          onChange={(v) => setSecurity({ ...security, ipWhitelist: v })}
          icon={<SafetyCertificateOutlined />}
          color="#ef4444"
        />

        <Row gutter={[16, 0]} style={{ marginTop: 16 }}>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span style={labelStyle}>Session Timeout (minutes)</span>}
              tooltip="Auto logout after inactivity"
            >
              <InputNumber
                value={security.sessionTimeout}
                onChange={(v) => setSecurity({ ...security, sessionTimeout: v || 30 })}
                min={5} max={480} step={5}
                style={{ width: '100%', borderRadius: 10 }}
                addonAfter="min"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span style={labelStyle}>Password Expiry (days)</span>}
              tooltip="Force password change after N days"
            >
              <InputNumber
                value={security.passwordExpiry}
                onChange={(v) => setSecurity({ ...security, passwordExpiry: v || 90 })}
                min={30} max={365} step={30}
                style={{ width: '100%', borderRadius: 10 }}
                addonAfter="days"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span style={labelStyle}>Max Login Attempts</span>}
              tooltip="Lock account after N failed attempts"
            >
              <InputNumber
                value={security.loginAttempts}
                onChange={(v) => setSecurity({ ...security, loginAttempts: v || 5 })}
                min={3} max={10}
                style={{ width: '100%', borderRadius: 10 }}
                addonAfter="tries"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<span style={labelStyle}>Password Strength Policy</span>}>
              <Radio.Group
                value={security.passwordStrength}
                onChange={(e) => setSecurity({ ...security, passwordStrength: e.target.value })}
                style={{ width: '100%' }}
              >
                <Row gutter={[8, 8]}>
                  {[
                    { val: 'basic',  label: 'Basic',  desc: '8+ chars',              color: '#22c55e' },
                    { val: 'medium', label: 'Medium', desc: '8+ chars + numbers',    color: '#f59e0b' },
                    { val: 'strong', label: 'Strong', desc: '8+ chars + upper + special', color: '#ef4444' },
                  ].map((opt) => (
                    <Col span={8} key={opt.val}>
                      <div style={{
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                        border: `2px solid ${security.passwordStrength === opt.val ? opt.color : '#e5e7eb'}`,
                        background: security.passwordStrength === opt.val ? `${opt.color}12` : '#fff',
                        transition: 'all 0.2s',
                      }}
                        onClick={() => setSecurity({ ...security, passwordStrength: opt.val })}
                      >
                        <div style={{ fontWeight: 700, color: opt.color, fontSize: 14 }}>{opt.label}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{opt.desc}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
      </SettingSection>

      {/* Data & Audit */}
      <SettingSection
        title="Data & Audit"
        subtitle="System data protection and activity logging"
        icon={<DatabaseOutlined />}
        color="#6366f1"
      >
        <ToggleRow
          label="Audit Logging"
          description="Track all user actions and system events"
          value={security.auditLog}
          onChange={(v) => setSecurity({ ...security, auditLog: v })}
          icon={<FileTextOutlined />}
        />
        <ToggleRow
          label="Data Encryption"
          description="Encrypt sensitive data at rest and in transit"
          value={security.dataEncryption}
          onChange={(v) => setSecurity({ ...security, dataEncryption: v })}
          icon={<LockOutlined />}
          badge="Always On"
        />

        {/* Audit Log Table */}
        {security.auditLog && (
          <div style={{ marginTop: 16 }}>
            <Text style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 12 }}>
              Recent Audit Logs
            </Text>
            <Table
              dataSource={mockAuditLogs}
              rowKey="id"
              pagination={false}
              size="small"
              style={{ borderRadius: 12, overflow: 'hidden' }}
              columns={[
                {
                  title: 'User', dataIndex: 'user',
                  render: (v: string) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar size={22}
                        style={{ background: getAvatarColor(v), fontSize: 9, fontWeight: 700 }}>
                        {getInitials(v)}
                      </Avatar>
                      <Text style={{ fontSize: 13 }}>{v}</Text>
                    </div>
                  ),
                },
                {
                  title: 'Action', dataIndex: 'action',
                  render: (v: string, r: any) => (
                    <div>
                      <Tag color={auditTypeColors[r.type] || 'default'}
                        style={{ borderRadius: 20, fontSize: 11, marginBottom: 2 }}>
                        {r.type}
                      </Tag>
                      <div style={{ fontSize: 12, color: '#374151' }}>{v}</div>
                    </div>
                  ),
                },
                { title: 'Module', dataIndex: 'module',
                  render: (v: string) => <Tag style={{ borderRadius: 20 }}>{v}</Tag> },
                { title: 'IP',     dataIndex: 'ip',
                  render: (v: string) => <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</Text> },
                { title: 'Time',   dataIndex: 'time',
                  render: (v: string) => <Text style={{ color: '#9ca3af', fontSize: 12 }}>{v}</Text> },
              ]}
            />
          </div>
        )}
      </SettingSection>
      <SaveButton section="Security" />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // TAB: LEAVE SETTINGS
  // ═══════════════════════════════════════════════════
  const LeaveSettingsTab = () => (
    <div>
      {/* Leave Quotas */}
      <SettingSection
        title="Leave Quotas (Annual)"
        subtitle="Set the number of days for each leave type per year"
        icon={<CalendarOutlined />}
        color="#22c55e"
      >
        <Row gutter={[16, 0]}>
          {[
            { key: 'annualLeave',    label: '🏖️ Annual Leave',       color: '#6366f1' },
            { key: 'sickLeave',      label: '🤒 Sick Leave',         color: '#ef4444' },
            { key: 'casualLeave',    label: '☀️ Casual Leave',       color: '#22c55e' },
            { key: 'maternityLeave', label: '👶 Maternity Leave',    color: '#ec4899' },
            { key: 'paternityLeave', label: '👨‍👶 Paternity Leave',  color: '#0ea5e9' },
            { key: 'holidays',       label: '🎉 Public Holidays',    color: '#f59e0b' },
          ].map((item) => (
            <Col xs={24} md={8} key={item.key}>
              <Form.Item label={<span style={labelStyle}>{item.label}</span>}>
                <div style={{
                  background: `${item.color}08`, borderRadius: 12,
                  padding: '12px 16px', border: `1px solid ${item.color}22`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <InputNumber
                    value={leaveSettings[item.key as keyof LeaveSettings] as number}
                    onChange={(v) => setLeaveSettings({ ...leaveSettings, [item.key]: v || 0 })}
                    min={0} max={365}
                    style={{ flex: 1, borderRadius: 8 }}
                  />
                  <Text style={{ color: item.color, fontWeight: 700 }}>days</Text>
                </div>
              </Form.Item>
            </Col>
          ))}
        </Row>
      </SettingSection>

      {/* Leave Policies */}
      <SettingSection
        title="Leave Policies"
        subtitle="Configure leave rules and approval workflow"
        icon={<FileTextOutlined />}
        color="#f59e0b"
      >
        <ToggleRow
          label="Carry Forward Leaves"
          description="Allow unused leaves to carry forward to next year"
          value={leaveSettings.carryForward}
          onChange={(v) => setLeaveSettings({ ...leaveSettings, carryForward: v })}
          icon={<CalendarOutlined />}
          color="#f59e0b"
        />
        {leaveSettings.carryForward && (
          <div style={{ margin: '8px 0 16px 46px' }}>
            <Form.Item label={<span style={labelStyle}>Max Carry Forward Days</span>}>
              <InputNumber
                value={leaveSettings.maxCarryForward}
                onChange={(v) => setLeaveSettings({ ...leaveSettings, maxCarryForward: v || 5 })}
                min={1} max={30}
                style={{ width: 200, borderRadius: 10 }}
                addonAfter="days"
              />
            </Form.Item>
          </div>
        )}

        <Row gutter={[16, 0]} style={{ marginTop: 8 }}>
          <Col xs={24} md={12}>
            <Form.Item label={<span style={labelStyle}>Leave Approval Flow</span>}>
              <Select
                value={leaveSettings.leaveApproval}
                onChange={(v) => setLeaveSettings({ ...leaveSettings, leaveApproval: v })}
                style={{ width: '100%' }}
              >
                <Option value="manager">Direct Manager Only</Option>
                <Option value="hr">HR Only</Option>
                <Option value="manager_hr">Manager → HR</Option>
                <Option value="auto">Auto Approve</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<span style={labelStyle}>Weekend Days</span>}>
              <Select
                mode="multiple"
                value={leaveSettings.weekends}
                onChange={(v) => setLeaveSettings({ ...leaveSettings, weekends: v })}
                style={{ width: '100%' }}
              >
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((d) => (
                  <Option key={d} value={d}>{d}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Visual Summary */}
        <div style={{
          background: '#f8fafc', borderRadius: 14, padding: '16px',
          border: '1px solid #f1f5f9', marginTop: 8,
        }}>
          <Text style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 12 }}>
            Leave Balance Summary
          </Text>
          <Row gutter={[12, 12]}>
            {[
              { label: 'Annual',     days: leaveSettings.annualLeave,    color: '#6366f1' },
              { label: 'Sick',       days: leaveSettings.sickLeave,      color: '#ef4444' },
              { label: 'Casual',     days: leaveSettings.casualLeave,    color: '#22c55e' },
              { label: 'Maternity',  days: leaveSettings.maternityLeave, color: '#ec4899' },
            ].map((l) => (
              <Col xs={12} md={6} key={l.label}>
                <div style={{
                  textAlign: 'center', background: '#fff',
                  borderRadius: 12, padding: '14px 10px',
                  border: `2px solid ${l.color}22`,
                }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: l.color }}>{l.days}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{l.label} Days</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </SettingSection>
      <SaveButton section="Leave" />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // TAB: PAYROLL SETTINGS
  // ═══════════════════════════════════════════════════
  const PayrollSettingsTab = () => (
    <div>
      {/* Payroll Configuration */}
      <SettingSection
        title="Payroll Configuration"
        subtitle="Setup payroll processing rules and schedule"
        icon={<DollarOutlined />}
        color="#22c55e"
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span style={labelStyle}>Pay Day</span>}
              tooltip="Day of month when salary is credited"
            >
              <InputNumber
                value={payroll.payDay}
                onChange={(v) => setPayrollSettings({ ...payroll, payDay: v || 28 })}
                min={1} max={31}
                style={{ width: '100%', borderRadius: 10 }}
                addonBefore="Day"
                addonAfter="of month"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span style={labelStyle}>Salary Currency</span>}>
              <Select
                value={payroll.currency}
                onChange={(v) => setPayrollSettings({ ...payroll, currency: v })}
                style={{ width: '100%' }}
              >
                <Option value="INR">₹ INR</Option>
                <Option value="USD">$ USD</Option>
                <Option value="EUR">€ EUR</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span style={labelStyle}>Overtime Rate</span>}
              tooltip="Multiplier for overtime hours"
            >
              <InputNumber
                value={payroll.overtimeRate}
                onChange={(v) => setPayrollSettings({ ...payroll, overtimeRate: v || 1.5 })}
                min={1} max={3} step={0.25}
                style={{ width: '100%', borderRadius: 10 }}
                addonAfter="×"
              />
            </Form.Item>
          </Col>
        </Row>

        <ToggleRow
          label="Auto Process Payroll"
          description="Automatically process payroll on the configured pay day"
          value={payroll.autoProcess}
          onChange={(v) => setPayrollSettings({ ...payroll, autoProcess: v })}
          icon={<ThunderboltOutlined />}
          color="#22c55e"
        />
        <ToggleRow
          label="Send Payslip via Email"
          description="Automatically email payslips to employees after processing"
          value={payroll.payslipEmail}
          onChange={(v) => setPayrollSettings({ ...payroll, payslipEmail: v })}
          icon={<MailOutlined />}
          color="#22c55e"
        />
        <ToggleRow
          label="Enable Overtime"
          description="Calculate and include overtime pay in payroll"
          value={payroll.overtime}
          onChange={(v) => setPayrollSettings({ ...payroll, overtime: v })}
          icon={<ClockCircleOutlined />}
          color="#22c55e"
        />
      </SettingSection>

      {/* Deductions */}
      <SettingSection
        title="Statutory Deductions"
        subtitle="Configure PF, ESI, TDS contribution percentages"
        icon={<PercentageOutlined />}
        color="#ef4444"
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span style={labelStyle}>PF Contribution (%)</span>}
              tooltip="Employee + Employer PF contribution"
            >
              <div style={{
                background: '#fff7ed', borderRadius: 12,
                padding: '12px 16px', border: '1px solid #fed7aa',
              }}>
                <InputNumber
                  value={payroll.pfContribution}
                  onChange={(v) => setPayrollSettings({ ...payroll, pfContribution: v || 12 })}
                  min={0} max={20} step={0.5}
                  style={{ width: '100%', borderRadius: 8 }}
                  addonAfter="%"
                />
                <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 6, display: 'block' }}>
                  Employer contribution: {payroll.pfContribution}%
                </Text>
              </div>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label={<span style={labelStyle}>ESI Contribution (%)</span>}
              tooltip="Employee State Insurance contribution"
            >
              <div style={{
                background: '#fef2f2', borderRadius: 12,
                padding: '12px 16px', border: '1px solid #fecaca',
              }}>
                <InputNumber
                  value={payroll.esiContribution}
                  onChange={(v) => setPayrollSettings({ ...payroll, esiContribution: v || 0.75 })}
                  min={0} max={5} step={0.25}
                  style={{ width: '100%', borderRadius: 8 }}
                  addonAfter="%"
                />
                <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 6, display: 'block' }}>
                  For salary ≤ ₹21,000/month
                </Text>
              </div>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<span style={labelStyle}>Income Tax (TDS)</span>}>
              <ToggleRow
                label="Enable TDS"
                description="Deduct TDS as per income slab"
                value={payroll.tdsEnabled}
                onChange={(v) => setPayrollSettings({ ...payroll, tdsEnabled: v })}
                icon={<PercentageOutlined />}
                color="#ef4444"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Deduction Summary */}
        <div style={{
          background: 'linear-gradient(135deg,#fef2f2,#fff7ed)',
          borderRadius: 14, padding: '16px 20px',
          border: '1px solid #fecaca', marginTop: 8,
        }}>
          <Text style={{ fontWeight: 700, color: '#991b1b', display: 'block', marginBottom: 10 }}>
            Statutory Deduction Summary (on ₹50,000 Basic)
          </Text>
          <Row gutter={[16, 8]}>
            {[
              { label: 'PF (Employee)',  value: Math.round(50000 * payroll.pfContribution / 100) },
              { label: 'PF (Employer)', value: Math.round(50000 * payroll.pfContribution / 100) },
              { label: 'ESI',           value: Math.round(50000 * payroll.esiContribution / 100) },
              { label: 'Prof. Tax',     value: 200 },
            ].map((d) => (
              <Col span={6} key={d.label}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#ef4444', fontSize: 16 }}>
                    ₹{d.value.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{d.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </SettingSection>
      <SaveButton section="Payroll" />
    </div>
  );

  // ═══════════════════════════════════════════════════
  // TAB: ROLES & PERMISSIONS
  // ═══════════════════════════════════════════════════
  const RolesTab = () => (
    <div>
      <SettingSection
        title="Roles & Permissions"
        subtitle="Manage user roles and their access permissions"
        icon={<TeamOutlined />}
        color="#8b5cf6"
      >
        <Row gutter={[16, 16]}>
          {mockRoles.map((role) => (
            <Col xs={24} md={12} key={role.id}>
              <div style={{
                borderRadius: 16, border: '1px solid #f1f5f9',
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                {/* Role Header */}
                <div style={{
                  background: `linear-gradient(135deg,${
                    role.color === 'red'    ? '#fef2f2,#fee2e2' :
                    role.color === 'orange' ? '#fff7ed,#ffedd5' :
                    role.color === 'blue'   ? '#eef2ff,#e0e7ff' :
                                             '#f0fdf4,#dcfce7'
                  })`,
                  padding: '16px 20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: '#fff', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: 18,
                    }}>
                      {role.name === 'Super Admin' ? '👑' :
                       role.name === 'HR Admin'    ? '🛡️' :
                       role.name === 'HR Manager'  ? '👔' : '👤'}
                    </div>
                    <div>
                      <Tag color={role.color}
                        style={{ borderRadius: 20, fontWeight: 700, fontSize: 13, padding: '2px 12px' }}>
                        {role.name}
                      </Tag>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
                        {role.description}
                      </div>
                    </div>
                  </div>
                  <Badge count={role.users} color="#6366f1"
                    style={{ fontSize: 11 }}
                    title={`${role.users} users`}
                  />
                </div>

                {/* Permissions */}
                <div style={{ padding: '14px 20px' }}>
                  <Text style={{ color: '#9ca3af', fontSize: 11, display: 'block', marginBottom: 8 }}>
                    PERMISSIONS
                  </Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {role.permissions.map((p) => (
                      <Tag key={p}
                        style={{
                          borderRadius: 20, fontSize: 11,
                          padding: '2px 10px', fontWeight: 500,
                          background: p === 'all' ? '#eef2ff' : '#f8fafc',
                          color: p === 'all' ? '#6366f1' : '#374151',
                          border: p === 'all' ? '1px solid #c7d2fe' : '1px solid #e5e7eb',
                        }}
                      >
                        {p === 'all' ? '⚡ All Access' : p}
                      </Tag>
                    ))}
                  </div>

                  {/* Action */}
                  <div style={{
                    display: 'flex', justifyContent: 'flex-end', gap: 8,
                    marginTop: 14, paddingTop: 12,
                    borderTop: '1px solid #f1f5f9',
                  }}>
                    <Button size="small" icon={<EyeOutlined />}
                      style={{ borderRadius: 8, fontSize: 12 }}>
                      View
                    </Button>
                    {role.name !== 'Super Admin' && (
                      <Button size="small" icon={<EditOutlined />}
                        style={{ borderRadius: 8, color: '#6366f1', borderColor: '#6366f1', fontSize: 12 }}>
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Permissions Matrix */}
        <div style={{ marginTop: 24 }}>
          <Text style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 14 }}>
            Permissions Matrix
          </Text>
          <Table
            dataSource={[
              { module: 'Employee Management',   super: true, hrAdmin: true, hrMgr: true, emp: false },
              { module: 'Attendance',            super: true, hrAdmin: true, hrMgr: true, emp: true  },
              { module: 'Leave Management',      super: true, hrAdmin: true, hrMgr: true, emp: true  },
              { module: 'Payroll',               super: true, hrAdmin: true, hrMgr: false, emp: false },
              { module: 'Department',            super: true, hrAdmin: true, hrMgr: true, emp: false },
              { module: 'Reports',               super: true, hrAdmin: true, hrMgr: true, emp: false },
              { module: 'Settings',              super: true, hrAdmin: true, hrMgr: false, emp: false },
            ]}
            rowKey="module"
            pagination={false}
            size="small"
            style={{ borderRadius: 12, overflow: 'hidden' }}
            columns={[
              { title: 'Module', dataIndex: 'module',
                render: (v: string) => <Text style={{ fontWeight: 600, fontSize: 13 }}>{v}</Text> },
              ...['super', 'hrAdmin', 'hrMgr', 'emp'].map((role, i) => ({
                title: ['Super Admin', 'HR Admin', 'HR Manager', 'Employee'][i],
                dataIndex: role,
                align: 'center' as const,
                render: (v: boolean) => v
                  ? <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 18 }} />
                  : <CloseCircleOutlined style={{ color: '#e5e7eb', fontSize: 18 }} />,
              })),
            ]}
          />
        </div>
      </SettingSection>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // TAB: PROFILE (Current User)
  // ═══════════════════════════════════════════════════
  const ProfileTab = () => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [pwdVisible, setPwdVisible] = useState({ curr: false, new: false, conf: false });

    return (
      <div>
        <SettingSection
          title="My Profile"
          subtitle="Update your personal information and avatar"
          icon={<UserOutlined />}
        >
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{ position: 'relative' }}>
              <Avatar size={90}
                src={avatarUrl}
                style={{
                  background: getAvatarColor(user?.username || ''),
                  fontSize: 32, fontWeight: 700,
                  border: '4px solid #f1f5f9',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                }}>
                {getInitials(user?.username || '')}
              </Avatar>
              <Upload showUploadList={false} accept="image/*"
                beforeUpload={(f) => { const r = new FileReader(); r.onload = () => setAvatarUrl(r.result as string); r.readAsDataURL(f); return false; }}>
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#6366f1', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '3px solid #fff',
                }}>
                  <CameraOutlined style={{ color: '#fff', fontSize: 11 }} />
                </div>
              </Upload>
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>{user?.username}</Title>
              <Text style={{ color: '#6b7280' }}>{user?.email}</Text>
              <div style={{ marginTop: 6 }}>
                <Tag color={ROLE_COLORS[user?.role || 'EMPLOYEE']}
                  style={{ borderRadius: 20, fontWeight: 600 }}>
                  {ROLE_LABELS[user?.role || 'EMPLOYEE']}
                </Tag>
                <Badge status="success" text={
                  <Text style={{ fontSize: 12, color: '#22c55e', fontWeight: 500 }}>Active</Text>
                } style={{ marginLeft: 12 }} />
              </div>
            </div>
          </div>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item label={<span style={labelStyle}>Username</span>}>
                <Input
                  defaultValue={user?.username}
                  prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
                  style={{ borderRadius: 10, height: 44 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={<span style={labelStyle}>Email Address</span>}>
                <Input
                  defaultValue={user?.email}
                  prefix={<MailOutlined style={{ color: '#9ca3af' }} />}
                  style={{ borderRadius: 10, height: 44 }}
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="primary" icon={<SaveOutlined />}
              onClick={() => message.success('Profile updated!')}
              style={{
                borderRadius: 10, height: 42, paddingInline: 28,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border: 'none', fontWeight: 600,
              }}>
              Save Profile
            </Button>
          </div>
        </SettingSection>

        {/* Change Password */}
        <SettingSection
          title="Change Password"
          subtitle="Update your account password regularly"
          icon={<KeyOutlined />}
          color="#ef4444"
        >
          <Row gutter={[16, 0]}>
            {[
              { key: 'curr', label: 'Current Password',  placeholder: 'Enter current password'  },
              { key: 'new',  label: 'New Password',       placeholder: 'Enter new password'       },
              { key: 'conf', label: 'Confirm Password',   placeholder: 'Confirm new password'    },
            ].map((f) => (
              <Col xs={24} md={8} key={f.key}>
                <Form.Item label={<span style={labelStyle}>{f.label}</span>}>
                  <Input
                    type={pwdVisible[f.key as keyof typeof pwdVisible] ? 'text' : 'password'}
                    placeholder={f.placeholder}
                    style={{ borderRadius: 10, height: 44 }}
                    prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                    suffix={
                      <Button type="text" size="small"
                        icon={pwdVisible[f.key as keyof typeof pwdVisible]
                          ? <EyeInvisibleOutlined />
                          : <EyeOutlined />}
                        onClick={() => setPwdVisible((p) => ({ ...p, [f.key]: !p[f.key as keyof typeof pwdVisible] }))}
                      />
                    }
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>

          {/* Password Strength Indicator */}
          <div style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, display: 'block' }}>
              Password Strength
            </Text>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Weak', 'Fair', 'Good', 'Strong'].map((s, i) => (
                <div key={s} style={{ flex: 1 }}>
                  <div style={{
                    height: 6, borderRadius: 3,
                    background: i < 3 ? '#22c55e' : '#e5e7eb',
                    transition: 'all 0.3s',
                  }} />
                  <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>{s}</Text>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<KeyOutlined />}
              onClick={() => message.success('Password changed!')}
              style={{
                borderRadius: 10, height: 42, paddingInline: 28,
                background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                border: 'none', fontWeight: 600,
              }}>
              Update Password
            </Button>
          </div>
        </SettingSection>

        {/* Login Sessions */}
        <SettingSection
          title="Active Sessions"
          subtitle="Manage your active login sessions"
          icon={<MonitorOutlined />}
          color="#f59e0b"
        >
          {[
            { device: 'Chrome on Windows 11', ip: '192.168.1.1', time: 'Current Session', current: true,  icon: <DesktopOutlined /> },
            { device: 'Safari on iPhone 14',  ip: '192.168.1.5', time: '2 hours ago',     current: false, icon: <MobileOutlined />  },
            { device: 'Firefox on MacBook',   ip: '10.0.0.2',    time: '1 day ago',       current: false, icon: <DesktopOutlined /> },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '12px 16px',
              background: s.current ? '#eef2ff' : '#fafbfc',
              borderRadius: 10, marginBottom: 8,
              border: s.current ? '1px solid #c7d2fe' : '1px solid #f1f5f9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: s.current ? '#eef2ff' : '#f1f5f9',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 18,
                  color: s.current ? '#6366f1' : '#6b7280',
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {s.device}
                    {s.current && (
                      <Tag color="blue" style={{ marginLeft: 8, fontSize: 10, borderRadius: 20 }}>
                        Current
                      </Tag>
                    )}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>
                    {s.ip} · {s.time}
                  </div>
                </div>
              </div>
              {!s.current && (
                <Button danger size="small"
                  onClick={() => message.success('Session revoked')}
                  style={{ borderRadius: 8, fontSize: 12 }}>
                  Revoke
                </Button>
              )}
            </div>
          ))}
          <Button danger block style={{ borderRadius: 10, height: 42, marginTop: 8 }}
            onClick={() => message.success('All other sessions revoked')}>
            Revoke All Other Sessions
          </Button>
        </SettingSection>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage system preferences, security, and configurations"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.DASHBOARD },
          { label: 'Settings' },
        ]}
      />

      <Card style={{
        borderRadius: 16, border: 'none',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ fontWeight: 600 }}
          tabPosition="left"
          style={{ minHeight: 600 }}
          items={[
            {
              key:      'profile',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserOutlined />My Profile
                </span>
              ),
              children: <ProfileTab />,
            },
            {
              key:   'company',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BankOutlined />Company
                </span>
              ),
              children: isAdmin ? <CompanyTab /> : (
                <Result status="403" title="Admin Access Required"
                  subTitle="Only admins can manage company settings." />
              ),
            },
            {
              key:   'notifications',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BellOutlined />Notifications
                </span>
              ),
              children: <NotificationsTab />,
            },
            {
              key:   'security',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SafetyCertificateOutlined />Security
                </span>
              ),
              children: <SecurityTab />,
            },
            {
              key:   'leave',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarOutlined />Leave Policy
                </span>
              ),
              children: isAdmin ? <LeaveSettingsTab /> : (
                <Result status="403" title="Admin Access Required" />
              ),
            },
            {
              key:   'payroll',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarOutlined />Payroll
                </span>
              ),
              children: isAdmin ? <PayrollSettingsTab /> : (
                <Result status="403" title="Admin Access Required" />
              ),
            },
            {
              key:   'roles',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TeamOutlined />Roles & Permissions
                </span>
              ),
              children: isAdmin ? <RolesTab /> : (
                <Result status="403" title="Admin Access Required" />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

// ─── Shared Styles ─────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontWeight: 500, fontSize: 13, color: '#374151',
};

export default Settings;