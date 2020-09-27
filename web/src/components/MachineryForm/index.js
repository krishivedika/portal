import React, { useEffect, useState } from "react";
import { DatePicker, Form, Select, Input, InputNumber, Button, Row, Col, Card } from "antd";

const { Option } = Select;
const { TextArea } = Input;

const layout = {
  labelCol: { offset: 0, span: 5 },
  wrapperCol: { span: 12 },
};

const MachineryForm = (props) => {

  const [fields, setFields] = useState([]);
  const [machineries, setMachineries] = useState([]);
  const [price, setPrice] = useState("");
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    setPrice("");
    const fields = [];
    Object.entries(props.fields).forEach(entry => {
      fields.push({ name: entry[0], value: entry[1] });
    });
    setFields(fields);
    setMachineries(() => props.machineries);
    if (props.type === "edit_machinery") setDisabled(true);
  }, [props]);

  const onItemSelect = (e) => {
    machineries.forEach(m => {
      if (m.item === e) {
        setPrice(m.price);
        props.form.setFieldsValue({'item' : e, "price": m.price});
      }
    });
  };

  const [textAreaRemaining, setTextAreaRemaining] = useState(1000);
  const textAreaInput = (e) => {
    let len =  e.target.value.length;
    if (len >= 1000){
       e.preventDefault();
    } else{
       setTextAreaRemaining(1000 - len);
    }
  }

  return (
    <div style={{ margin: '15px' }}>
      <Card title={`Creating New Machinery for ${props.fields.warehouse}`}
        className="g-ant-card"
        extra={[
          <Form key="save" form={props.form} layout="inline">
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: '5px' }}>Save</Button>
              {props.type === "add_machinery" &&
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
                  <Select  disabled={disabled} placeholder="Select Item" onSelect={onItemSelect}>
                    {machineries.map(d => (
                      <Option key={d.id} value={d.item}>{d.item}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="price" style={{display: 'none'}}>
                    <Input value={`${price}`} />
                  </Form.Item>
                  {props.type === "add_machinery" &&
                    <Form.Item label="Item Price">
                      <Input disabled placeholder={`${price}`} />
                    </Form.Item>
                  }
                  {props.type === "edit_machinery" &&
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
                <Form.Item name="manufacturer" label="Manufacturer"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Manufacturer",
                    },
                  ]}>
                  <Input  disabled={disabled} placeholder="Enter Manufacturer"/>
                </Form.Item>
                {props.type === "add_machinery" &&
                  <Form.Item name="date" label="Date of Purchase"
                      rules={[
                        {
                          required: true,
                          message: "Please Select Date of Purchase",
                        },
                      ]}>
                      <DatePicker disabled={disabled} format="DD-MM-YYYY" />
                  </Form.Item>
                }
                {props.type === "edit_machinery" &&
                  <Form.Item label="Date of Purchase">
                    <p>{new Date(props.fields.date).toDateString()}</p>
                  </Form.Item>
                }
                <Form.Item name="details" label="Notes">
                <TextArea onKeyUp={textAreaInput} maxLength={1000} autoSize={{minRows: 4}} placeholder="Enter Notes" />
              </Form.Item>
              <p style={{marginLeft: '100px'}}>Remaining: {textAreaRemaining}</p>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default MachineryForm;
