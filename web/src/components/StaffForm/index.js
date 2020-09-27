import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Select, Radio, Row, Col, Card } from "antd";

const { Option } = Select;

const layout = {
  labelCol: { offset: 0, span: 3 },
  wrapperCol: { span: 12 },
};
const tailLayout = {
  wrapperCol: { offset: 1, span: 16 },
};

const StaffForm = (props) => {

  const isStaff = props.type === 'staff';
  const isNew = props.new || false;

  const [fields, setFields] = useState([]);
  useEffect(() => {
    const fields = [];
    Object.entries(props.fields).forEach(entry => {
      fields.push({ name: entry[0], value: entry[1] });
    });
    if (isStaff) {
      fields.forEach(field => {
        if (field.name === "role") {
          field.value = props.role.toLowerCase();
        }
      });
    }
    setFields(fields);
  }, [props]);

  return (
    <div style={{ margin: '15px' }}>
      <Card title={isNew ? `Creating New Staff` : `Editing: ${props.fields.email}`}
        className="g-ant-card"
        extra={[
          <Form key="save" form={props.form} layout="inline">
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: '5px' }}>Save</Button>
              <Button key="close" type="danger" onClick={props.onClose}>Cancel</Button>
            </Form.Item>
          </Form>
        ]}>
        <Form fields={fields} preserve={false} form={props.form} onFinish={props.onFinish} {...layout}>
          <Row>
            <Col span={24}>
              <Card title="Profile" className="g-ant-card">
                {isStaff &&
                  <Form.Item name="role" label="Role"
                    rules={[
                      {
                        required: true,
                        message: "Please select User's role",
                      }
                    ]}>
                    <Select onChange={props.onChange} placeholder="Select Role">
                      <Option value="admin">Admin</Option>
                      <Option value="csr">CSR</Option>
                      <Option value="field_agent">Field Agent</Option>
                      <Option value="farmer">Farmer</Option>
                      <Option value="sme">SME</Option>
                    </Select>
                  </Form.Item>
                }
                <Form.Item name="firstName" label="First Name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter First Name",
                    },
                    { min: 2, message: 'First Name must be at least 2 characters' },
                    { max: 200, message: 'First Name must be at max 200 characters' },
                  ]}>
                  <Input placeholder="Enter First Name" />
                </Form.Item>
                <Form.Item name="lastName" label="Last Name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Last Name",
                    },
                    { max: 200, message: 'Last Name must be at max 200 characters' },
                  ]}>
                  <Input placeholder="Enter Last Name" />
                </Form.Item>
                <Form.Item name="gender" label="Gender"
                  rules={[
                    {
                      required: true,
                      message: "Please select Gender",
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
                      message: "Please enter Age",
                    },
                  ]}>
                  <InputNumber placeholder="Enter Age" min={18} max={120}/>
                </Form.Item>
                <Form.Item name="email" label="Email"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Email.",
                    },
                    { max: 50, message: 'Email should be at max 50 characters' },
                    { type: 'email' },
                  ]}
                  style={{ marginTop: '10px' }}>
                  <Input placeholder="Enter Email" />
                </Form.Item>
                <Form.Item name="phone" label="Phone"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Phone.",
                    },
                    { min: 10, message: 'Phone Number must be at least 10 characters' },
                    { max: 10, message: 'Phone Number must be at least 10 characters' },
                  ]}>
                  <Input placeholder="Enter Phone" />
                </Form.Item>
              </Card>
            </Col>
            <Col span={24}>
              <Card title="Demographics" className="g-ant-card" style={{ marginTop: '20px' }}>
                <Form.Item name="address" label="Address"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Address",
                    },
                    { max: 200, message: 'Address should be at max 200 characters' },
                  ]}>
                  <Input placeholder="Enter Address" />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default StaffForm;
