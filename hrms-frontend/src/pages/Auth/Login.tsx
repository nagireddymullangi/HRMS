import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver }         from '@hookform/resolvers/yup';
import { Link }                from 'react-router-dom';
import { Alert, Button, Input, Form, Card, Typography, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth }         from '../../hooks/useAuth';
import { LoginRequest }    from '../../types/auth.types';
import { loginSchema }     from '../../utils/validators';
import { ROUTES, APP_NAME } from '../../constants';
import { Color } from 'antd/es/color-picker';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const { login, isLoading, error, clearAuthError } = useAuth();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema),
    defaultValues: { usernameOrEmail:'', password:'' },
  });

  useEffect(() => { clearAuthError(); }, []);

  return (
    <div style={{ minHeight:'100vh', display:'flex',
                  background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Left Panel */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                    justifyContent:'center', padding:48, color:'#fff' }}>
        <div style={{ maxWidth:520 }}>
          <div style={{ width:180, height:110, background:'rgba(255,255,255,0.2)',
                        borderRadius:20, display:'flex', alignItems:'center',
                        justifyContent:'center', fontSize:28, fontWeight:800,
                        marginBottom:40, backdropFilter:'blur(10px)',
                        border:'1px solid rgba(239, 233, 233, 0.3)' }}>
          <div style={{color:'rgba(232, 8, 206, 0.91)'}}>
            POTLA TECH SOLUTIONS
          </div>
          </div>
          <Title level={1} style={{ color:'#fff', marginBottom:12, fontSize:36 }}>
            {APP_NAME}
          </Title>
          <Text style={{ color:'rgba(255,255,255,0.8)', fontSize:16, lineHeight:1.6 }}>
            Streamline your HR operations with our comprehensive management portal.
            Manage employees, attendance, payroll and more.
          </Text>
          <div style={{ display:'flex', gap:24, marginTop:40 }}>
            {[['500+','Employees'],['50+','Departments'],['99%','Uptime']].map(([num, label]) => (
              <div key={label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:28, fontWeight:800, color:'#fff' }}>{num}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width:480, display:'flex', alignItems:'center', justifyContent:'center',
                    background:'#fff', padding:48 }}>
        <div style={{ width:'100%', maxWidth:380 }}>
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
                          width:56, height:56, background:'linear-gradient(135deg,#667eea,#764ba2)',
                          borderRadius:16, marginBottom:16,
                          boxShadow:'0 8px 24px rgba(102,126,234,0.4)' }}>
              <SafetyOutlined style={{ color:'#fff', fontSize:24 }} />
            </div>
            <Title level={2} style={{ marginBottom:4, color:'#1f2937' }}>Welcome Back</Title>
            <Text style={{ color:'#6b7280' }}>Sign in to your account to continue</Text>
          </div>

          {error && (
            <Alert message={error} type="error" showIcon closable
              onClose={clearAuthError} style={{ marginBottom:20, borderRadius:8 }} />
          )}

          <Form layout="vertical" onFinish={handleSubmit(login)} size="large">
            <Form.Item label="Username or Email"
              validateStatus={errors.usernameOrEmail ? 'error' : ''}
              help={errors.usernameOrEmail?.message}>
              <Controller name="usernameOrEmail" control={control} render={({ field }) => (
                <Input {...field} prefix={<UserOutlined style={{ color:'#9ca3af' }} />}
                  placeholder="Enter username or email"
                  style={{ borderRadius:10, height:46 }} />
              )} />
            </Form.Item>

            <Form.Item label="Password"
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password?.message}>
              <Controller name="password" control={control} render={({ field }) => (
                <Input.Password {...field} prefix={<LockOutlined style={{ color:'#9ca3af' }} />}
                  placeholder="Enter your password"
                  style={{ borderRadius:10, height:46 }} />
              )} />
            </Form.Item>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <Checkbox>Remember me</Checkbox>
              <Link to={ROUTES.FORGOT_PASSWORD}
                style={{ color:'#6366f1', fontWeight:500, fontSize:13 }}>
                Forgot Password?
              </Link>
            </div>

            <Button type="primary" htmlType="submit" loading={isLoading} block
              style={{ height:46, borderRadius:10, fontSize:15, fontWeight:600,
                       background:'linear-gradient(135deg,#667eea,#764ba2)',
                       border:'none', boxShadow:'0 4px 12px rgba(102,126,234,0.4)' }}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form>

          <Divider style={{ color:'#9ca3af', fontSize:12 }}>Demo Credentials</Divider>
          <div style={{ background:'#f8fafc', borderRadius:10, padding:'12px 16px',
                        border:'1px solid #e5e7eb', fontSize:13 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'#6b7280' }}>Username:</span>
              <span style={{ fontWeight:600, color:'#1f2937' }}>superadmin</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
              <span style={{ color:'#6b7280' }}>Password:</span>
              <span style={{ fontWeight:600, color:'#1f2937' }}>Admin@123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;