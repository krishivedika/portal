import React, { useEffect, useState } from "react";
import { Form, Select, Input, Button, Row, Col, Card } from "antd";

import AuthService from "../../services/auth";

const { Option } = Select;

const layout = {
  labelCol: { offset: 0, span: 3 },
  wrapperCol: { span: 12 },
};

const WarehouseForm = (props) => {

  const user = AuthService.getCurrentUser();
  let isStaff = false;
  if (user.roles[0] !== "FARMER") {
    isStaff = true;
  }

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
    if (props.type === "edit_warehouse") {
      fields.forEach(field => {
        if(field.name === "User") {
          fields.push({name: "member", value: field.value.firstName});
        }
      });
    }
    setFields(fields);
  }, [props]);

  return (
    <div style={{ margin: '15px' }}>
      <Card title={props.type === "add_warehouse" ? `Creating New Warehouse` : `Editing Warehouse`}
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
              <Card title="Warehouse" className="g-ant-card">
              {isStaff &&
                  <Form.Item name="member" label="Member"
                    rules={[
                      {
                        required: true,
                        message: "Please input Member",
                      },
                    ]}>
                    <Select disabled={props.type === "edit_warehouse"} placeholder="Select Member">
                      {props.csrUsers.map(d => (
                        <Option key={d.id} value={d.id}>{d.firstName} ({d.phone})</Option>
                      ))}
                    </Select>
                  </Form.Item>
                }
                <Form.Item name="name" label="Name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Warehouse Name",
                    },
                  ]}>
                  <Input placeholder="Enter Warehouse Name" />
                </Form.Item>
                <Form.Item name="address" label="Address"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Address",
                    },
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

export default WarehouseForm;
