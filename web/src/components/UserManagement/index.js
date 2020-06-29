import React, { useEffect, useState } from "react";
import { Drawer, Button, Card, Row, Col, Table, Input, Form, message, Tag } from "antd";

import UserService from "../../services/user";
import { MemberForm, StaffForm } from "../../components";

const UserManagement = () => {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (_, item) => (
        <>
        {new Date(item.createdAt).toDateString()}
        </>
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

  const [searchString, setSearchString] = useState('');

  const search = () => {
    fetchAndUpdateUsers();
  };

  const fetchAndUpdateUsers = () => {
    setLoading(true);
    UserService.getUsers({ search: searchString}).then(response => {
      setUsers(() => {
        return response.data.users;
      });
      setLoading(false);
    })
  };

  useEffect(() => {
    fetchAndUpdateUsers();
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
        message.error(`Failed to update User, reason: ${err.response.data.message}`);
      });
    } else {
      UserService.updateProfile(formValues).then(() => {
        message.success(`User successfully updated.`);
        setShowDrawer(false);
        fetchAndUpdateUsers();
      }).catch(err => {
        console.log(err);
        message.error(`Failed to update User, reason: ${err.response.data.message}`);
      });
    }
  }

  return (
    <>
      <Row gutter={4}>
        <Col xs={24} lg={5}>
          <Card title="Filters">
            <Form form={form}>
              <Form.Item name='search'>
                <Input placeholder='Search By Phone or Email' onPressEnter={search} onChange={e => setSearchString(e.target.value)}/>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={19}>
          <Table dataSource={users} columns={columns} loading={loading} rowKey='id' />
        </Col>
      </Row>
      <Drawer visible={showDrawer} width={920} onClose={() => setShowDrawer(false)}>
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
