import React, { useState } from "react";
import { Form, Input, Select, Button, message, Row, Col, Typography, Tabs } from "antd";

import AuthService from "../../services/auth";
import Routes from "../../routes";
import onboardingImage from "../../images/onboarding.png";

const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};
const tailLayout = {
  wrapperCol: { offset: 6, span: 16 },
};

let retries = 0

const OnBoardingForm = ({ history }) => {

  const [form] = Form.useForm();
  const [otpButton, setOtpButton] = useState(true);
  const [registerButton, setRegisterButton] = useState(true);
  const [resendOtpButton, setResendOtpButton] = useState(false);

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
          message.error(`Registration Failed, ${err.response.data.message}`);
        });
    }
  };

  const showOtpsentMessage = (success, msg) => {
    if (success) message.info('OTP sent to your phone.');
    else message.error(`Failed to send OTP, ${msg}.`);
  };

  const otpRetryError = 'Maximum retries reached, try after 1 Hour.';
  const requestOtp = async () => {
    const checkOtpRetries = new Date(localStorage.getItem("otp_retries_time"));
    if ((new Date() - checkOtpRetries) > (60 * 60 * 1000)) {
      let values;
      try {
        values = await form.validateFields();
        AuthService.requestNewOtp({ phone: values.phone }).then(() => {
          showOtpsentMessage(true, '');
          setOtpButton(false);
          setResendOtpButton(false);
          setTimeout(() => {
            setResendOtpButton(true);
          }, 1000 * 120);
        }).catch(err => {
          console.log(err.response.data);
          showOtpsentMessage(false, err.response.data.message);
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
          <img style={{width: '90%', height: '90%'}} src={onboardingImage} alt="On Boarding" />
        </div>
      </Col>
      <Col xs={24} md={24} lg={10}>
        <Tabs style={{ margin: '50px' }}>
          <TabPane tab='Onboarding' key='onboarding'>
            <Form
              {...layout}
              form={form}
              onFinish={handleRegister}
              initialValues={{
                prefix: "91",
              }}
              scrollToFirstError
            >
              <Form.Item name="phone" label="Phone"
                rules={[
                  {
                    required: true,
                    message: "Please input Phone Number",
                  },
                  { min: 10, message: 'Phone Number must be at least 10 characters' },
                  { max: 10, message: 'Phone Number must be at least 10 characters' },
                ]}
              >
                <Input
                  placeholder="Enter your Phone Number"
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
                    message: "Please input AADHAR number!",
                    whitespace: true,
                  },
                  { min: 16, message: 'AADHAR must be at least 16 characters' },
                  { max: 16, message: 'AADHAR must be at least 16 characters' },
                ]}
              >
                <Input  placeholder="Enter AADHAR number" />
              </Form.Item>
              {!otpButton &&
                <Form.Item name="otp" label="OTP"
                  rules={[
                    {
                      required: true,
                      message: "Please input OTP",
                    },
                    { min: 4, message: 'OTP must be at least 4 digits' },
                    { max: 4, message: 'OTP must be at least 4 digits' },
                  ]}
                >
                  <Input placeholder="Enter your OTP" />
                </Form.Item>
              }
              {!otpButton &&
                <>
                  <Form.Item {...tailLayout}>
                    {registerButton &&
                      <Button type="primary" htmlType="submit">Register</Button>
                    }
                    {!registerButton &&
                      <Text type="danger">{otpRetryError}</Text>
                    }
                    {resendOtpButton && registerButton &&
                      <Button type="link" onClick={requestOtp}>Resend OTP</Button>
                    }
                    {!resendOtpButton &&
                      <Button type="link" onClick={requestOtp} disabled>Resend OTP</Button>
                    }
                  </Form.Item>
                </>
              }
              {otpButton &&
                <Form.Item {...tailLayout}>
                  <Button type="primary" onClick={requestOtp}>Send OTP</Button>
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
