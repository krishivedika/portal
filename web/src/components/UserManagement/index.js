import React, { useContext, useEffect, useState } from "react";
import { Spin, Modal, Drawer, Button, Row, Col, Table, Upload, Input, Form, message, Tag, Checkbox, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, LikeOutlined } from "@ant-design/icons";

import "./index.less";
import UserService from "../../services/user";
import MobileView from "./mobileView";
import { MemberForm, StaffForm } from "../../components";
import { SharedContext } from "../../context";

const UserManagement = (props) => {
  const [users, setUsers] = useState([]);
  const [csrs, setCSRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useContext(SharedContext);

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
            <Tooltip placement="top" title='Update'>
              <Button
                type="link"
                onClick={() => review(item)}
                icon={<EditOutlined />}
              />
            </Tooltip>
          )}
          {!item.isOnboarded && (
            <Tooltip placement="top" title='Review'>
              <Button
                type="link"
                onClick={() => review(item)}
                icon={<LikeOutlined />}
              />
            </Tooltip>
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
      response.data.users.forEach(user => {
        user.age = new Date().getFullYear() - new Date(user.age).getFullYear();
      });
      setUsers(() => response.data.users);
      setCSRs(() => response.data.csrUsers);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAndUpdateUsers();
  }, []);

  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [role, setRole] = useState("");
  const [newRole, setNewRole] = useState("FARMER");

  const onRoleChange = (e) => {
    setRole(e.toUpperCase());
  };

  const onNewRoleChange = (e) => {
    setNewRole(e.toUpperCase());
  };

  const review = (item) => {
    setRole(item.roles[0]?.name);
    setSelectedItem({
      ...item, role: item.roles[0]?.name,
      csr: item.managedBy[0]?.id,
    });
    setShowDrawer(true);
  };

  const [form] = Form.useForm();
  const [staffForm] = Form.useForm();
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

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [uploadedFormData, setUploadedFormData] = useState({});
  const [downloadErrorData, setDownloadErrorData] = useState('');
  const [rows, setRows] = useState(0);
  const [badRows, setBadRows] = useState(0);
  const uploadFile = (values) => {
    const formData = new FormData();
    formData.append('file', values.file)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    setUploadedFormData(formData);
    UserService.uploadMembersCheck(formData, config).then(response => {
      setRows(response.data.entries);
      setBadRows(response.data.badEntries);
      setDownloadErrorData(response.data.csvData);
      setShowBulkModal(true);
      fetchAndUpdateUsers();
    }).catch(err => {
      message.error(err.response.data.message);
    });
  }

  const bulkUpload = () => {
    if (rows - badRows === 0) {
      message.info('No valid rows to upload');
      return;
    }
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    UserService.uploadMembers(uploadedFormData, config).then(response => {
      setShowBulkModal(false);
      message.success(response.data.message);
      fetchAndUpdateUsers();
    }).catch(err => {
      message.error(err.response.data.message);
    });
  }

  const hideBulkModal = () => {
    setShowBulkModal(false);
  }

  const downloadErrors = () => {
    if (badRows > 0) {
      const rows = [
        ['firstName', 'lastName', 'agent', 'gender', 'age', 'phone', 'ration', 'address', 'district', 'reason']
      ];
      downloadErrorData.forEach(r => {
        rows.push(Object.values(r));
      });
      let csvContent = "data:text/csv;charset=utf-8,"
        + rows.map(e => e.join(",")).join("\n");
      let encodedUri = encodeURI(csvContent);
      let link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "error_files.csv");
      document.body.appendChild(link);
      link.click();
    } else {
      message.info("No error rows to download");
    }
  }

  return (
    <>
      <Modal
        title="Bulk Insert Confirm"
        visible={showBulkModal}
        footer={null}
        onClose={hideBulkModal}
        onCancel={hideBulkModal}
      >
        <Button type="primary" onClick={bulkUpload}>Proceed Inserting {rows - badRows} valid row(s) of {rows}</Button>
        <br />
        <br />
        <Button type="danger" onClick={downloadErrors}>Download Error Rows as CSV, {badRows} row(s)</Button>
        <br />
        <br />
        <Button type="secondary" onClick={hideBulkModal}>Cancel and Exit</Button>
      </Modal>
      <Row style={{ padding: "15px", borderTop: "1px solid #90d150" }}>
        <Col xs={12} md={12} lg={12} xl={12}>
          <Form form={formSearch} layout="inline">
            <Form.Item name="search">
              <Input
                placeholder="Phone or Email"
                onPressEnter={search}
              />
            </Form.Item>
            <Form.Item name="onboarded" valuePropName="checked" style={{ fontWeight: 'bold' }}>
              <Checkbox onChange={search}>Pending Only</Checkbox>
            </Form.Item>
          </Form>
        </Col>
        <Col
          xs={10}
          md={10}
          lg={10}
          xl={10}
          offset={2}
          style={{ textAlign: "end" }}
        >
          <Button style={{ marginRight: '5px', marginBottom: '10px' }} type="primary" onClick={openNewForm}>Add New Member</Button>
          <Upload showUploadList={false} multiple={false} accept={'.csv'} customRequest={uploadFile}>
            <Button>
              <PlusOutlined /> Bulk Insert (CSV)
            </Button>
          </Upload>
        </Col>
      </Row>
      <Row style={{ padding: "0px 10px" }}>
        <Col xs={0} sm={0} md={0} lg={24} xl={24}>
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
        <Spin spinning={state.spinning} size="large">
          {role.toUpperCase() === "FARMER" && (
              <MemberForm
                type="staff"
                fields={selectedItem}
                form={form}
                onFinish={onFinish}
                csrs={csrs}
                onClose={() => setShowDrawer(false)}
                onChange={onRoleChange}
                role={role}
              />
            )}
          {role.toUpperCase() !== "FARMER" && (
              <StaffForm
                type="staff"
                fields={selectedItem}
                form={staffForm}
                onFinish={onFinish}
                onClose={() => setShowDrawer(false)}
                onChange={onRoleChange}
                role={role}
              />
            )}
        </Spin>
      </Drawer>
      <Drawer
        visible={showNewMemberDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={() => setShowNewMemberDrawer(false)}
      >
        <Spin spinning={state.spinning} size="large">
          {newRole.toUpperCase() === "FARMER" && (
              <MemberForm
                type="staff"
                new={true}
                fields={{role: newRole}}
                form={newForm}
                onFinish={openNewMemberFinish}
                csrs={csrs}
                onClose={() => setShowNewMemberDrawer(false)}
                onChange={onNewRoleChange}
                role={newRole}
                csrs={csrs}
              />
            )}
          {newRole.toUpperCase() !== "FARMER" && (
              <StaffForm
                type="staff"
                new={true}
                fields={{role: newRole}}
                form={newForm}
                onFinish={openNewMemberFinish}
                onClose={() => setShowNewMemberDrawer(false)}
                onChange={onNewRoleChange}
                role={newRole}
              />
            )}
        </Spin>
      </Drawer>
    </>
  );
};

export default UserManagement;
