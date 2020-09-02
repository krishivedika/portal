import React, { useEffect, useState } from "react";
import { Form, Select, Input, InputNumber, Button, Row, Col, Card } from "antd";

const { Option } = Select;

const layout = {
  labelCol: { offset: 0, span: 3 },
  wrapperCol: { span: 12 },
};

const InventoryForm = (props) => {

  const [fields, setFields] = useState([]);
  const [inventoriesUnique, setInventories] = useState([]);
  const [validMetrics, setValidMetrics] = useState([]);
  const [showUnit, setShowUnit] = useState(true);
  const [price, setPrice] = useState("");
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const fields = [];
    Object.entries(props.fields).forEach(entry => {
      fields.push({ name: entry[0], value: entry[1] });
    });
    setFields(fields);
    const inventories = [];
    const inventoriesNames = [];
    props.inventories.forEach(i => {
      if (!inventoriesNames.includes(i.item)) {
        inventories.push(i);
        inventoriesNames.push(i.item);
      }
    });
    setInventories(() => inventories);
    if (props.type === "edit_inventory") setDisabled(true);
  }, [props]);

  const onItemSelect = (e) => {
    const metrics = [];
    let priceSlected = "";
    props.inventories.forEach(i => {
      if (i.item === e && i.metric !== "") {
        metrics.push(i.metric);
        priceSlected = i.price;
      }
    });
    if (metrics.length === 0) setShowUnit(false);
    else setShowUnit(true);
    props.form.setFieldsValue({'item' : e, 'metric':  "", "price": priceSlected});
    setValidMetrics(() => metrics);
    setPrice("");
  };

  const onMetricSelect = async (e) => {
    const values = await props.form.getFieldsValue();
    props.inventories.forEach(i => {
      if (i.item === values.item && i.metric === values.metric) {
        setPrice(i.price);
      }
    })
  };

  return (
    <div style={{ margin: '15px' }}>
      <Card title={`Creating New Inventory for ${props.fields.warehouse}`}
        className="g-ant-card"
        extra={[
          <Form key="save" form={props.form} layout="inline">
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: '5px' }}>Save</Button>
              {props.type === "add_inventory" &&
                <Button htmlType="button" onClick={props.onAdd}  style={{ marginRight: '5px' }}>Save And Add</Button>
              }
              <Button key="close" type="danger" onClick={props.onClose}>Cancel</Button>
            </Form.Item>
          </Form>
        ]}>
        <Form preserve={false} fields={fields} form={props.form} onFinish={props.onFinish} {...layout}>
          <Row>
            <Col span={24}>
              <Card title="Inventory" className="g-ant-card">
                <Form.Item name="item" label="Item"
                    rules={[
                      {
                        required: true,
                        message: "Please select Item",
                      },
                    ]}>
                    <Select disabled={disabled} placeholder="Select Item" onSelect={onItemSelect}>
                      {inventoriesUnique.map(d => (
                        <Option key={d.id} value={d.item}>{d.item}</Option>
                      ))}
                    </Select>
                </Form.Item>
                {showUnit &&
                <Form.Item name="metric" label="Unit"
                    rules={[
                      {
                        required: true,
                        message: "Please select Unit",
                      },
                    ]}>
                    <Select  disabled={disabled} defaultActiveFirstOption={false} placeholder="Select Unit" onSelect={onMetricSelect}>
                      {validMetrics.map(d => (
                        <Option key={d} value={d}>{d}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                }
                  <Form.Item name="price" style={{display: 'none'}}>
                    <Input value={`${price}`} />
                  </Form.Item>
                  {props.type === "add_inventory" &&
                    <Form.Item label="Item Price">
                      <Input disabled placeholder={`${price}`} />
                    </Form.Item>
                  }
                  {props.type === "edit_inventory" &&
                    <Form.Item label="Item Price">
                      <Input disabled placeholder={`${props.fields.price}`} />
                    </Form.Item>
                  }
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

export default InventoryForm;
