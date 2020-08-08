import React, { useEffect, useState } from "react";
import { Drawer, Button, Row, Col, Table, Upload, Input, Form, message, Tag, Checkbox, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import "./index.less";
import UserService from "../../services/user";
import MobileView from "./mobileView";
import { MemberForm, StaffForm } from "../../components";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [csrs, setCSRs] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Role",
      dataIndex: "roles",
      key: "roles",
      render: (_, item) =>
        `${item.roles[0].name.toUpperCase().replace("_", " ")}`,
    },
    {
      title: "Onboarding",
      dataIndex: "isOnboarded",
      key: "isOnboarded",
      width: 50,
      sorter: (a, b) => a.isOnboarded - b.isOnboarded,
      sortDirections: ["descend", "ascend"],
      render: (_, item) => (
        <>
          {item.isOnboarded && <Tag color="blue">Done</Tag>}
          {!item.isOnboarded && <Tag color="gold">Pending</Tag>}
        </>
      ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      sorter: (a, b) => a.isActive - b.isActive,
      sortDirections: ["descend", "ascend"],
      render: (_, item) => (
        <>
          {item.isActive && <Tag color="green">Yes</Tag>}
          {!item.isActive && <Tag color="red">No</Tag>}
        </>
      ),
    },
    {
      title: "Created On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_, item) => (
        <Tooltip
          placement="top"
          title={new Date(item.createdAt).toLocaleTimeString()}
        >
          {new Date(item.createdAt).toDateString()}
        </Tooltip>
      ),
    },
    { title: "Updated By", dataIndex: "updatedBy", key: "updatedBy" },
    {
      title: "Action",
      key: "action",
      render: (_, item) => (
        <>
          {item.isOnboarded && (
            <Button type="link" onClick={() => review(item)}>
              Update
            </Button>
          )}
          {!item.isOnboarded && (
            <Button type="link" onClick={() => review(item)}>
              Review
            </Button>
          )}
        </>
      ),
    },
  ];

  const [formSearch] = Form.useForm();

  const search = async () => {
    const values = await formSearch.validateFields();
    fetchAndUpdateUsers(values);
  };

  const fetchAndUpdateUsers = (values = { search: "" }) => {
    setLoading(true);
    UserService.getUsers({
      search: values.search || "",
      isOnboarded: values.onboarded || false,
    }).then((response) => {
      const tempUsers = [...response.data.users];
      const tempCSRs = [];
      tempUsers.forEach((user) => {
        if (user.roles[0].id === 3 || user.roles[0].id === 4) {
          tempCSRs.push(user);
        }
        if (user.age)
          user.age = new Date().getFullYear() - new Date(user.age).getFullYear();
        else user.age = undefined;
      });
      setUsers(() => tempUsers);
      setCSRs(() => tempCSRs);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAndUpdateUsers();
  }, []);

  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  const review = (item) => {
    setSelectedItem(item);
    setShowDrawer(true);
  };

  const [form] = Form.useForm();
  const onFinish = (values) => {
    let formValues = { ...values };
    formValues.id = selectedItem.id;
    if (!selectedItem.isOnboarded) {
      UserService.updateRole(formValues)
        .then(() => {
          message.success(`Member successfully updated.`);
          setShowDrawer(false);
          fetchAndUpdateUsers();
        })
        .catch((err) => {
          console.log(err);
          message.error(`Failed to update Member, ${err.response.data.message}`);
        });
    } else {
      UserService.updateProfile(formValues).then(() => {
        message.success(`Member successfully updated.`);
        setShowDrawer(false);
        fetchAndUpdateUsers();
      }).catch(err => {
        console.log(err.response);
        message.error(`Failed to update User, ${err.response.data.message}`);
      });
    }
  };

  const [showNewMemberDrawer, setShowNewMemberDrawer] = useState(false);
  const [newForm] = Form.useForm();
  const openNewMemberFinish = (values) => {
    let formValues = { ...values };
    UserService.createProfile(formValues).then(() => {
      message.success(`Member successfully created.`);
      setShowNewMemberDrawer(false);
      fetchAndUpdateUsers();
    }).catch(err => {
      console.log(err.response);
      message.error(`Failed to update Member, ${err.response.data.message}`);
    });
  }

  const openNewForm = () => {
    setShowNewMemberDrawer(true);
  }

  const uploadFile = (values) => {
    const formData = new FormData();
    formData.append('file', values.file)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    UserService.uploadMembers(formData, config).then(response => {
      message.info(response.data.message);
      fetchAndUpdateUsers();
    }).catch(err => {
      message.error(err.response.data.message);
    });
  }

  return (
    <>
      <Row style={{ padding: "15px", borderTop: "1px solid #90d150"}}>
        <Col xs={12} md={12} lg={12} xl={12}>
          <Form form={formSearch} layout="inline">
            <Form.Item name="search">
              <Input
                placeholder="Phone or Email"
                onPressEnter={search}
              />
            </Form.Item>
            <Form.Item name="onboarded" valuePropName="checked" style={{fontWeight: 'bold'}}>
              <Checkbox onChange={search}>PENDING ONLY</Checkbox>
            </Form.Item>
          </Form>
        </Col>
        <Col
          xs={10}
          md={10}
          lg={10}
          xl={10}
          offset={1}
          style={{ textAlign: "end" }}
        >
          <Button style={{marginRight: '5px'}} type="primary" onClick={openNewForm}>Add New Member</Button>
          <Upload multiple={false} accept={'.csv'} customRequest={uploadFile}>
            <Button>
              <PlusOutlined /> Upload File (CSV)
            </Button>
          </Upload>
        </Col>
      </Row>
        <Row style={{ padding: "0px 10px" }}>
        <Col xs={0} sm={0} md={window.innerWidth === 768 ? 0 : 24} lg={24} xl={24}>
          <Table
            className="g-table-striped-rows g-ant-table-cell"
            dataSource={users}
            columns={columns}
            loading={loading}
            rowKey="id"
            bordered
          />
        </Col>
      </Row>
        <MobileView
          users={users}
          review={review}
        />

      <Drawer
        visible={showDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={() => setShowDrawer(false)}
      >
        {selectedItem.roles &&
          selectedItem.roles[0].name.toUpperCase() === "FARMER" && (
            <MemberForm
              type="staff"
              fields={selectedItem}
              form={form}
              onFinish={onFinish}
              csrs={csrs}
            />
          )}
        {selectedItem.roles &&
          selectedItem.roles[0].name.toUpperCase() !== "FARMER" && (
            <StaffForm
              type="staff"
              fields={selectedItem}
              form={form}
              onFinish={onFinish}
            />
          )}
      </Drawer>
      <Drawer
        visible={showNewMemberDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={() => setShowNewMemberDrawer(false)}
      >
        <MemberForm
          type="staff"
          new={true}
          fields={{}}
          form={newForm}
          onFinish={openNewMemberFinish}
          csrs={csrs}
        />
      </Drawer>
    </>
  );
};

export default UserManagement;
