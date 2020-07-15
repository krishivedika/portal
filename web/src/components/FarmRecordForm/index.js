import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Select, Radio, Tag, Row, Col, Card } from "antd";
import { SyncOutlined } from "@ant-design/icons";

const { Option } = Select;

const layout = {
  labelCol: { offset: 0, span: 3 },
  wrapperCol: { span: 12 },
};
const tailLayout = {
  wrapperCol: { offset: 1, span: 20 },
};

const FarmRecordForm = (props) => {

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
      <Tag icon={<SyncOutlined spin />} color="processing" style={{marginBottom: '10px'}}>
        Editing: {props.fields.name}
      </Tag>
      <Form fields={fields} form={props.form} onFinish={props.onFinish} {...layout}>
        <Row>
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">Save</Button>
          </Form.Item>
          <Col span={24}>
            <Card title="Form Record" className="g-ant-card">
            <Form.Item name="name" label="Name"
                rules={[
                  {
                    required: true,
                    message: "Please input Name",
                  },
                ]}>
                <Input placeholder="Enter Address" />
              </Form.Item>
              <Form.Item name="streetAddress" label="Address"
                rules={[
                  {
                    required: true,
                    message: "Please input Address",
                  },
                ]}>
                <Input placeholder="Enter Address" />
              </Form.Item>
              <Form.Item name="state" label="State"
                rules={[
                  {
                    required: true,
                    message: "Please input State",
                  },
                ]}>
                <Input placeholder="Enter State" />
              </Form.Item>
              <Form.Item name="district" label="District"
                rules={[
                  {
                    required: true,
                    message: "Please input District",
                  },
                ]}>
                <Input placeholder="Enter District" />
              </Form.Item>
              <Form.Item name="mandala" label="Mandala"
                rules={[
                  {
                    required: true,
                    message: "Please input Mandala",
                  },
                ]}>
                <Input placeholder="Enter Mandala" />
              </Form.Item>
              <Form.Item name="panchayat" label="Panchayat"
                rules={[
                  {
                    required: true,
                    message: "Please input Panchayat",
                  },
                ]}>
                <Input placeholder="Enter Panchayat" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default FarmRecordForm;
