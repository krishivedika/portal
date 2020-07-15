import React, { useEffect, useState } from "react";
import { Form, Input, Row, Col, Card, Tag, Button } from "antd";
import { SyncOutlined } from "@ant-design/icons";

const layout = {
  labelCol: { offset: 0, span: 3 },
  wrapperCol: { span: 12 },
};
const tailLayout = {
  wrapperCol: { offset: 1, span: 20 },
};

const SurveyForm = (props) => {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    const fields = [];
    Object.entries(props.fields).forEach((entry) => {
      fields.push({ name: entry[0], value: entry[1] });
    });
    setFields(fields);
  }, [props]);

  return (
    <div style={{ margin: "15px" }}>
      <Tag
        icon={<SyncOutlined spin />}
        color="processing"
        style={{ marginBottom: "10px" }}
      >
        Editing: {props.fields.name}
      </Tag>
      <Form
        fields={fields}
        form={props.form}
        onFinish={props.onFinish}
        {...layout}
      >
        <Row>
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
          <Col span={24}>
            <Card
              title="Survey"
              className="g-ant-card"
              style={{ marginTop: "20px" }}
            >
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  {
                    required: true,
                    message: "Please input Survey Name",
                  },
                ]}
              >
                <Input placeholder="Enter Name" />
              </Form.Item>
              <Form.Item
                name="subdivision"
                label="Subdivision"
                rules={[
                  {
                    required: true,
                    message: "Please input Subdivision",
                  },
                ]}
              >
                <Input placeholder="Enter Subdivision" />
              </Form.Item>
              <Form.Item
                name="extent"
                label="Extent"
                rules={[
                  {
                    required: true,
                    message: "Please input Extent",
                  },
                ]}
              >
                <Input placeholder="Enter Extent" />
              </Form.Item>
              <Form.Item name="link" label="Media Upload">
                <Input placeholder="Enter Mandala" />
              </Form.Item>
              <Form.Item name="comment" label="Comments">
                <Input placeholder="Enter Comments" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default SurveyForm;
