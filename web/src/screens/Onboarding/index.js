import React, { useState } from "react";
import { Form, Input, Select, Button, message, Row, Col, Typography, Tabs } from "antd";

import "./index.css";
import AuthService from "../../services/auth";
import Routes from "../../routes";
import onboardingImage from "../../images/onboarding.png";

const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};
const tailLayout = {
  wrapperCol: { offset: 6, span: 16 },
};

let retries = 0

const OnBoardingForm = ({ history }) => {
  const [otpButton, setOtpButton] = useState(true);
  const [resendOtpButton, setResendOtpButton] = useState(false);
  const [registerButton, setRegisterButton] = useState(true);

  const [form] = Form.useForm();

  const handleRegister = (values) => {
    if (values.otp && values.otp !== '') {
      AuthService.register(values)
        .then(() => {
          message.success('Registration Successful, continue to login.');
          history.push(Routes.ROOT);
        })
        .catch(err => {
          console.log(err);
          if (err.response.data.code === 1) {
            retries += 1;
            if (retries === 3) {
              localStorage.setItem("otp_retries_time", new Date());
              setRegisterButton(false);
            }
          }
          message.error(`Registration Failed, reason: ${err.response.data.message}`);
        });
    }
  };

  const sendOtp = async () => {
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
      setRegisterButton(false);
      message.error(otpRetryError);
    }
  };

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        style={{
          width: 70,
        }}
      >
        <Option value="91">+91</Option>
      </Select>
    </Form.Item>
  );

  return (
    <Row>
      <Col xs={0} md={0} lg={12}>
        <div>
          <img className="onboarding-image" src={onboardingImage} alt="On Boarding" />
        </div>
      </Col>
      <Col xs={24} md={24} lg={10}>
        <Tabs style={{ margin: '50px' }}>
          <TabPane tab='On Boarding' key='onboarding'>
            <Form
              {...layout}
              form={form}
              onFinish={handleRegister}
              initialValues={{
                prefix: "91",
              }}
              scrollToFirstError
            >
              <Form.Item name="phone" label="Phone Number"
                rules={[
                  {
                    required: true,
                    message: "Please input your Phone No.",
                  },
                  { min: 10, message: 'Phone Number must be at least 10 characters' },
                  { max: 10, message: 'Phone Number must be at least 10 characters' },
                ]}
              >
                <Input
                  addonBefore={prefixSelector}
                  style={{
                    width: "100%",
                  }}
                />
              </Form.Item>

              <Form.Item name="aadhar" label="AADHAR"
                rules={[
                  {
                    required: true,
                    message: "Please input your AADHAR number!",
                    whitespace: true,
                  },
                  { min: 16, message: 'AADHAR must be at least 16 characters' },
                  { max: 16, message: 'AADHAR must be at least 16 characters' },
                ]}
              >
                <Input />
              </Form.Item>
              {!otpButton &&
                <Form.Item name="otp" label="OTP"
                  rules={[
                    {
                      required: true,
                      message: "Please input the OTP sent to your Phone",
                    },
                    { min: 6, message: 'OTP must be at least 6' },
                    { max: 6, message: 'OTP must be at least 6 digits' },
                  ]}
                >
                  <Input />
                </Form.Item>
              }
              {!otpButton &&
                <>
                  <Form.Item {...tailLayout}>
                    {registerButton &&
                      <Button type="primary" htmlType="submit">
                        Register
                      </Button>
                    }
                    {!registerButton &&
                      <Text type="danger">{otpRetryError}</Text>
                    }
                    {resendOtpButton && registerButton &&
                      <Button type="link" onClick={resendOtp}>Resend OTP</Button>
                    }
                  </Form.Item>
                </>
              }
              {otpButton &&
                <Form.Item {...tailLayout}>
                  <Button type="primary" onClick={sendOtp}>Send OTP</Button>
                </Form.Item>
              }
            </Form>
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  );
};

export default OnBoardingForm;
