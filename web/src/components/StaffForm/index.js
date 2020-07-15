import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Select, Radio, Tag, Row, Col, Card } from "antd";
import { SyncOutlined } from "@ant-design/icons";

const { Option } = Select;

const layout = {
  labelCol: { offset: 0, span: 3 },
  wrapperCol: { span: 12 },
};
const tailLayout = {
  wrapperCol: { offset: 1, span: 16 },
};

const StaffForm = (props) => {

  const isAdmin = props.type === 'sadmin';

  const [fields, setFields] = useState([]);
  useEffect(() => {
    const fields = [];
    Object.entries(props.fields).forEach(entry => {
      fields.push({ name: entry[0], value: entry[1] });
    });
    setFields(fields);
  }, [props]);

  return (
    <div style={{ margin: '15px' }}>
      <Tag icon={<SyncOutlined spin />} color="processing" style={{ marginBottom: '10px' }}>
        Editing: {props.fields.phone || props.fields.email}
      </Tag>
      <Form fields={fields} form={props.form} onFinish={props.onFinish} {...layout}>
        <Row>
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">Save</Button>
          </Form.Item>
          <Col span={24}>
            <Card title="Profile" className="g-ant-card">
              {isAdmin &&
                <Form.Item name="role" label="Role"
                  rules={[
                    {
                      required: true,
                      message: "Please input User's role",
                    }
                  ]}>
                  <Select placeholder="Select Role">
                    <Option value="admin">Admin</Option>
                    <Option value="csr">CSR</Option>
                    <Option value="field_agent">Field Agent</Option>
                    <Option value="farmer">Farmer</Option>
                  </Select>
                </Form.Item>
              }
              <Form.Item name="firstName" label="First Name"
                rules={[
                  {
                    required: true,
                    message: "Please input First Name",
                  },
                ]}>
                <Input placeholder="Enter First Name" />
              </Form.Item>
              <Form.Item name="lastName" label="Last Name"
                rules={[
                  {
                    required: true,
                    message: "Please input Last Name",
                  },
                ]}>
                <Input placeholder="Enter Last Name" />
              </Form.Item>
              <Form.Item name="gender" label="Gender"
                rules={[
                  {
                    required: true,
                    message: "Please input Gender",
                  },
                ]}>
                <Radio.Group>
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                  <Radio value="other">Other</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item name="age" label="Age"
                rules={[
                  {
                    required: true,
                    message: "Please input Age",
                  },
                ]}>
                <InputNumber placeholder="Enter Age" min={18} />
              </Form.Item>
              <Form.Item name="email" label="Email"
                rules={[
                  {
                    required: true,
                    message: "Please input Email.",
                  },
                  { type: 'email' },
                ]}
                style={{ marginTop: '10px' }}>
                <Input placeholder="Enter Email" />
              </Form.Item>
              <Form.Item name="phone" label="Phone">
                <Input placeholder="Enter Phone" disabled/>
              </Form.Item>
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Demographics" className="g-ant-card" style={{ marginTop: '20px' }}>
              <Form.Item name="address" label="Address"
                rules={[
                  {
                    required: true,
                    message: "Please input Address",
                  },
                ]}>
                <Input placeholder="Enter Address" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default StaffForm;
