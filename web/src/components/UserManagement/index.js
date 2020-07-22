import React, { useEffect, useState } from "react";
import { Drawer, Button, Card, Row, Col, Table, Input, Form, message, Tag, Checkbox, Tooltip } from "antd";

import "./index.less"
import UserService from "../../services/user";
import { MemberForm, StaffForm } from "../../components";

const UserManagement = () => {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Role',
      dataIndex: 'roles',
      key: 'roles',
      render: (_, item) => (
        `${item.roles[0].name.toUpperCase().replace("_", " ")}`
      ),
    },
    {
      title: 'Onboarding',
      dataIndex: 'isOnboarded',
      key: 'isOnboarded',
      sorter: (a, b) => a.isOnboarded - b.isOnboarded,
      sortDirections: ['descend', 'ascend'],
      render: (_, item) => (
        <>
          {item.isOnboarded &&
            <Tag color="blue">Done</Tag>
          }
          {!item.isOnboarded &&
            <Tag color="gold">Pending</Tag>
          }
        </>
      ),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      sorter: (a, b) => a.isActive - b.isActive,
      sortDirections: ['descend', 'ascend'],
      render: (_, item) => (
        <>
          {item.isActive &&
            <Tag color="green">Yes</Tag>
          }
          {!item.isActive &&
            <Tag color="red">No</Tag>
          }
        </>
      ),
    },
    {
      title: 'Created On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (_, item) => (
        <Tooltip placement="top" title={new Date(item.createdAt).toLocaleTimeString()}>
          {new Date(item.createdAt).toDateString()}
        </Tooltip>
      )
    },
    {
      title: 'Updated By',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, item) => (
        <>
          {item.isOnboarded &&
            <Button type="link" onClick={() => review(item)}>Update</Button>
          }
          {!item.isOnboarded &&
            <Button type="link" onClick={() => review(item)}>Review</Button>
          }
        </>
      ),
    },
  ];

  const [formSearch] = Form.useForm();

  const search = async () => {
    const values = await formSearch.validateFields();
    fetchAndUpdateUsers(values);
  };

  const fetchAndUpdateUsers = (values={search: ''}) => {
    setLoading(true);
    UserService.getUsers({ search: values.search || '', isOnboarded: values.onboarded || false}).then(response => {
      const tempUsers = [...response.data.users];
      tempUsers.forEach(user => {
        if (user.age) user.age = new Date().getFullYear() - new Date(user.age).getFullYear();
        else user.age = undefined;
      });
      setUsers(() => tempUsers);
      setLoading(false);
    })
  };

  const handleWindowResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    fetchAndUpdateUsers();
    window.addEventListener("load", handleWindowResize);
    window.addEventListener("resize", handleWindowResize);
  }, []);

  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  const review = (item) => {
    setSelectedItem(item);
    setShowDrawer(true);
  }

  const [form] = Form.useForm();
  const onFinish = (values) => {
    let formValues = { ...values };
    formValues.id = selectedItem.id;
    if (!selectedItem.isOnboarded) {
      UserService.updateRole(formValues).then(() => {
        message.success(`User successfully updated.`);
        setShowDrawer(false);
        fetchAndUpdateUsers();
      }).catch(err => {
        console.log(err);
        message.error(`Failed to update User, ${err.response.data.message}`);
      });
    } else {
      UserService.updateProfile(formValues).then(() => {
        message.success(`User successfully updated.`);
        setShowDrawer(false);
        fetchAndUpdateUsers();
      }).catch(err => {
        console.log(err.response);
        message.error(`Failed to update User, ${err.response.data.message}`);
      });
    }
  }

  return (
    <>
      <Row style={{ padding: '10px' }}>
        <Col xs={24} lg={4}>
          <Card title="Filters" className={!isMobile ? "c-ant-card g-ant-card" : "g-ant-card"}>
            <Form form={formSearch} layout="vertical">
              <Form.Item name='search' label="Search">
                <Input placeholder='Search By Phone or Email' onPressEnter={search} />
              </Form.Item>
              <Form.Item name="onboarded" label="Onboarded" valuePropName="checked">
                <Checkbox onChange={search}>
                  Pending Only
                </Checkbox>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={20}>
          <Table className="g-table-striped-rows g-ant-table-cell" dataSource={users} columns={columns} loading={loading} rowKey='id' scroll={{x: true}}/>
        </Col>
      </Row>
      <Drawer visible={showDrawer} width={window.innerWidth > 768 ? 900 : window.innerWidth} onClose={() => setShowDrawer(false)}>
        {selectedItem.roles && selectedItem.roles[0].name.toUpperCase() === 'FARMER' &&
          <MemberForm type="sadmin" fields={selectedItem} form={form} onFinish={onFinish} />
        }
        {selectedItem.roles && selectedItem.roles[0].name.toUpperCase() !== 'FARMER' &&
          <StaffForm type="sadmin" fields={selectedItem} form={form} onFinish={onFinish} />
        }
      </Drawer>
    </>
  );
}

export default UserManagement;
