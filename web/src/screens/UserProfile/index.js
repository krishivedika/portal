import React, { useState, useEffect } from "react";
import { List, Row, Col, Card, Skeleton, Form, message, Button, Drawer, Descriptions } from "antd";
import { SmileTwoTone } from '@ant-design/icons';

import AuthService from "../../services/auth";
import UserService from "../../services/user";
import { MemberForm, StaffForm } from "../../components";

const UserProfile = () => {

  const [userProfile, setUserProfile] = useState({});
  const [showDrawer, setShowDrawer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    UserService.getUser({ id: user.id }).then(response => {
      setUserProfile(() => {
        return response.data.user;
      });
      setLoading(false);
    }).catch(err => {
      console.log(err);
      message.error(`Failed to get user, reason: ${err.response.data.message}`);
    });
  }, []);

  const [form] = Form.useForm();
  const onFinish = (values) => {
    let formValues = { ...values };
    formValues.id = userProfile.id;
    UserService.updateProfile(formValues).then(response => {
      console.log(response.data);
      setUserProfile(response.data.user);
      message.success(`User successfully updated.`);
      setShowDrawer(false);
    }).catch(err => {
      console.log(err);
      message.error(`Failed to update User, reason: ${err.response.data.message}`);
    });
  }

  return (
    <Row style={{ marginTop: '20px' }}>
      <Col xs={{ span: 22, offset: 1 }} xl={{ span: 20, offset: 2 }}>
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={[userProfile]}
          renderItem={item => (
            <Card>
              <List.Item
                actions={[<Button key="update" onClick={() => setShowDrawer(true)}>Update</Button>]}>
                <List.Item.Meta
                  avatar={<SmileTwoTone style={{ fontSize: '40px' }} />}
                  title={`Welcome, ${item.firstName} ${item.lastName}`}
                  description={`Email: ${item.phone}`}
                />
              </List.Item>
            </Card>
          )}
        />
      </Col>
      <Col xs={{ span: 22, offset: 1 }} xl={{ span: 9, offset: 2 }}>
        {loading &&
          <>
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </>
        }
        {!loading &&
          <>
            <Card title="Profile" style={{ marginTop: '20px' }}>
              <Descriptions column={2}>
                <Descriptions.Item label="Name">{userProfile.firstName} {userProfile.lastName}</Descriptions.Item>
                <Descriptions.Item label="Telephone">{userProfile.phone}</Descriptions.Item>
                <Descriptions.Item label="Email">{userProfile.email}</Descriptions.Item>
                <Descriptions.Item label="Age">{userProfile.age}</Descriptions.Item>
                <Descriptions.Item label="Gender">{userProfile.gender}</Descriptions.Item>
                <Descriptions.Item label="Ration">{userProfile.ration}</Descriptions.Item>
              </Descriptions>
            </Card>
          </>
        }
      </Col>
      <Col xs={{ span: 22, offset: 1 }} xl={{ span: 9, offset: 2 }}>
        {loading &&
          <>
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </>
        }
        {!loading &&
          <>
            <Card title="Location Demographics" style={{ marginTop: '20px' }}>
              <Descriptions column={2}>
                <Descriptions.Item label="Address" span={2}>
                  {userProfile.address}
                </Descriptions.Item>
                <Descriptions.Item label="District">{userProfile.district}</Descriptions.Item>
                <Descriptions.Item label="Mandala">{userProfile.mandala}</Descriptions.Item>
                <Descriptions.Item label="Panchayat">{userProfile.panchayat}</Descriptions.Item>
                <Descriptions.Item label="Hamlet">{userProfile.hamlet}</Descriptions.Item>
              </Descriptions>
            </Card>
          </>
        }
      </Col>
      <Drawer visible={showDrawer} width={window.innerWidth > 800 ? 900 : window.innerWidth} onClose={() => setShowDrawer(false)}>
        {userProfile.roles && userProfile.roles[0].name.toUpperCase() === 'FARMER' &&
          <MemberForm type="self" fields={userProfile} form={form} onFinish={onFinish} />
        }
        {userProfile.roles && userProfile.roles[0].name.toUpperCase() !== 'FARMER' &&
          <StaffForm type="self" fields={userProfile} form={form} onFinish={onFinish} />
        }
      </Drawer>
    </Row>
  );
}

export default UserProfile;
