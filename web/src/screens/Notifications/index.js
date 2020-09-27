import React, { useEffect, useContext, useState } from "react";
import { Row, Col, Table, Form, Checkbox, Tooltip, Button, message, notification } from "antd";
import { useHistory } from "react-router-dom";

import NotificationService from "../../services/notification";
import { SharedContext } from "../../context";
import { CheckCircleFilled, UnorderedListOutlined } from "@ant-design/icons";
import Routes from "../../routes";
import MobileView from "./mobileView";

const Notifications = (props) => {

  const columns = [
    { title: "Text", dataIndex: "text", key: "text" },
    { title: "Notified On", dataIndex: "createdAt", key: "createdAt", render: (_, item) => (<>{new Date(item.createdAt).toDateString()} {new Date(item.createdAt).toTimeString().slice(0,8) }</>) },
    {
      title: "Action",
      key: "action",
      render: (_, item) => (
        <>
          {!item.isRead &&
            <Tooltip placement="top" title='Action'>
              <Button type="link" icon={<UnorderedListOutlined />} onClick={() => action()}></Button>
            </Tooltip>
          }
          {!item.isRead &&
            <Tooltip placement="top" title='Mark Read'>
              <Button type="link" icon={<CheckCircleFilled />} onClick={() => updateNotifications(item.id)}></Button>
            </Tooltip>
          }
        </>
      ),
    },
  ];

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useContext(SharedContext);

  const history = useHistory();
  const action = () => {
    history.push(Routes.TASKS);
  };

  const [formSearch] = Form.useForm();

  const search = async () => {
    const values = await formSearch.validateFields();
    NotificationService.getNotifications(values).then(response => {
      setNotifications(() => response.data.notifications);
      setState((state) => ({...state, notificationCount: response.data.notifications.filter(x => x.isRead == false).length}));
      setLoading(false);
    });
  };

  const updateNotifications = (id) => {
    setLoading(true);
    NotificationService.updateNotification({id}).then(response => {
      setNotifications(() => response.data.notifications);
      setState((state) => ({...state, notificationCount: response.data.notifications.filter(x => x.isRead == false).length}));
      setLoading(false);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

  useEffect(() => {
    setLoading(true);
    NotificationService.getNotifications().then(response => {
      setNotifications(() => response.data.notifications);
      setState((state) => ({...state, notificationCount: response.data.notifications.filter(x => x.isRead == false).length}));
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Row style={{ padding: "10px", borderTop: "1px solid #90d150" }}>
        <Col xs={12} md={12} lg={14} xl={14}>
          <Form form={formSearch} layout="inline">
            <Form.Item name="read" valuePropName="checked" style={{ fontWeight: 'bold' }}>
              <Checkbox onChange={search}>Include Read</Checkbox>
            </Form.Item>
          </Form>
        </Col>
        <Col
          xs={10}
          md={10}
          lg={8}
          xl={8}
          offset={2}
          style={{ textAlign: "end" }}
        >
          <Button type="primary" onClick={() => updateNotifications("all")}>
            Mark All as Read
          </Button>
        </Col>
      </Row>
      <Row style={{ padding: "10px" }}>
        <Col
          xs={0}
          sm={0}
          md={window.innerWidth === 768 ? 0 : 24}
          lg={24}
          xl={24}
        >
          <Table
            className="g-table-striped-rows g-ant-table-cell"
            rowClassName={(record, index) => !record.isRead ? '' : 'g-table-striped-rows-danger'}
            ellipses={true}
            dataSource={notifications}
            columns={columns}
            loading={loading}
            rowKey="id"
            bordered
          />
        </Col>
      </Row>
      <MobileView
        notifications={notifications}
        action={action}
        mark={updateNotifications}
      />
    </>
  );
}

export default Notifications;
