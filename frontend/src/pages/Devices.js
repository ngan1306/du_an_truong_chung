import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getDevices, createDevice, updateDevice, deleteDevice } from '../api';
import './Devices.css';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [form] = Form.useForm();

  const fetchDevices = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getDevices(page, pagination.pageSize);
      setDevices(response.data.devices);
      setPagination({
        current: page,
        pageSize: pagination.pageSize,
        total: response.data.total,
      });
    } catch (error) {
      message.error('Không thể tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddDevice = () => {
    setEditingDevice(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    form.setFieldsValue(device);
    setIsModalVisible(true);
  };

  const handleDeleteDevice = async (deviceId) => {
    Modal.confirm({
      title: 'Xóa Thiết Bị',
      content: 'Bạn có chắc chắn muốn xóa thiết bị này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteDevice(deviceId);
          message.success('Xóa thành công');
          fetchDevices();
        } catch (error) {
          message.error('Không thể xóa thiết bị');
        }
      },
    });
  };

  const handleSave = async (values) => {
    try {
      if (editingDevice) {
        await updateDevice(editingDevice.id, values);
        message.success('Cập nhật thành công');
      } else {
        await createDevice(values);
        message.success('Thêm thiết bị thành công');
      }
      setIsModalVisible(false);
      fetchDevices();
    } catch (error) {
      message.error('Lỗi khi lưu thiết bị');
    }
  };

  const columns = [
    { title: 'Mã Thiết Bị', dataIndex: 'device_code', key: 'device_code' },
    { title: 'Tên Thiết Bị', dataIndex: 'device_name', key: 'device_name' },
    { title: 'Loại', dataIndex: 'device_type', key: 'device_type' },
    { title: 'Trạng Thái', dataIndex: 'status', key: 'status' },
    { title: 'Vị Trí', dataIndex: 'location', key: 'location' },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditDevice(record)} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteDevice(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="devices-container">
      <div className="devices-header">
        <h1>Quản Lý Thiết Bị</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDevice}>
          Thêm Thiết Bị
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={devices}
        loading={loading}
        pagination={pagination}
        onChange={(pag) => fetchDevices(pag.current)}
        rowKey="id"
      />

      <Modal
        title={editingDevice ? 'Chỉnh Sửa Thiết Bị' : 'Thêm Thiết Bị'}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="device_code" label="Mã Thiết Bị" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="device_name" label="Tên Thiết Bị" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="device_type" label="Loại Thiết Bị" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Trạng Thái">
            <Select options={[
              { label: 'Sẵn Có', value: 'available' },
              { label: 'Đang Bảo Trì', value: 'maintenance' },
              { label: 'Hỏng', value: 'broken' },
            ]} />
          </Form.Item>
          <Form.Item name="location" label="Vị Trí">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Devices;
