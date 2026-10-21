import React, { useState, useEffect } from 'react';
import { Table, message, Tag } from 'antd';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      // Simulate API call
      const mockData = [
        { id: 1, user_id: 1, action: 'CREATE', module: 'Devices', entity_type: 'Device', entity_id: 5, created_at: '2024-01-15 10:30' },
        { id: 2, user_id: 2, action: 'UPDATE', module: 'Tasks', entity_type: 'Task', entity_id: 12, created_at: '2024-01-15 10:15' },
        { id: 3, user_id: 1, action: 'DELETE', module: 'Users', entity_type: 'User', entity_id: 8, created_at: '2024-01-15 09:45' },
        { id: 4, user_id: 3, action: 'LOGIN', module: 'Auth', entity_type: 'User', entity_id: 3, created_at: '2024-01-15 08:00' },
        { id: 5, user_id: 2, action: 'UPDATE', module: 'Devices', entity_type: 'Device', entity_id: 3, created_at: '2024-01-14 15:30' },
      ];
      setLogs(mockData);
      setPagination({ current: page, pageSize: 10, total: mockData.length });
    } catch (error) {
      message.error('Không thể tải nhật ký');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (action) => {
    const colors = { CREATE: 'green', UPDATE: 'blue', DELETE: 'red', LOGIN: 'purple' };
    return colors[action] || 'default';
  };

  const columns = [
    { 
      title: 'Người Dùng ID', 
      dataIndex: 'user_id', 
      key: 'user_id',
      width: 100
    },
    { 
      title: 'Hành Động', 
      dataIndex: 'action', 
      key: 'action',
      render: (action) => <Tag color={getActionColor(action)}>{action}</Tag>,
      width: 100
    },
    { 
      title: 'Module', 
      dataIndex: 'module', 
      key: 'module',
      width: 120
    },
    { 
      title: 'Loại Entity', 
      dataIndex: 'entity_type', 
      key: 'entity_type',
      width: 120
    },
    { 
      title: 'ID Entity', 
      dataIndex: 'entity_id', 
      key: 'entity_id',
      width: 100
    },
    { 
      title: 'Thời Gian', 
      dataIndex: 'created_at', 
      key: 'created_at',
      width: 180
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1>Nhật Ký Hệ Thống</h1>
      </div>

      <Table
        columns={columns}
        dataSource={logs}
        loading={loading}
        pagination={pagination}
        onChange={(pag) => fetchLogs(pag.current)}
        rowKey="id"
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default Logs;
