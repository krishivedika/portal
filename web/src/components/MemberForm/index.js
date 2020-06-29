import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Select, Radio, Tag } from "antd";
import { SyncOutlined } from "@ant-design/icons";

const { Option } = Select;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};
const tailLayout = {
  wrapperCol: { offset: 6, span: 16 },
};

const MemberForm = (props) => {

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
      <Tag icon={<SyncOutlined spin />} color="processing" style={{marginBottom: '20px'}}>
        Editing: {props.fields.phone} {props.fields.email}
      </Tag>
      <Form fields={fields} form={props.form} onFinish={props.onFinish} {...layout}>
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
          <Input placeholder="Enter Email" disabled={!isAdmin} />
        </Form.Item>
        <Form.Item name="phone" label="Phone"
          rules={[
            {
              required: true,
              message: "Please input Phone.",
            },
          ]}>
          <Input placeholder="Enter Phone" disabled={!isAdmin} />
        </Form.Item>
        <Form.Item name="ration" label="Ration Card No."
          rules={[
            {
              required: true,
              message: "Please input Ration Card No.",
            },
          ]}>
          <Input placeholder="Enter Ration Card No." />
        </Form.Item>
        <Form.Item name="address" label="Address"
          rules={[
            {
              required: true,
              message: "Please input Address",
            },
          ]}>
          <Input placeholder="Enter Address" />
        </Form.Item>
        <Form.Item name="district" label="District"
          rules={[
            {
              required: true,
              message: "Please input District",
            },
          ]}>
          <Input placeholder="Enter Disctrict" />
        </Form.Item>
        <Form.Item name="mandala" label="Mandala">
          <Input placeholder="Enter Mandala" />
        </Form.Item>
        <Form.Item name="panchayat" label="Panchayat">
          <Input placeholder="Enter Panchayat" />
        </Form.Item>
        <Form.Item name="hamlet" label="Hamlet">
          <Input placeholder="Enter Hamlet" />
        </Form.Item>
        <Form.Item style={{ marginTop: '10px' }} {...tailLayout}>
          <Button type="primary" htmlType="submit">Save</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default MemberForm;
