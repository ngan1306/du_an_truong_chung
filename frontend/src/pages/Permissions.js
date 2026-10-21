import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../api";

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination] = useState({ current: 1, pageSize: 10 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [form] = Form.useForm();

  const fetchPermissions = async () => {
    try {
      setLoading(true);

      const res = await getPermissions();

      setPermissions(res.data.permissions || []);

      } catch (err) {

      console.log(err);

      message.error("Không tải được danh sách quyền");

      } finally {

      setLoading(false);

      }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleAddPermission = () => {
    setEditingPermission(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditPermission = (permission) => {
    setEditingPermission(permission);
    form.setFieldsValue(permission);
    setIsModalVisible(true);
  };

  const handleDeletePermission = async (id) => {
    try {

      await deletePermission(id);

      message.success("Đã xóa");

      fetchPermissions();

    } catch (err) {

      message.error("Không thể xóa");

    }
  };

  const handleSave = async (values) => {

    try {

      if (editingPermission) {

        await updatePermission(editingPermission.id, values);

        message.success("Cập nhật thành công");

      } else {

        await createPermission(values);

        message.success("Thêm quyền thành công");

      }

      setIsModalVisible(false);

      form.resetFields();

      fetchPermissions();

    } catch (err) {

      console.log(err);

      message.error("Không thể lưu");

    }

  };

  const columns = [
    { title: 'Tên Quyền', dataIndex: 'permission_name', key: 'permission_name' },
    { title: 'Module', dataIndex: 'module', key: 'module' },
    { title: 'Mô Tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space>

        <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditPermission(record)}
        />

        <Popconfirm
            title="Bạn chắc chắn muốn xóa?"
            onConfirm={() => handleDeletePermission(record.id)}
        >

        <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
        />

        </Popconfirm>

        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1>Phân Quyền</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPermission}>
          Thêm Quyền
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={permissions}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingPermission ? 'Chỉnh Sửa Quyền' : 'Thêm Quyền'}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="permission_name" label="Tên Quyền" rules={[{ required: true }]}>
            <Input placeholder="view_users, create_user, etc." />
          </Form.Item>
          <Form.Item name="module" label="Module" rules={[{ required: true }]}>
            <Select options={[
              { label: 'Users', value: 'Users' },
              { label: 'Devices', value: 'Devices' },
              { label: 'Tasks', value: 'Tasks' },
              { label: 'Departments', value: 'Departments' },
              { label: 'Storage', value: 'Storage' },
              { label: 'Reports', value: 'Reports' },
            ]} />
          </Form.Item>
          <Form.Item name="description" label="Mô Tả">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Permissions;
