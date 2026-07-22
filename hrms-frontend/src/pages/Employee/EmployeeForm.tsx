import React, { useEffect, useState } from 'react';
import {
  Card, Form, Input, Select, DatePicker, Button, Row, Col,
  Typography, Divider, Steps, message, Upload, Avatar,
  InputNumber, Space, Switch, Tooltip, Alert,
} from 'antd';
import {
  UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined,
  HomeOutlined, HeartOutlined, SaveOutlined, ArrowLeftOutlined,
  ArrowRightOutlined, CameraOutlined, BankOutlined,
  ContactsOutlined, MedicineBoxOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from 'dayjs';
import { useEmployee } from '../../hooks/useEmployee';
import { EmployeeRequest } from '../../types/employee.types';
import { employeeSchema } from '../../utils/validators';
import { employeeApi } from '../../api/employeeApi';
import { departmentApi, designationApi } from '../../api/departmentApi';
import { Department, Designation } from '../../types/department.types';
import { getInitials, getAvatarColor, formatCurrency } from '../../utils/helpers';
import {
  GENDER_OPTIONS, BLOOD_GROUP_OPTIONS, EMPLOYMENT_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS, ROUTES,
} from '../../constants';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { date } from 'yup';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// ─── Step Configuration ────────────────────────────────
const STEPS = [
  { title: 'Personal',    icon: <UserOutlined />,     description: 'Basic Details' },
  { title: 'Employment',  icon: <BankOutlined />,     description: 'Job Info' },
  { title: 'Address',     icon: <HomeOutlined />,     description: 'Location' },
  { title: 'Emergency',   icon: <ContactsOutlined />, description: 'Contacts' },
  { title: 'Review',      icon: <CheckCircleOutlined />, description: 'Confirm' },
];

// ─── Form Defaults ─────────────────────────────────────
const defaultValues: EmployeeRequest = {
  firstName:      '',
  lastName:       '',
  email:          '',
  phone:          '',
  gender:         'MALE',
  dateOfBirth:    '',
  joiningDate:    '',
  employmentType: 'FULL_TIME',
  departmentId:   0,
  designationId:  0,
  managerId:      undefined,
  bloodGroup:     undefined,
  maritalStatus:  undefined,
  salary:         undefined,
  address: {
    street:  '',
    city:    '',
    state:   '',
    country: 'India',
    zipCode: '',
  },
  emergencyContact: {
    name:         '',
    relationship: '',
    phone:        '',
    email:        '',
  },
};

// ═══════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════
const EmployeeForm: React.FC = () => {
  const { id }                = useParams<{ id: string }>();
  const navigate              = useNavigate();
  const isEdit                = Boolean(id);

  const [currentStep, setCurrentStep]       = useState(0);
  const [departments, setDepartments]       = useState<Department[]>([]);
  const [designations, setDesignations]     = useState<Designation[]>([]);
  const [managers, setManagers]             = useState<{ id: number; fullName: string }[]>([]);
  const [loading, setLoading]               = useState(false);
  const [fetchLoading, setFetchLoading]     = useState(false);
  const [profilePic, setProfilePic]         = useState<string | null>(null);
  const [submitError, setSubmitError]       = useState<string | null>(null);
  const [dateOfBirth,setdateOfBirth]        =useState(null);
  // ── React Hook Form ────────────────────────────────
  const {
    control, handleSubmit, watch, setValue, trigger,
    reset, getValues,
    formState: { errors, isValid },
  } = useForm<EmployeeRequest>({
    resolver:      yupResolver(employeeSchema) as any,
    defaultValues,
    mode:          'onChange',
  });

  const selectedDeptId = watch('departmentId');
  const firstName      = watch('firstName');
  const lastName       = watch('lastName');
  const fullName       = `${firstName || ''} ${lastName || ''}`.trim();

  // ── Fetch Departments on Mount ─────────────────────
  useEffect(() => {
    fetchDepartments();
    if (isEdit) fetchEmployee();
  }, [id]);

  // ── Fetch Designations when Dept Changes ───────────
  useEffect(() => {
    if (selectedDeptId && selectedDeptId > 0) {
      fetchDesignations(selectedDeptId);
      fetchManagers(selectedDeptId);
    } else {
      setDesignations([]);
      setManagers([]);
    }
  }, [selectedDeptId]);

  // ── API Calls ──────────────────────────────────────
  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.getAllList();
      setDepartments(res.data || []);
    } catch { /* silent */ }
  };

  const fetchDesignations = async (deptId: number) => {
    try {
      const res = await designationApi.getByDepartment(deptId);
      setDesignations(res.data || []);
    } catch { /* silent */ }
  };

  const fetchManagers = async (deptId: number) => {
    try {
      const res = await employeeApi.getByDepartment(deptId);
      const list = (res.data || []).map((e: any) => ({
        id: e.id,
        fullName: e.fullName || `${e.firstName} ${e.lastName}`,
      }));
      setManagers(list);
    } catch { /* silent */ }
  };

  const fetchEmployee = async () => {
    setFetchLoading(true);
    try {
      const res = await employeeApi.getById(Number(id));
      if (res.data) {
        const emp = res.data;
        reset({
          firstName:      emp.firstName,
          lastName:       emp.lastName,
          email:          emp.email,
          phone:          emp.phone,
          gender:         emp.gender,
          dateOfBirth:    emp.dateOfBirth,
          joiningDate:    emp.joiningDate,
          employmentType: emp.employmentType,
          departmentId:   emp.departmentId,
          designationId:  emp.designationId,
          managerId:      emp.managerId,
          bloodGroup:     emp.bloodGroup,
          maritalStatus:  emp.maritalStatus,
          salary:         emp.salary,
          address:        emp.address || defaultValues.address,
          emergencyContact: emp.emergencyContact || defaultValues.emergencyContact,
        });
        if (emp.profilePicture) setProfilePic(emp.profilePicture);
      }
    } catch {
      message.error('Failed to load employee data');
      navigate(ROUTES.EMPLOYEES);
    } finally {
      setFetchLoading(false);
    }
  };

  // ── Step Navigation ────────────────────────────────
  const validateStep = async (): Promise<boolean> => {
    const fieldsPerStep: (keyof EmployeeRequest)[][] = [
      ['firstName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth'],
      ['joiningDate', 'employmentType', 'departmentId', 'designationId'],
      [],
      [],
      [],
    ];
    const fields = fieldsPerStep[currentStep];
    if (fields.length === 0) return true;
    return await trigger(fields);
  };

  const nextStep = async () => {
    const ok = await validateStep();
    if (ok) setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  // ── Submit ─────────────────────────────────────────
  const onSubmit = async (data: EmployeeRequest) => {
    setLoading(true);
    setSubmitError(null);
    try {
      if (isEdit) {
        await employeeApi.update(Number(id), data);
        message.success('Employee updated successfully');
      } else {
        await employeeApi.create(data);
        message.success('Employee created successfully');
      }
      navigate(ROUTES.EMPLOYEES);
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Operation failed';
      setSubmitError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <LoadingSpinner fullPage tip="Loading employee data..." />;

  // ═══════════════════════════════════════════════════
  // STEP 1 — PERSONAL INFORMATION
  // ═══════════════════════════════════════════════════
  const Step1Personal = () => (
    <div>
      <div style={sectionTitleStyle}>
        <UserOutlined style={{ color: '#6366f1', fontSize: 18 }} />
        <div>
          <Title level={5} style={{ margin: 0 }}>Personal Information</Title>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>Basic details of the employee</Text>
        </div>
      </div>

      {/* Profile Picture */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Avatar
            size={100}
            src={profilePic}
            style={{
              background: fullName ? getAvatarColor(fullName) : '#e5e7eb',
              fontSize: 36, fontWeight: 700,
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              border: '4px solid #fff',
            }}
          >
            {fullName ? getInitials(fullName) : <UserOutlined />}
          </Avatar>
          <Upload
            showUploadList={false}
            accept="image/*"
            beforeUpload={(file) => {
              const reader = new FileReader();
              reader.onload = () => setProfilePic(reader.result as string);
              reader.readAsDataURL(file);
              return false;
            }}
          >
            <Tooltip title="Upload Photo">
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 32, height: 32, borderRadius: '50%',
                background: '#6366f1', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '3px solid #fff',
                boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
              }}>
                <CameraOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
            </Tooltip>
          </Upload>
        </div>
        <div style={{ marginTop: 8 }}>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>
            Click the camera icon to upload a photo
          </Text>
        </div>
      </div>

      <Row gutter={[20, 0]}>
        {/* First Name */}
        <Col xs={24} md={12}>
          <Form.Item
            label={<span style={labelStyle}>First Name <span style={reqStyle}>*</span></span>}
            validateStatus={errors.firstName ? 'error' : ''}
            help={errors.firstName?.message}
          >
            <Controller name="firstName" control={control} render={({ field }) => (
              <Input {...field} prefix={<UserOutlined />}
                placeholder="Enter first name" />
            )} />
          </Form.Item>
        </Col>

        {/* Last Name */}
        <Col xs={24} md={12}>
          <Form.Item
            label={<span style={labelStyle}>Last Name <span style={reqStyle}>*</span></span>}
            validateStatus={errors.lastName ? 'error' : ''}
            help={errors.lastName?.message}
          >
            <Controller name="lastName" control={control} render={({ field }) => (
              <Input {...field} prefix={<UserOutlined />}
                placeholder="Enter last name" />   
             )} />
          </Form.Item>
        </Col>

        {/* Email */}
        <Col xs={24} md={12}>
          <Form.Item
            label={<span style={labelStyle}>Email <span style={reqStyle}>*</span></span>}
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller name="email" control={control} render={({ field }) => (
              <Input {...field} prefix={<MailOutlined style={iconStyle} />}
                placeholder="employee@company.com" type="email" style={inputStyle} />
            )} />
          </Form.Item>
        </Col>

        {/* Phone */}
        <Col xs={24} md={12}>
          <Form.Item
            label={<span style={labelStyle}>Phone <span style={reqStyle}>*</span></span>}
            validateStatus={errors.phone ? 'error' : ''}
            help={errors.phone?.message}
          >
            <Controller name="phone" control={control} render={({ field }) => (
              <Input {...field} prefix={<PhoneOutlined style={iconStyle} />}
                placeholder="10-digit mobile number" maxLength={10} style={inputStyle} />
            )} />
          </Form.Item>
        </Col>

        {/* Gender */}
        <Col xs={24} md={8}>
          <Form.Item
            label={<span style={labelStyle}>Gender <span style={reqStyle}>*</span></span>}
            validateStatus={errors.gender ? 'error' : ''}
            help={errors.gender?.message}
          >
            <Controller name="gender" control={control} render={({ field }) => (
              <Select {...field} placeholder="Select gender" style={{ width: '100%' }}
                options={GENDER_OPTIONS} />
            )} />
          </Form.Item>
        </Col>

        {/* Date of Birth */}
        <Col xs={24} md={8}>
          <Form.Item
            label={<span style={labelStyle}>Date of Birth <span style={reqStyle}>*</span></span>}
            validateStatus={errors.dateOfBirth ? 'error' : ''}
            help={errors.dateOfBirth?.message}
          >
            <Controller name="dateOfBirth" control={control} render={({ field }) => (
              <DatePicker
                style={{ width: '100%', borderRadius: 10, height: 44 }}
                format="DD-MM-YYYY"
                placeholder="Select date of birth"
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
                disabledDate={(d) => d && d.isAfter(dayjs().subtract(18, 'year'))}
              />
            )} />
          </Form.Item>
        </Col>

        {/* Blood Group */}
        <Col xs={24} md={8}>
          <Form.Item label={<span style={labelStyle}>Blood Group</span>}>
            <Controller name="bloodGroup" control={control} render={({ field }) => (
              <Select {...field} placeholder="Select" allowClear
                style={{ width: '100%' }} options={BLOOD_GROUP_OPTIONS} />
            )} />
          </Form.Item>
        </Col>

        {/* Marital Status */}
        <Col xs={24} md={12}>
          <Form.Item label={<span style={labelStyle}>Marital Status</span>}>
            <Controller name="maritalStatus" control={control} render={({ field }) => (
              <Select {...field} placeholder="Select" allowClear
                style={{ width: '100%' }} options={MARITAL_STATUS_OPTIONS} />
            )} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // STEP 2 — EMPLOYMENT DETAILS
  // ═══════════════════════════════════════════════════
  const Step2Employment = () => (
    <div>
      <div style={sectionTitleStyle}>
        <BankOutlined style={{ color: '#6366f1', fontSize: 18 }} />
        <div>
          <Title level={5} style={{ margin: 0 }}>Employment Details</Title>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>Job and department information</Text>
        </div>
      </div>

      <Row gutter={[20, 0]}>
        {/* Joining Date */}
        <Col xs={24} md={12}>
          <Form.Item
            label={<span style={labelStyle}>Joining Date <span style={reqStyle}>*</span></span>}
            validateStatus={errors.joiningDate ? 'error' : ''}
            help={errors.joiningDate?.message}
          >
            <Controller name="joiningDate" control={control} render={({ field }) => (
              <DatePicker
                style={{ width: '100%', borderRadius: 10, height: 44 }}
                format="DD-MM-YYYY"
                placeholder="Select joining date"
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
              />
            )} />
          </Form.Item>
        </Col>

        {/* Employment Type */}
        <Col xs={24} md={12}>
          <Form.Item
            label={<span style={labelStyle}>Employment Type <span style={reqStyle}>*</span></span>}
            validateStatus={errors.employmentType ? 'error' : ''}
            help={errors.employmentType?.message}
          >
            <Controller name="employmentType" control={control} render={({ field }) => (
              <Select {...field} placeholder="Select type" style={{ width: '100%' }}
                options={EMPLOYMENT_TYPE_OPTIONS} />
            )} />
          </Form.Item>
        </Col>

        {/* Department */}
        <Col xs={24} md={12}>
          <Form.Item
            label={<span style={labelStyle}>Department <span style={reqStyle}>*</span></span>}
            validateStatus={errors.departmentId ? 'error' : ''}
            help={errors.departmentId?.message}
          >
            <Controller name="departmentId" control={control} render={({ field }) => (
              <Select
                {...field}
                placeholder="Select department"
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
                onChange={(val) => {
                  field.onChange(val);
                  setValue('designationId', 0);
                  setValue('managerId', undefined);
                }}
              >
                {departments.map((d) => (
                  <Option key={d.id} value={d.id}>{d.name}</Option>
                ))}
              </Select>
            )} />
          </Form.Item>
        </Col>

        {/* Designation */}
        <Col xs={24} md={12}>
          <Form.Item
            label={<span style={labelStyle}>Designation <span style={reqStyle}>*</span></span>}
            validateStatus={errors.designationId ? 'error' : ''}
            help={errors.designationId?.message}
          >
            <Controller name="designationId" control={control} render={({ field }) => (
              <Select {...field} placeholder="Select designation" style={{ width: '100%' }}
                showSearch optionFilterProp="children"
                disabled={!selectedDeptId || selectedDeptId === 0}
                notFoundContent={
                  <Text style={{ color: '#9ca3af', fontSize: 13 }}>
                    {selectedDeptId ? 'No designations found' : 'Select department first'}
                  </Text>
                }
              >
                {designations.map((d) => (
                  <Option key={d.id} value={d.id}>{d.title}</Option>
                ))}
              </Select>
            )} />
          </Form.Item>
        </Col>

        {/* Reporting Manager */}
        <Col xs={24} md={12}>
          <Form.Item label={<span style={labelStyle}>Reporting Manager</span>}>
            <Controller name="managerId" control={control} render={({ field }) => (
              <Select {...field} placeholder="Select manager" style={{ width: '100%' }}
                allowClear showSearch optionFilterProp="children"
                disabled={!selectedDeptId || selectedDeptId === 0}
                notFoundContent={
                  <Text style={{ color: '#9ca3af', fontSize: 13 }}>No managers found</Text>
                }
              >
                {managers.map((m) => (
                  <Option key={m.id} value={m.id}>{m.fullName}</Option>
                ))}
              </Select>
            )} />
          </Form.Item>
        </Col>

        {/* Salary */}
        <Col xs={24} md={12}>
          <Form.Item label={<span style={labelStyle}>Monthly Salary (CTC)</span>}>
            <Controller name="salary" control={control} render={({ field }) => (
              <InputNumber
                {...field}
                style={{ width: '100%', borderRadius: 10, height: 44 }}
                placeholder="Enter salary amount"
                formatter={(v) => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v!.replace(/₹\s?|(,*)/g, '') as any}
                min={0}
              />
            )} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // STEP 3 — ADDRESS
  // ═══════════════════════════════════════════════════
  const Step3Address = () => (
    <div>
      <div style={sectionTitleStyle}>
        <HomeOutlined style={{ color: '#6366f1', fontSize: 18 }} />
        <div>
          <Title level={5} style={{ margin: 0 }}>Address Information</Title>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>Residential address details</Text>
        </div>
      </div>

      <Row gutter={[20, 0]}>
        <Col xs={24}>
          <Form.Item label={<span style={labelStyle}>Street / Area</span>}>
            <Controller name="address.street" control={control} render={({ field }) => (
              <TextArea {...field} placeholder="House No, Street Name, Area"
                rows={2} style={{ borderRadius: 10 }} />
            )} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label={<span style={labelStyle}>City</span>}>
            <Controller name="address.city" control={control} render={({ field }) => (
              <Input {...field} placeholder="Enter city" style={inputStyle} />
            )} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label={<span style={labelStyle}>State</span>}>
            <Controller name="address.state" control={control} render={({ field }) => (
              <Input {...field} placeholder="Enter state" style={inputStyle} />
            )} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label={<span style={labelStyle}>Country</span>}>
            <Controller name="address.country" control={control} render={({ field }) => (
              <Input {...field} placeholder="Enter country" style={inputStyle} />
            )} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label={<span style={labelStyle}>ZIP / Pin Code</span>}>
            <Controller name="address.zipCode" control={control} render={({ field }) => (
              <Input {...field} placeholder="Enter pin code"
                maxLength={6} style={inputStyle} />
            )} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // STEP 4 — EMERGENCY CONTACT
  // ═══════════════════════════════════════════════════
  const Step4Emergency = () => (
    <div>
      <div style={sectionTitleStyle}>
        <MedicineBoxOutlined style={{ color: '#ef4444', fontSize: 18 }} />
        <div>
          <Title level={5} style={{ margin: 0 }}>Emergency Contact</Title>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>Person to contact in case of emergency</Text>
        </div>
      </div>

      <Row gutter={[20, 0]}>
        <Col xs={24} md={12}>
          <Form.Item label={<span style={labelStyle}>Contact Name</span>}>
            <Controller name="emergencyContact.name" control={control} render={({ field }) => (
              <Input {...field} prefix={<UserOutlined style={iconStyle} />}
                placeholder="Full name" style={inputStyle} />
            )} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label={<span style={labelStyle}>Relationship</span>}>
            <Controller name="emergencyContact.relationship" control={control} render={({ field }) => (
              <Select {...field} placeholder="Select relationship" style={{ width: '100%' }}
                allowClear>
                {['Father', 'Mother', 'Spouse', 'Sibling', 'Friend', 'Other'].map((r) => (
                  <Option key={r} value={r}>{r}</Option>
                ))}
              </Select>
            )} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label={<span style={labelStyle}>Contact Phone</span>}>
            <Controller name="emergencyContact.phone" control={control} render={({ field }) => (
              <Input {...field} prefix={<PhoneOutlined style={iconStyle} />}
                placeholder="10-digit mobile number" maxLength={10} style={inputStyle} />
            )} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label={<span style={labelStyle}>Contact Email</span>}>
            <Controller name="emergencyContact.email" control={control} render={({ field }) => (
              <Input {...field} prefix={<MailOutlined style={iconStyle} />}
                placeholder="contact@email.com" style={inputStyle} />
            )} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // STEP 5 — REVIEW
  // ═══════════════════════════════════════════════════
  const Step5Review = () => {
    const v = getValues();
    const deptName  = departments.find((d) => d.id === v.departmentId)?.name || '—';
    const desigName = designations.find((d) => d.id === v.designationId)?.title || '—';
    const mgrName   = managers.find((m) => m.id === v.managerId)?.fullName || '—';

    const ReviewRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
      <div style={{
        display: 'flex', justifyContent: 'space-between', padding: '10px 0',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <Text style={{ color: '#6b7280', fontSize: 13 }}>{label}</Text>
        <Text style={{ fontWeight: 600, fontSize: 13, color: '#1f2937', maxWidth: '60%', textAlign: 'right' }}>
          {value || '—'}
        </Text>
      </div>
    );

    return (
      <div>
        <div style={sectionTitleStyle}>
          <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 18 }} />
          <div>
            <Title level={5} style={{ margin: 0 }}>Review & Confirm</Title>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>Verify all the details before submitting</Text>
          </div>
        </div>

        {/* Employee Card Preview */}
        <div style={{
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          borderRadius: 16, padding: 24, marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
        }}>
          <Avatar size={72} src={profilePic}
            style={{
              background: getAvatarColor(fullName || 'E'),
              fontSize: 28, fontWeight: 700, border: '3px solid rgba(255,255,255,0.3)',
            }}>
            {getInitials(fullName || 'E')}
          </Avatar>
          <div>
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>
              {fullName || 'Employee Name'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 }}>
              {desigName} • {deptName}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>
              {v.email} • {v.phone}
            </div>
          </div>
        </div>

        <Row gutter={[24, 0]}>
          {/* Personal Details */}
          <Col xs={24} md={12}>
            <div style={reviewSectionStyle}>
              <div style={reviewHeaderStyle}>
                <UserOutlined style={{ color: '#6366f1' }} />
                <Text style={{ fontWeight: 700, fontSize: 14 }}>Personal</Text>
              </div>
              <ReviewRow label="Full Name"       value={fullName} />
              <ReviewRow label="Email"           value={v.email} />
              <ReviewRow label="Phone"           value={v.phone} />
              <ReviewRow label="Gender"          value={v.gender} />
              <ReviewRow label="Date of Birth"   value={v.dateOfBirth} />
              <ReviewRow label="Blood Group"     value={v.bloodGroup} />
              <ReviewRow label="Marital Status"  value={v.maritalStatus} />
            </div>
          </Col>

          {/* Employment Details */}
          <Col xs={24} md={12}>
            <div style={reviewSectionStyle}>
              <div style={reviewHeaderStyle}>
                <BankOutlined style={{ color: '#6366f1' }} />
                <Text style={{ fontWeight: 700, fontSize: 14 }}>Employment</Text>
              </div>
              <ReviewRow label="Joining Date"      value={v.joiningDate} />
              <ReviewRow label="Employment Type"   value={v.employmentType?.replace('_', ' ')} />
              <ReviewRow label="Department"        value={deptName} />
              <ReviewRow label="Designation"       value={desigName} />
              <ReviewRow label="Reporting Manager" value={mgrName} />
              <ReviewRow label="Salary"            value={v.salary ? formatCurrency(v.salary) : undefined} />
            </div>
          </Col>

          {/* Address */}
          <Col xs={24} md={12}>
            <div style={reviewSectionStyle}>
              <div style={reviewHeaderStyle}>
                <HomeOutlined style={{ color: '#6366f1' }} />
                <Text style={{ fontWeight: 700, fontSize: 14 }}>Address</Text>
              </div>
              <ReviewRow label="Street"  value={v.address?.street} />
              <ReviewRow label="City"    value={v.address?.city} />
              <ReviewRow label="State"   value={v.address?.state} />
              <ReviewRow label="Country" value={v.address?.country} />
              <ReviewRow label="Pincode" value={v.address?.zipCode} />
            </div>
          </Col>

          {/* Emergency Contact */}
          <Col xs={24} md={12}>
            <div style={reviewSectionStyle}>
              <div style={reviewHeaderStyle}>
                <MedicineBoxOutlined style={{ color: '#ef4444' }} />
                <Text style={{ fontWeight: 700, fontSize: 14 }}>Emergency Contact</Text>
              </div>
              <ReviewRow label="Name"         value={v.emergencyContact?.name} />
              <ReviewRow label="Relationship" value={v.emergencyContact?.relationship} />
              <ReviewRow label="Phone"        value={v.emergencyContact?.phone} />
              <ReviewRow label="Email"        value={v.emergencyContact?.email} />
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  // ── Step Content Renderer ──────────────────────────
  const stepContent: Record<number, React.ReactNode> = {
    0: <Step1Personal />,
    1: <Step2Employment />,
    2: <Step3Address />,
    3: <Step4Emergency />,
    4: <Step5Review />,
  };

  // ═══════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Employee' : 'Add New Employee'}
        subtitle={isEdit ? 'Update employee information' : 'Fill in the details to onboard a new employee'}
        showBack
        backPath={ROUTES.EMPLOYEES}
        breadcrumbs={[
          { label: 'Dashboard',  path: ROUTES.DASHBOARD },
          { label: 'Employees',  path: ROUTES.EMPLOYEES },
          { label: isEdit ? 'Edit' : 'Add New' },
        ]}
      />

      <Card
        style={{
          borderRadius: 16, border: 'none',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}
      >
        {/* Step Indicator */}
        <Steps
          current={currentStep}
          size="small"
          style={{ marginBottom: 36 }}
          items={STEPS.map((step, idx) => ({
            title: <span style={{ fontWeight: currentStep === idx ? 700 : 400 }}>{step.title}</span>,
            description: <span style={{ fontSize: 11 }}>{step.description}</span>,
            icon: (
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: idx <= currentStep
                  ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                  : '#f1f5f9',
                color: idx <= currentStep ? '#fff' : '#9ca3af',
                fontSize: 16,
                transition: 'all 0.3s',
              }}>
                {step.icon}
              </div>
            ),
          }))}
        />

        {/* Submit Error */}
        {submitError && (
          <Alert message={submitError} type="error" showIcon closable
            onClose={() => setSubmitError(null)}
            style={{ marginBottom: 20, borderRadius: 10 }} />
        )}

        {/* Step Content */}
        <Form layout="vertical" size="large">
          <div style={{ minHeight: 400 }}>
            {stepContent[currentStep]}
          </div>
        </Form>

        {/* Navigation Buttons */}
        <Divider style={{ margin: '16px 0' }} />

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {/* Left: Cancel / Back */}
          <Space>
            <Button onClick={() => navigate(ROUTES.EMPLOYEES)}
              style={{ borderRadius: 10, height: 42 }}>
              Cancel
            </Button>
            {currentStep > 0 && (
              <Button icon={<ArrowLeftOutlined />} onClick={prevStep}
                style={{ borderRadius: 10, height: 42 }}>
                Previous
              </Button>
            )}
          </Space>

          {/* Step Dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((_, idx) => (
              <div key={idx} style={{
                width: idx === currentStep ? 24 : 8,
                height: 8, borderRadius: 4,
                background: idx <= currentStep ? '#6366f1' : '#e5e7eb',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>

          {/* Right: Next / Submit */}
          <Space>
            {currentStep < STEPS.length - 1 ? (
              <Button type="primary" onClick={nextStep}
                style={{
                  borderRadius: 10, height: 42,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: 'none', fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                }}>
                Next Step <ArrowRightOutlined />
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loading}
                onClick={handleSubmit(onSubmit)}
                style={{
                  borderRadius: 10, height: 44,
                  background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                  border: 'none', fontWeight: 600, paddingInline: 32,
                  boxShadow: '0 4px 12px rgba(34,197,94,0.35)',
                }}
              >
                {loading
                  ? 'Saving...'
                  : isEdit ? 'Update Employee' : 'Create Employee'}
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

// ─── Shared Styles ─────────────────────────────────────
const inputStyle: React.CSSProperties = {
  borderRadius: 10,
  height: 44,
};

const iconStyle: React.CSSProperties = {
  color: '#9ca3af',
};

const labelStyle: React.CSSProperties = {
  fontWeight: 500,
  fontSize: 13,
  color: '#374151',
};

const reqStyle: React.CSSProperties = {
  color: '#ef4444',
};

const sectionTitleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 28,
  padding: '14px 18px',
  background: '#f8fafc',
  borderRadius: 12,
  border: '1px solid #e2e8f0',
};

const reviewSectionStyle: React.CSSProperties = {
  background: '#fafbfc',
  borderRadius: 12,
  padding: 18,
  marginBottom: 16,
  border: '1px solid #f1f5f9',
};

const reviewHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 12,
  paddingBottom: 10,
  borderBottom: '2px solid #e5e7eb',
};

export default EmployeeForm;