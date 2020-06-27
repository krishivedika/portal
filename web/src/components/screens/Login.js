import React, { Component } from "react";
import { Form, Input, Button, Checkbox, Layout } from "antd";

import AuthService from "../../services/auth.js";

const { Content } = Layout;

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      loading: false,
      message: "",
    };
  }

  handleLogin = (loginDetails) => {
    this.setState({
      username: loginDetails.username,
      password: loginDetails.password
    }, () => this.userAuthentication())
  };

  userAuthentication = () => {
    AuthService.login(this.state.username, this.state.password).then(
      () => {
        this.props.history.push("/profile");
        window.location.reload();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  render() {
    return (
      <Content style={{ padding: '0 50px' }}>
      <div className="login">
        <div className="login-form-container">
          <Form
            name="login_form"
            className="login-form"
            initialValues={{
              remember: true,
            }}
            onFinish={(event) => this.handleLogin(event)}
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your Username!",
                },
              ]}
            >
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your Password!",
                },
              ]}
            >
              <Input type="password" placeholder="Password" />
            </Form.Item>
            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <a className="login-form-forgot" href="">
                Forgot password
              </a>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                Log in
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      </Content>
    );
  }
}
