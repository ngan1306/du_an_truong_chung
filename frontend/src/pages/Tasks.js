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
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../api";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();

  const fetchTasks = async () => {

    try {

      setLoading(true);

      const res = await getTasks();

      setTasks(res.data.tasks || []);

    } catch (err) {

      console.log(err);

      message.error("Không tải được công việc");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = () => {
    setEditingTask(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    form.setFieldsValue(task);
    setIsModalVisible(true);
  };

  const handleDeleteTask = async (id) => {

    try {

      await deleteTask(id);

      message.success("Đã xóa");

      fetchTasks();

    } catch (err) {

      console.log(err);

      message.error("Không thể xóa");

    }

  };

  const handleSave = async (values) => {

    try {

      if (editingTask) {

        await updateTask(editingTask.id, values);

        message.success("Cập nhật thành công");

      } else {

        await createTask(values);

        message.success("Thêm thành công");

      }

      setIsModalVisible(false);

      form.resetFields();

      fetchTasks();

    } catch (err) {

      console.log(err);

      message.error("Không lưu được");

    }

  };

  const columns = [
    { title: 'Tên Công Việc', dataIndex: 'task_name', key: 'task_name' },
    { title: 'Mô Tả', dataIndex: 'description', key: 'description', width: 200 },
    { title: 'Ưu Tiên', dataIndex: 'priority', key: 'priority' },
    { title: 'Trạng Thái', dataIndex: 'status', key: 'status' },
    { title: 'Tiến Độ', dataIndex: 'progress', key: 'progress', render: (p) => `${p}%` },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space>

        <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditTask(record)}
        />

        <Popconfirm
            title="Bạn chắc chắn muốn xóa?"
            onConfirm={() => handleDeleteTask(record.id)}
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
        <h1>Quản Lý Công Việc</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTask}>
          Thêm Công Việc
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tasks}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingTask ? 'Chỉnh Sửa Công Việc' : 'Thêm Công Việc'}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="task_name" label="Tên Công Việc" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô Tả">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="priority" label="Ưu Tiên">
            <Select options={[
              { label: 'Thấp', value: 'low' },
              { label: 'Trung Bình', value: 'medium' },
              { label: 'Cao', value: 'high' },
            ]} />
          </Form.Item>
          <Form.Item name="status" label="Trạng Thái">
            <Select options={[
              { label: 'Chờ Xử Lý', value: 'pending' },
              { label: 'Đang Thực Hiện', value: 'in_progress' },
              { label: 'Hoàn Thành', value: 'completed' },
            ]} />
          </Form.Item>
          <Form.Item name="progress" label="Tiến Độ (%)">
            <Input type="number" min="0" max="100" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tasks;
