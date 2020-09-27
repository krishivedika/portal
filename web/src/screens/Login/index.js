import React, { useContext, useState, useEffect } from "react";
import { Spin, Form, Input, Button, Row, Col, Tabs, Modal, Typography, message } from "antd";
import axios from "axios";

import AuthService from "../../services/auth.js";
import Routes from "../../routes";
import farmerImage from "../../images/banner.jpg";
import { SharedContext } from "../../context";

const { TabPane } = Tabs;
const { Text } = Typography;

const layout = {
  labelCol: { xs: { span: 8 }, md: { span: 6 }, xl: { span: 6 } },
  wrapperCol: { xs: { span: 20 }, md: { span: 16 } },
};
const tailLayout = {
  wrapperCol: { xs: { span: 16 }, sm: { offset: 8, span: 16 }, md: { offset: 6, span: 16 } },
};

let retries = 0;

const Login = (props) => {

  const [state, setState] = useContext(SharedContext);
  const [tab, setTab] = useState('member');

  const [form] = Form.useForm();
  const [otpButton, setOtpButton] = useState(true);
  const [loginButton, setLoginButton] = useState(true);
  const [resendOtpButton, setResendOtpButton] = useState(false);
  const [timer, setTimer] = useState(60);

  const handleLogin = (values) => {
    if (props.type === 'member') {
      AuthService.login({ phone: values.phone, otp: values.otp }).then(response => {
        let currentUser;
        localStorage.setItem("user", JSON.stringify(response.data));
        axios.defaults.headers.common['x-access-token'] = response.data.token;
        currentUser = AuthService.getCurrentUser();
        setState(state => ({ ...state, user: currentUser }));
        redirectUser(currentUser.roles[0]);
      }).catch(err => {
        console.log(err.response);
        if (err.response.data.code === 100) {
          retries += 1;
          if (retries === 3) {
            localStorage.setItem("otp_retries_time", new Date());
            setLoginButton(false);
          }
        }
        message.error(`Sign In Failed, ${err.response.data.message}`);
      });
    } else if (props.type === 'staff') {
      AuthService.staffLogin({ email: values.email, password: values.password }).then(response => {
        let currentUser;
        localStorage.setItem("user", JSON.stringify(response.data));
        axios.defaults.headers.common['x-access-token'] = response.data.token;
        currentUser = AuthService.getCurrentUser();
        setState(state => ({ ...state, user: currentUser }));
        redirectUser(currentUser.roles[0]);
      }).catch((err) => {
        console.log(err.response);
        message.error(`Sign In Failed, ${err.response.data.message}`);
      });
    }
  };

  useEffect(() => {
    let interval;
    interval = setInterval(() => {
      setTimer(state => state - 1);
    }, 1000)
    return () => {
      clearInterval(interval);
    };
  }, [resendOtpButton]);

  const redirectUser = (role) => {
    if (role === 'FARMER') props.history.push(Routes.PROFILE);
    else if (role === 'SME') props.history.push(Routes.SME);
    else if (role === 'SADMIN') props.history.push(Routes.ADMIN);
    else props.history.push(Routes.USERMANAGEMENT);
  };

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) redirectUser(currentUser.roles[0]);
  });

  const showOtpsentMessage = (success, msg) => {
    if (success) message.info('OTP sent to your phone.');
    else message.error(`Failed to send OTP, ${msg}.`);
  };

  const otpRetryError = 'Maximum retries reached, try after 1 Hour.';
  const requestOtp = async (type = '') => {
    setTimer(60);
    const checkOtpRetries = new Date(localStorage.getItem("otp_retries_time"));
    if ((new Date() - checkOtpRetries) > (60 * 60 * 1000)) {
      let values;
      try {
        values = await form.validateFields();
        const onRequest = () => {
          showOtpsentMessage((true))
          setOtpButton(false);
          setResendOtpButton(false);
          setTimeout(() => {
            setResendOtpButton(true);
          }, 1000 * 60);
        };
        if (type === 'resend') {
          AuthService.resendOtp({ phone: values.phone }).then(() => {
            onRequest();
          }).catch(err => {
            console.log(err.response.data);
            showOtpsentMessage(false);
          });
        } else {
          AuthService.requestLoginOtp({ phone: values.phone }).then(() => {
            onRequest();
          }).catch(err => {
            console.log(err.response.data);
            showOtpsentMessage(false, err.response.data.message);
          });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      setLoginButton(false);
      message.error(otpRetryError);
    }
  };

  const [formForgot] = Form.useForm();
  const [visibleForgot, setVisibleForgot] = useState(false);
  const [showForgotOtp, setShowForgotOtp] = useState(false);

  const handleForgotCancel = () => {
    formForgot.resetFields();
    setVisibleForgot(false);
    setShowForgotOtp(false);
  }

  const handleForgot = async () => {
    try {
      const values = await formForgot.validateFields();
      AuthService.forgotPassword(values).then(response => {
        message.info(response.data.message);
        setVisibleForgot(false);
        setShowForgotOtp(false);
      }).catch(err => {
        console.log(err);
        message.error(err.response.data.message);
      });
    } catch (err) {
      console.log(err);
      message.error(err);
    }
  };
  const requestForgotOtp = async () => {
    try {
      const values = await formForgot.validateFields();
      AuthService.forgotPasswordCheck({ email: values.email }).then(response => {
        setShowForgotOtp(true);
        message.success(response.data.message);
      }).catch(err => {
        console.log(err.response.data);
        message.error(err.response.data.message);
      });;
    } catch (err) {
      console.log(err);
      message.error(err);
    }
  };

  return (
    <Row>
      <div>
        <img style={{ marginBottom: '40px', width: '100vw', minHeight: '100px' }} src={farmerImage} alt="FarmerFirst" />
      </div>
      <Col xs={0} sm={4} md={4} lg={6} xl={8}></Col>
      <Col xs={24} sm={16} md={16} lg={12} xl={8}>
        <Tabs style={{ marginTop: '10px' }} onChange={(e) => setTab(e)}>
          {props.type === 'member' &&
            <TabPane tab='Sign In' key='member'>
              <Form {...layout} initialValues={{ remember: true }}
                form={form}
                onFinish={handleLogin}>
                <>
                  <Form.Item name="phone" label="Phone"
                    rules={[
                      {
                        required: true,
                        message: "Please enter Phone Number",
                      },
                      { min: 10, message: 'Phone numbers should be 10 digits long.' },
                      { max: 10, message: 'Phone numbers should be 10 digits long.' },
                    ]}>
                    <Input placeholder="Enter Phone Number" />
                  </Form.Item>
                  {!otpButton &&
                    <Form.Item name="otp" label="OTP"
                      rules={[
                        {
                          required: true,
                          message: "Please enter OTP.",
                        },
                        { min: 4, message: 'OTP must be 4 digits long.' },
                        { max: 4, message: 'OTP must be 4 digits long.' },
                      ]}>
                      <Input placeholder="Enter OTP" />
                    </Form.Item>
                  }
                  {!otpButton &&
                    <Form.Item {...tailLayout}>
                      {loginButton &&
                        <Button type="primary" htmlType="submit">Sign In</Button>
                      }
                      {!loginButton &&
                        <Text type="danger">{otpRetryError}</Text>
                      }
                      {resendOtpButton && loginButton &&
                        <Button type="link" onClick={() => requestOtp('resend')}>Resend OTP</Button>
                      }
                      {!resendOtpButton &&
                        <Button type="link" onClick={requestOtp} disabled>Resend OTP :{timer}</Button>
                      }
                    </Form.Item>
                  }
                  {otpButton &&
                    <Form.Item name="sendotp" {...tailLayout}>
                      <Button type="primary" onClick={requestOtp}>Send OTP</Button>
                    </Form.Item>
                  }
                </>
              </Form>
            </TabPane>
          }
          {props.type === 'staff' &&
            <TabPane tab='Sign In' key='staff'>
              <Form {...layout} initialValues={{ remember: true }}
                form={form}
                onFinish={handleLogin}>
                <>
                  <Form.Item name="email" label="Email"
                    rules={[
                      {
                        required: true,
                        message: "Please enter Email.",
                      },
                      { type: 'email' },
                    ]}>
                    <Input placeholder="Enter Email" />
                  </Form.Item>
                  <Form.Item name="password" label="Password"
                    rules={[
                      {
                        required: true,
                        message: "Please enter Password.",
                      },
                      { min: 6, message: 'Password must be atleast 6 characters long.' },
                    ]}>
                    <Input.Password placeholder="Enter Password" />
                  </Form.Item>
                  <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">Sign In</Button>
                    <Button type="link" onClick={() => setVisibleForgot(true)}>Forgot Password</Button>
                  </Form.Item>
                </>
              </Form>
            </TabPane>
          }
        </Tabs>
      </Col>
      <Col xs={0} sm={4} md={4} lg={6} xl={6}></Col>
      <Col xs={0} sm={0} md={0} lg={0} xl={0} style={{ marginBottom: '400px' }}>
      </Col>
      <Modal
        title="Forgot Password"
        visible={visibleForgot}
        footer={null}
        onOk={handleForgot}
        onCancel={handleForgotCancel}
      >
        <Spin spinning={state.spinning} size="large">
          <Form form={formForgot} >
            <Form.Item name="email" label="Email"
              rules={[
                {
                  required: true,
                  message: "Please enter Email.",
                },
                { type: 'email' },
              ]}>
              <Input placeholder="Enter Email" />
            </Form.Item>
            {showForgotOtp &&
              <Form.Item name="otp" label="OTP"
                rules={[
                  {
                    required: true,
                    message: "Please enter OTP.",
                  },
                  { min: 4, message: 'OTP must be 4 digits long.' },
                  { max: 4, message: 'OTP must be 4 digits long.' },
                ]}>
                <Input placeholder="Enter OTP" />
              </Form.Item>
            }
            <div style={{textAlign: "right"}}>
              {showForgotOtp &&
                <Button style={{marginRight: '5px'}} type="primary" onClick={handleForgot}>Ok</Button>
              }
              {!showForgotOtp &&
                <Button style={{marginRight: '5px'}} type="primary" onClick={requestForgotOtp}>Request OTP</Button>
              }
              <Button onClick={handleForgotCancel}>Cancel</Button>
            </div>
          </Form>
        </Spin>
      </Modal>
    </Row>
  );
}

export default Login;
