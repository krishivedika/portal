import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Select, Radio, Row, Col, Card } from "antd";

const { Option } = Select;

const layout = {
  labelCol: { offset: 0, span: 3 },
  wrapperCol: { span: 12 },
};

const MemberForm = (props) => {

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
      <Card title={isNew ? `Creating New Member` : `Editing: ${props.fields.phone || props.fields.email}`}
        className="g-ant-card"
        extra={[
          <Form key="save" form={props.form} layout="inline">
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: '5px' }}>Save</Button>
              <Button key="close" type="danger" onClick={props.onClose}>Cancel</Button>
            </Form.Item>
          </Form>
        ]}>
      <Form preserve={false} fields={fields} form={props.form} onFinish={props.onFinish} {...layout}>
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
                  </Select>
                </Form.Item>
              }
              {isStaff &&
              <Form.Item name="csr" label="CSR"
                  rules={[
                    {
                      required: true,
                      message: "Please select User's CSR / Field Agent",
                    }
                  ]}>
                  <Select placeholder="Select CSR / Field Agent">
                    {props.csrs.map((user) => (
                      <Option value={user.id} key={user.id}>{user.firstName} {user.lastName} ({user.phone})</Option>
                    ))}
                  </Select>
                </Form.Item>
              }
              <Form.Item name="firstName" label="First Name"
                rules={[
                  {
                    required: true,
                    message: "Please enter First Name",
                  },
                ]}>
                <Input placeholder="Enter First Name" />
              </Form.Item>
              <Form.Item name="lastName" label="Last Name"
                rules={[
                  {
                    required: true,
                    message: "Please enter Last Name",
                  },
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
                <InputNumber placeholder="Enter Age" min={18} />
              </Form.Item>
              <Form.Item name="email" label="Email"
                style={{ marginTop: '10px' }}>
                <Input placeholder="Enter Email" />
              </Form.Item>
              <Form.Item name="phone" label="Phone"
                rules={[
                  {
                    required: true,
                    message: "Please enter Phone Number",
                  },
                ]}>
                <Input placeholder="Enter Phone" disabled={!isNew && !isStaff}/>
              </Form.Item>
              <Form.Item name="ration" label="Ration"
                rules={[
                  {
                    required: true,
                    message: "Please enter Ration Number",
                  },
                ]}>
                <Input placeholder="Enter Ration" />
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
                ]}>
                <Input placeholder="Enter Address" />
              </Form.Item>
              <Form.Item name="district" label="District"
                rules={[
                  {
                    required: true,
                    message: "Please enter District",
                  },
                ]}>
                <Input placeholder="Enter Disctrict" />
              </Form.Item>
              <Form.Item name="mandala" label="Mandal">
                <Input placeholder="Enter Mandala" />
              </Form.Item>
              <Form.Item name="panchayat" label="Village">
                <Input placeholder="Enter Panchayat" />
              </Form.Item>
              <Form.Item name="hamlet" label="Hamlet">
                <Input placeholder="Enter Hamlet" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
      </Card>
    </div>
  );
};

export default MemberForm;
