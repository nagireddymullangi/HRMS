import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link }        from 'react-router-dom';
import { Alert, Button, Input, Form, Card, Typography, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { authApi }               from '../../api/authApi';
import { ForgotPasswordRequest } from '../../types/auth.types';
import { forgotPasswordSchema }  from '../../utils/validators';
import { ROUTES }                from '../../constants';

const { Title, Text } = Typography;

const ForgotPassword: React.FC = () => {
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error,   setError]       = useState<string|null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordRequest>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordRequest) => {
    setLoading(true); setError(null);
    try {
      const res = await authApi.forgotPassword(data);
      if (res.success) setSuccess(true); else setError(res.message);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
                  background:'linear-gradient(135deg,#667eea,#764ba2)' }}>
      <Card style={{ width:440, borderRadius:20, boxShadow:'0 24px 48px rgba(0,0,0,0.2)', border:'none' }}>
        <Result status="success" title="Email Sent!" icon={<MailOutlined style={{ color:'#6366f1' }} />}
          subTitle="We've sent a password reset link to your email. Please check your inbox."
          extra={<Link to={ROUTES.LOGIN}>
            <Button type="primary" style={{ borderRadius:10, background:'linear-gradient(135deg,#667eea,#764ba2)', border:'none' }}>
              Back to Login
            </Button>
          </Link>} />
      </Card>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
                  background:'linear-gradient(135deg,#667eea,#764ba2)', padding:24 }}>
      <Card style={{ width:440, borderRadius:20, boxShadow:'0 24px 48px rgba(0,0,0,0.2)', border:'none' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
                        width:56, height:56, background:'linear-gradient(135deg,#667eea,#764ba2)',
                        borderRadius:16, marginBottom:16 }}>
            <MailOutlined style={{ color:'#fff', fontSize:24 }} />
          </div>
          <Title level={3} style={{ marginBottom:6 }}>Forgot Password?</Title>
          <Text style={{ color:'#6b7280' }}>Enter your email to receive a reset link</Text>
        </div>

        {error && <Alert message={error} type="error" showIcon closable
          onClose={() => setError(null)} style={{ marginBottom:20, borderRadius:8 }} />}

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)} size="large">
          <Form.Item label="Email Address"
            validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
            <Controller name="email" control={control} render={({ field }) => (
              <Input {...field} prefix={<MailOutlined style={{ color:'#9ca3af' }} />}
                placeholder="your@email.com" style={{ borderRadius:10, height:46 }} />
            )} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block
            style={{ height:46, borderRadius:10, fontWeight:600,
                     background:'linear-gradient(135deg,#667eea,#764ba2)', border:'none' }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </Form>

        <div style={{ textAlign:'center', marginTop:20 }}>
          <Link to={ROUTES.LOGIN} style={{ color:'#6366f1', display:'inline-flex', alignItems:'center', gap:6 }}>
            <ArrowLeftOutlined /> Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
};
export default ForgotPassword;