import React, { useEffect, useState } from "react";
import { Form, Select, Input, InputNumber, Button, Row, Col, Card } from "antd";

const { Option } = Select;

const layout = {
  labelCol: { offset: 0, span: 3 },
  wrapperCol: { span: 12 },
};

const MachineryForm = (props) => {

  const [fields, setFields] = useState([]);
  const [machineries, setMachineries] = useState([]);
  const [price, setPrice] = useState("");

  useEffect(() => {
    const fields = [];
    Object.entries(props.fields).forEach(entry => {
      fields.push({ name: entry[0], value: entry[1] });
    });
    setFields(fields);
    setMachineries(() => props.machineries);
  }, [props]);

  const onItemSelect = (e) => {
    machineries.forEach(m => {
      if (m.item === e) {
        setPrice(m.price);
      }
    });
  };

  return (
    <div style={{ margin: '15px' }}>
      <Card title={`Creating New Machinery for ${props.fields.warehouse}`}
        className="g-ant-card"
        extra={[
          <Form key="save" form={props.form} layout="inline">
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: '5px' }}>Save</Button>
              {props.action === "add_machinery" &&
                <Button htmlType="button" onClick={props.onAdd} style={{ marginRight: '5px' }}>Save And Add</Button>
              }
              <Button key="close" type="danger" onClick={props.onClose}>Cancel</Button>
            </Form.Item>
          </Form>
        ]}>
        <Form preserve={false} fields={fields} form={props.form} onFinish={props.onFinish} {...layout}>
          <Row>
            <Col span={24}>
              <Card title="Machinery" className="g-ant-card">
                <Form.Item name="item" label="Item"
                  rules={[
                    {
                      required: true,
                      message: "Please select Item",
                    },
                  ]}>
                  <Select placeholder="Select Item" onSelect={onItemSelect}>
                    {machineries.map(d => (
                      <Option key={d.id} value={d.item}>{d.item}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Item Price">
                  <Input disabled placeholder="" value={price} />
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
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default MachineryForm;
