import React from "react";
import { Form, Input, Button, Row, Col, Tabs, message } from "antd";
import queryString from 'query-string'


import AuthService from "../../services/auth.js";
import Routes from "../../routes";
import farmerImage from "../../images/banner.jpg";

const { TabPane } = Tabs;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};
const tailLayout = {
  wrapperCol: { xs: { offset: 0, span: 16 }, md: { offset: 8, span: 16 } },
};

const Reset = (props) => {

  const [form] = Form.useForm();
  const resetPassword = async () => {
    const queryValues = queryString.parse(window.location.search)
    const values = await form.validateFields();
    AuthService.resetPassword({key: queryValues.key || '', ...values}).then(response => {
      message.info('Password reset successful, continue to login');
      props.history.push(Routes.ROOT);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

  return (
    <Row>
      <div>
        <img style={{ width: '100%', minHeight: '100px' }} src={farmerImage} alt="FarmerFirst" />
      </div>
      <Col xs={1} sm={4} md={4} lg={6} xl={8}></Col>
      <Col xs={22} sm={16} md={16} lg={12} xl={8}>
        <Tabs style={{ margin: '50px' }}>
          <TabPane tab='Reset Password' key='reset'>
            <Form {...layout}
              form={form}
              onFinish={resetPassword}>
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

              <Form.Item
                name="confirmPassword" label="Confirm Password"
                rules={[{ required: true, message: 'Please confirm password.' }, ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject('The two passwords that you entered do not match.');
                  },
                }),]}>
                <Input.Password placeholder="Enter your Password" />
              </Form.Item>
              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">Reset Password</Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Col>
      <Col xs={1} sm={4} md={4} lg={6} xl={7}></Col>
      <Col xs={0} sm={0} md={0} lg={0} xl={1} style={{ marginBottom: '400px' }}>
      </Col>
    </Row >
  );
}

export default Reset;
