import React, { useEffect, useState } from "react";
import { Tag, Form, Button, Input, Row, Col, message, Select } from "antd";
import { SyncOutlined } from "@ant-design/icons";

import CropService from "../../services/crop";

const { Option } = Select;

const layout = {
  labelCol: { offset: 0, span: 5 },
  wrapperCol: { span: 12 },
};

const CropRecordForm = (props) => {

  const [showFields, setShowFields] = useState(false);
  const [partitions, setPartitions] = useState([]);
  const [cropTypes, setCropTypes] = useState([]);

  const selectFarm = (e) => {
    props.farms.forEach(farm => {
      if (farm.id === e) {
        setPartitions(() => [...JSON.parse(farm.partitions).partitions]);
      }
    });
    CropService.getCropTypes().then(response => {
      setCropTypes(() => response.data.cropTypes);
    }).catch(err => {
      console.log(err);
    });
    setShowFields(true);
  }

  return (
    <div style={{ margin: '15px' }}>
      <Tag icon={<SyncOutlined spin />} color="processing" style={{ marginBottom: '10px' }}>
        Creating New Crop Record
      </Tag>
      <Form {...layout} form={props.form} onFinish={props.onFinish}>
        <Button style={{marginBottom: '15px'}} type="primary" htmlType="submit">Save</Button>
        <Form.Item name="farm" label="Select Farm"
                rules={[
                  {
                    required: true,
                    message: "Please input Owner Type",
                  },
                ]}>
          <Select placeholder="Select Farm" onChange={selectFarm}>
            {props.farms.map(f => (
              <Option value={f.id} key={f.id}>{f.name}</Option>
            ))}
          </Select>
        </Form.Item>
        {showFields &&
          partitions.map(p => (
            <Form.Item key={p.item} label={`${p.item} (Acres: ${p.area})`} wrapperCol={{span: 24}}>
              <Input.Group compact>
                <Form.Item name={`${p.item}_layerOne`} rules={[
                  {
                    required: true,
                    message: "Please input at least one Layer",
                  },
                ]}>
                  <Select showSearch placeholder="Layer 1 Crop">
                    {cropTypes.map(d => (
                      <Option key={d.id} value={d.name}>{d.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name={`${p.item}_layerTwo`} >
                  <Select showSearch placeholder="Layer 2 Crop">
                    {cropTypes.map(d => (
                      <Option key={d.id} value={d.name}>{d.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name={`${p.item}_layerThree`} >
                  <Select showSearch placeholder="Layer 3 Crop">
                    {cropTypes.map(d => (
                      <Option key={d.id} value={d.name}>{d.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Input.Group>
            </Form.Item>
          ))
        }
      </Form>
    </div>
  );
};

export default CropRecordForm;
