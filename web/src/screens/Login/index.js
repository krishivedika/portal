import React, { useContext, useState, useEffect } from "react";
import axios from 'axios';
import { Form, Input, Button, Row, Col, Tabs, Typography, message } from "antd";

import "./index.css";
import AuthService from "../../services/auth.js";
import Routes from "../../routes";
import farmerImage from "../../images/banner.jpg";
import { SharedContext } from "../../context";

const { TabPane } = Tabs;
const { Text } = Typography;

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 6, span: 16 },
};

let retries = 0;

const Login = (props) => {

  const [_, setState] = useContext(SharedContext);
  const [form] = Form.useForm();
  const [tab, setTab] = useState('member');
  const [otpButton, setOtpButton] = useState(true);
  const [loginButton, setLoginButton] = useState(false);
  const [resendOtpButton, setResendOtpButton] = useState(false);

  const handleLogin = (values) => {
    if (tab === 'member') {
      AuthService.login({ phone: values.phone, otp: values.otp }).then(response => {
        let currentUser;
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
          axios.defaults.headers.common['x-access-token'] = response.data.accessToken;
          currentUser = AuthService.getCurrentUser();
          setState(state => ({ ...state, user: currentUser }));
          redirectUser(currentUser.roles[0])
        }
      }).catch((err) => {
        console.log(err);
        if (err.response.data.code === 1) {
          retries += 1;
          if (retries === 3) {
            localStorage.setItem("otp_retries_time", new Date());
            setLoginButton(false);
          }
        }
        message.error(`Login Failed, reason: ${err.response.data.message}`);
      });
    } else if (tab === 'staff') {
      AuthService.staffLogin({ email: values.email, password: values.password }).then(response => {
        let currentUser;
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
          axios.defaults.headers.common['x-access-token'] = response.data.accessToken;
          currentUser = AuthService.getCurrentUser();
          setState(state => ({ ...state, user: currentUser }));
          redirectUser(currentUser.roles[0]);
        }
      }).catch((err) => {
        console.log(err);
        message.error(`Login Failed, reason: ${err.response.data.message}`);
      });
    }
  };

  const redirectUser = (role) => {
    if (role === 'FARMER') props.history.push(Routes.PROFILE);
    else if (role === 'SADMIN') props.history.push(Routes.ADMIN);
    else props.history.push(Routes.USERMANAGEMENT);
  };

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) redirectUser(currentUser.roles[0]);
  });

  const sendOtp = async () => {
    setLoginButton(true);
    try {
      await form.validateFields();
      setOtpButton(false);
      requestOtp();
    } catch (err) {
      console.log(err);
    }
  };

  const resendOtp = async () => {
    try {
      await form.validateFields();
      setResendOtpButton(false);
      requestOtp();
    } catch (err) {
      console.log(err);
    }
  };

  const showOtpsentMessage = (success) => {
    if (success) message.info('OTP sent to your mobile.');
    else message.error('Failed to send OTP, try again later.');
  };

  const otpRetryError = 'Maximum retries reached, try after 1 Hour.';
  const requestOtp = async () => {
    const checkOtpRetries = new Date(localStorage.getItem("otp_retries_time"));
    if ((new Date() - checkOtpRetries) > (60 * 60 * 1000)) {
      setTimeout(() => {
        setResendOtpButton(true);
      }, 1000 * 12);
      let values;
      try {
        values = await form.validateFields();
        setOtpButton(false);
        AuthService.requestOtp({ phone: values.phone }).then(() => {
          showOtpsentMessage((true))
        }).catch(err => {
          console.log(err.response.data);
          showOtpsentMessage(false);
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      setLoginButton(false);
      message.error(otpRetryError);
    }
  };

  return (
    <Row>
      <div className="farmer-image">
        <img src={farmerImage} alt="FarmerFirst" />
      </div>
      <Col xs={1} sm={4} md={4} lg={6} xl={8}></Col>
      <Col xs={22} sm={16} md={16} lg={12} xl={8}>
        <Tabs style={{ margin: '50px' }} onChange={(e) => setTab(e)}>
          <TabPane tab='Member Login' key='member'>
            <Form {...layout} initialValues={{ remember: true }}
              form={form}
              onFinish={handleLogin}>
              {tab === 'member' &&
                <>
                  <Form.Item name="phone" label="Phone"
                    rules={[
                      {
                        required: true,
                        message: "Please input your Phone No.",
                      },
                      { min: 10, message: 'Phone numbers should be 10 digits long.' },
                      { max: 10, message: 'Phone numbers should be 10 digits long.' },
                    ]}>
                    <Input placeholder="Enter your Phone No." />
                  </Form.Item>
                  {!otpButton &&
                    <Form.Item name="otp" label="OTP"
                      rules={[
                        {
                          required: true,
                          message: "Please input OTP.",
                        },
                        { min: 6, message: 'OTP must be 6 digits long.' },
                        { max: 6, message: 'OTP must be 6 digits long.' },
                      ]}>
                      <Input placeholder="Enter your OTP" />
                    </Form.Item>
                  }
                  {!otpButton &&
                    <Form.Item {...tailLayout}>
                      {loginButton &&
                        <Button type="primary" htmlType="submit">Log in</Button>
                      }
                      {!loginButton &&
                        <Text type="danger">{otpRetryError}</Text>
                      }
                      {resendOtpButton && loginButton &&
                        <Button type="link" onClick={resendOtp}>Resend OTP</Button>
                      }
                    </Form.Item>
                  }
                  {otpButton &&
                    <Form.Item {...tailLayout}>
                      <Button type="primary" onClick={sendOtp}>Send OTP</Button>
                    </Form.Item>
                  }
                </>
              }
            </Form>
          </TabPane>
          <TabPane tab='Staff Login' key='staff'>
            <Form {...layout} initialValues={{ remember: true }}
              form={form}
              onFinish={handleLogin}>
              {tab === 'staff' &&
                <>
                  <Form.Item name="email" label="Email"
                    rules={[
                      {
                        required: true,
                        message: "Please input your Email.",
                      },
                      { type: 'email' },
                    ]}>
                    <Input placeholder="Enter your Email" />
                  </Form.Item>
                  <Form.Item name="password" label="Password"
                    rules={[
                      {
                        required: true,
                        message: "Please input Password.",
                      },
                      { min: 6, message: 'Password must be atleast 6 characters long.' },
                    ]}>
                    <Input.Password placeholder="Enter your Password" />
                  </Form.Item>
                  <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">Log in</Button>
                    <Button type="link">Forgot Password</Button>
                  </Form.Item>
                </>
              }
            </Form>
          </TabPane>
        </Tabs>
      </Col>
      <Col xs={1} sm={4} md={4} lg={6} xl={8}></Col>
    </Row>
  );
}

export default Login;
