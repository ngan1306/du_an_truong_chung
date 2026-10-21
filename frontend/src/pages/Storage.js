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
  getStorage,
  createStorage,
  updateStorage,
  deleteStorage,
} from "../api";

const Storage = () => {
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination] = useState({ current: 1, pageSize: 10 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStorage, setEditingStorage] = useState(null);
  const [form] = Form.useForm();

  const fetchStorage = async () => {
    try {

      setLoading(true);

      const res = await getStorage();

      setStorages(res.data.storage || []);

    } catch (err) {

      console.log(err);

      message.error("Không tải được kho");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchStorage();
  }, []);

  const handleAddStorage = () => {
    setEditingStorage(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditStorage = (storage) => {
    setEditingStorage(storage);
    form.setFieldsValue(storage);
    setIsModalVisible(true);
  };

  const handleDeleteStorage = async (id) => {

    try {

      await deleteStorage(id);

      message.success("Đã xóa");

      fetchStorage();

    } catch (err) {

      message.error("Không thể xóa");

    }

  };

  const handleSave = async (values) => {

    try {

      if (editingStorage) {

        await updateStorage(
          editingStorage.id,
          values
        );

        message.success("Cập nhật thành công");

      } else {

        await createStorage(values);

        message.success("Thêm kho thành công");

      }

      setIsModalVisible(false);

      form.resetFields();

      fetchStorage();

    } catch (err) {

      console.log(err);

      message.error("Không lưu được");

    }

};

  const columns = [
    { title: 'Tên Kho', dataIndex: 'storage_name', key: 'storage_name' },
    { title: 'Loại', dataIndex: 'storage_type', key: 'storage_type' },
    { title: 'Vị Trí', dataIndex: 'location', key: 'location' },
    { title: 'Dung Tích', dataIndex: 'capacity', key: 'capacity', render: (c) => c + ' m²' },
    { title: 'Sử Dụng', dataIndex: 'current_usage', key: 'current_usage', render: (u, r) => `${u}/${r.capacity}` },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space>

        <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditStorage(record)}
        />

        <Popconfirm
            title="Bạn chắc chắn muốn xóa?"
            onConfirm={() => handleDeleteStorage(record.id)}
        >

        <Button
            danger
            type="link"
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
        <h1>Quản Lý Bộ Lưu Trữ</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStorage}>
          Thêm Kho
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={storages}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingStorage ? 'Chỉnh Sửa Kho' : 'Thêm Kho'}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="storage_name" label="Tên Kho" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="storage_type" label="Loại Kho" rules={[{ required: true }]}>
            <Select options={[
              { label: 'Phòng', value: 'Room' },
              { label: 'Tủ', value: 'Cabinet' },
              { label: 'Kệ', value: 'Shelf' },
            ]} />
          </Form.Item>
          <Form.Item name="location" label="Vị Trí" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="capacity" label="Dung Tích (m²)" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Storage;
