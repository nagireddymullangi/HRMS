import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver }   from '@hookform/resolvers/yup';
import { useSearchParams, Link } from 'react-router-dom';
import { Alert, Button, Input, Form, Card, Typography, Result } from 'antd';
import { LockOutlined }  from '@ant-design/icons';
import { authApi }       from '../../api/authApi';
import { resetPasswordSchema } from '../../utils/validators';
import { ROUTES }        from '../../constants';

const { Title, Text } = Typography;
interface FormData { newPassword: string; confirmPassword: string; }

const ResetPassword: React.FC = () => {
  const [params]          = useSearchParams();
  const token             = params.get('token') || '';
  const [loading, setL]   = useState(false);
  const [success, setS]   = useState(false);
  const [error,   setE]   = useState<string|null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (d: FormData) => {
    setL(true); setE(null);
    try {
      const res = await authApi.resetPassword({ token, newPassword: d.newPassword });
      if (res.success) setS(true); else setE(res.message);
    } catch (e: any) { setE(e.response?.data?.message || 'Reset failed'); }
    finally { setL(false); }
  };

  if (!token) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
                  justifyContent:'center', background:'linear-gradient(135deg,#667eea,#764ba2)' }}>
      <Card style={{ borderRadius:20, border:'none' }}>
        <Result status="error" title="Invalid Link"
          subTitle="This password reset link is invalid or has expired."
          extra={<Link to={ROUTES.FORGOT_PASSWORD}>
            <Button type="primary">Request New Link</Button>
          </Link>} />
      </Card>
    </div>
  );

  if (success) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
                  justifyContent:'center', background:'linear-gradient(135deg,#667eea,#764ba2)' }}>
      <Card style={{ borderRadius:20, border:'none' }}>
        <Result status="success" title="Password Reset!" subTitle="Your password has been updated successfully."
          extra={<Link to={ROUTES.LOGIN}><Button type="primary">Login Now</Button></Link>} />
      </Card>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
                  background:'linear-gradient(135deg,#667eea,#764ba2)', padding:24 }}>
      <Card style={{ width:420, borderRadius:20, boxShadow:'0 24px 48px rgba(0,0,0,0.2)', border:'none' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
                        width:56, height:56, background:'linear-gradient(135deg,#667eea,#764ba2)',
                        borderRadius:16, marginBottom:16 }}>
            <LockOutlined style={{ color:'#fff', fontSize:24 }} />
          </div>
          <Title level={3} style={{ marginBottom:4 }}>Reset Password</Title>
          <Text style={{ color:'#6b7280' }}>Enter your new password below</Text>
        </div>
        {error && <Alert message={error} type="error" showIcon closable onClose={() => setE(null)}
          style={{ marginBottom:20, borderRadius:8 }} />}
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)} size="large">
          <Form.Item label="New Password" validateStatus={errors.newPassword ? 'error' : ''} help={errors.newPassword?.message}>
            <Controller name="newPassword" control={control} render={({ field }) => (
              <Input.Password {...field} prefix={<LockOutlined style={{ color:'#9ca3af' }} />}
                placeholder="Enter new password" style={{ borderRadius:10, height:46 }} />
            )} />
          </Form.Item>
          <Form.Item label="Confirm Password" validateStatus={errors.confirmPassword ? 'error' : ''} help={errors.confirmPassword?.message}>
            <Controller name="confirmPassword" control={control} render={({ field }) => (
              <Input.Password {...field} prefix={<LockOutlined style={{ color:'#9ca3af' }} />}
                placeholder="Confirm new password" style={{ borderRadius:10, height:46 }} />
            )} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block
            style={{ height:46, borderRadius:10, fontWeight:600,
                     background:'linear-gradient(135deg,#667eea,#764ba2)', border:'none' }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </Form>
      </Card>
    </div>
  );
};
export default ResetPassword;