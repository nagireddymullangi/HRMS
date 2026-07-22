import React from 'react';
import { Modal, Typography } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;
interface Props {
  title: string; message: string; open: boolean;
  onConfirm: () => void; onCancel: () => void;
  type?: 'danger'|'warning'|'info'; loading?: boolean;
  confirmText?: string; cancelText?: string;
}

const icons = {
  danger:  <DeleteOutlined style={{ color:'#ef4444', fontSize:22 }} />,
  warning: <ExclamationCircleOutlined style={{ color:'#f59e0b', fontSize:22 }} />,
  info:    <QuestionCircleOutlined style={{ color:'#2563eb', fontSize:22 }} />,
};

const ConfirmDialog: React.FC<Props> = ({
  title, message, open, onConfirm, onCancel,
  type = 'info', loading = false, confirmText = 'Confirm', cancelText = 'Cancel',
}) => (
  <Modal open={open} onOk={onConfirm} onCancel={onCancel}
    okText={confirmText} cancelText={cancelText}
    okButtonProps={{ danger: type === 'danger', loading, style: { borderRadius:8 } }}
    cancelButtonProps={{ style: { borderRadius:8 } }}
    centered width={420} closable={!loading} maskClosable={!loading}>
    <div style={{ display:'flex', gap:16, padding:'8px 0' }}>
      <div style={{ flexShrink:0, paddingTop:2 }}>{icons[type]}</div>
      <div>
        <div style={{ fontWeight:600, fontSize:16, marginBottom:6 }}>{title}</div>
        <Text style={{ color:'#6b7280' }}>{message}</Text>
      </div>
    </div>
  </Modal>
);
export default ConfirmDialog;