import React, { useState, useEffect } from "react";
import { Row, Col, Card, Skeleton, Form, message, Button, Drawer, Descriptions } from "antd";

import AuthService from "../../services/auth";
import UserService from "../../services/user";
import { MemberForm, StaffForm } from "../../components";
import profileImage from "../../images/profile.jpg";

const UserProfile = () => {

  const [userProfile, setUserProfile] = useState({});
  const [currentForm, setCurrentForm] = useState({});
  const [showDrawer, setShowDrawer] = useState(false);
  const [loading, setLoading] = useState(true);

  const setAge = (response) => {
    if (response.data.user.age) response.data.user.age = new Date().getFullYear() - new Date(response.data.user.age).getFullYear();
    else response.data.user.age = undefined;
  }
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    UserService.getUser({ id: user.id }).then(response => {
      setAge(response);
      setUserProfile(() => response.data.user);
      setCurrentForm(() => response.data.user);
    }).catch(err => {
      console.log(err);
      message.error(`Failed to get user, ${err.response.data.message}`);
    });
  }, []);

  useEffect(() => {
    setLoading(false);
  }, [userProfile]);

  const [form] = Form.useForm();
  const onFinish = (values) => {
    let formValues = { ...values };
    formValues.id = userProfile.id;
    formValues.role = userProfile.roles[0].name;
    UserService.updateProfile(formValues).then(response => {
      setAge(response);
      setUserProfile(response.data.user);
      setCurrentForm(response.data.user);
      message.success(`User successfully updated.`);
      setShowDrawer(false);
    }).catch(err => {
      console.log(err);
      setCurrentForm(state => ({...state, ...values}))
      message.error(`Failed to update User, ${err.response.data.message}`);
    });
  }

  return (
    <Row style={{ marginTop: '20px' }}>
      <Col xs={0} xl={12}>
        <div>
          <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%' }} />
        </div>
      </Col>
      <Col xs={24} xl={12}>
        <Row>
          <Col xs={{ span: 22, offset: 1 }} xl={{ span: 22 }}>
            {loading &&
              <>
                <Skeleton active />
                <Skeleton active />
                <Skeleton active />
                <Skeleton active />
              </>
            }
                <Button type="primary" onClick={() => setShowDrawer(true)}>Update Profile</Button>
                <Card title="Profile" className="g-ant-card" style={{ marginTop: '20px' }}>
                  <Descriptions loading={loading} column={1} bordered>
                    <Descriptions.Item label="First Name">{userProfile.firstName} </Descriptions.Item>
                    <Descriptions.Item label="Last Name">{userProfile.lastName}</Descriptions.Item>
                    <Descriptions.Item label="Gender">{userProfile.gender}</Descriptions.Item>
                    {userProfile.age &&
                      <Descriptions.Item label="Age">{userProfile.age}</Descriptions.Item>
                    }
                    {!userProfile.age &&
                      <Descriptions.Item label="Age"></Descriptions.Item>
                    }
                    <Descriptions.Item label="Email">{userProfile.email}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{userProfile.phone}</Descriptions.Item>
                    {userProfile.roles && userProfile.roles[0].name.toUpperCase() === 'FARMER' &&
                      <>
                        <Descriptions.Item label="Ration">{userProfile.ration}</Descriptions.Item>
                      </>
                    }
                  </Descriptions>
                </Card>
          </Col>
          <Col xs={{ span: 22, offset: 1 }} xl={{ span: 22 }}>
            {loading &&
              <>
                <Skeleton active />
                <Skeleton active />
                <Skeleton active />
                <Skeleton active />
              </>
            }
                <Card title="Demographics" className="g-ant-card" style={{ marginTop: '20px' }}>
                  <Descriptions loading={loading} column={1} bordered >
                    <Descriptions.Item label="Address">{userProfile.address}</Descriptions.Item>
                    {userProfile.roles && userProfile.roles[0].name.toUpperCase() === 'FARMER' &&
                      <>
                        <Descriptions.Item label="District">{userProfile.district}</Descriptions.Item>
                        <Descriptions.Item label="Mandala">{userProfile.mandala}</Descriptions.Item>
                        <Descriptions.Item label="Panchayat">{userProfile.panchayat}</Descriptions.Item>
                        <Descriptions.Item label="Hamlet">{userProfile.hamlet}</Descriptions.Item>
                      </>
                    }
                  </Descriptions>
                </Card>
          </Col>
        </Row>
      </Col>
      <Drawer visible={showDrawer} width={window.innerWidth > 768 ? 900 : window.innerWidth} onClose={() => setShowDrawer(false)}>
        {userProfile.roles && userProfile.roles[0].name.toUpperCase() === 'FARMER' &&
          <MemberForm type="self" fields={currentForm} form={form} onFinish={onFinish} />
        }
        {userProfile.roles && userProfile.roles[0].name.toUpperCase() !== 'FARMER' &&
          <StaffForm type="self" fields={currentForm} form={form} onFinish={onFinish} />
        }
      </Drawer>
    </Row>
  );
}

export default UserProfile;
