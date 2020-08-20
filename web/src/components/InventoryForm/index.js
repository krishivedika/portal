import React, { useEffect, useState } from "react";
import { Form, Select, Input, InputNumber, Button, Row, Col, Card } from "antd";

const { Option } = Select;

const layout = {
  labelCol: { offset: 0, span: 3 },
  wrapperCol: { span: 12 },
};

const InventoryForm = (props) => {

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
      <Card title={`Creating New Inventory for ${props.fields.warehouse}`}
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
              <Card title="Inventory" className="g-ant-card">
                <Form.Item name="item" label="Item Name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Inventory Name",
                    },
                  ]}>
                  <Input placeholder="Enter Inventory Name" />
                </Form.Item>
                <Form.Item name="quantity" label="Quantity"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Quantity",
                    },
                  ]}>
                  <InputNumber placeholder="0" />
                </Form.Item>
                <Form.Item name="metric" label="Metric"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Metric",
                    },
                  ]}>
                  <Input placeholder="Enter Metric" />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default InventoryForm;
