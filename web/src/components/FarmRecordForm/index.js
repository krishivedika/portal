import React, { useContext, useEffect, useState } from "react";
import { Select, Form, Input, Radio, Button, Tag, Row, Col, Card, InputNumber } from "antd";
import { SyncOutlined } from "@ant-design/icons";

import RegionService from "../../services/region";
import { SharedContext } from "../../context";

const { Option } = Select;

const layout = {
  labelCol: { xs: { span: 6 }, md: { offset: 0, span: 5 } },
  wrapperCol: { xs: { span: 16 }, md: { span: 12 } },
};

const FarmRecordForm = (props) => {
  const [fields, setFields] = useState([]);
  const [ownerType, setOwnerType] = useState(true);
  const [csrUsers, setCsrUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [state, setState] = useContext(SharedContext);

  useEffect(() => {
    const fields = [];
    Object.entries(props.fields).forEach(entry => {
      fields.push({ name: entry[0], value: entry[1] });
    });
    setFields(() => fields);
    setOwnerType(props.fields.isSelf);
    setCsrUsers(() => props.csrUsers);
    setShowUsers(() => {
      if (props.fields.role > 1) {
        setFields(() => []);
        setOwnerType(false);
        return true;
      }
      return false;
    });
  }, []);

  const selectUser = (e) => {
    const selectUser = csrUsers.filter(x => x.id === e)[0];
    const fieldsUser = [
      {name: 'ownerFirstName', valule: selectUser.firstName},
      {name: 'ownerLastName', valule: selectUser.lastName},
      {name: 'ownerAge', valule: selectUser.age},
      {name: 'ownerGender', valule: selectUser.gender},
    ];
    setFields(() => fieldsUser);
    setOwnerType(true);
  }

  const selectOwnerType = (e) => {
    setOwnerType(e.target.value);
  }

  const selectState = (e) => {
    RegionService.getRegions({state: e}).then(response => {
      setState(state => ({ ...state, spinning: true }));
      setRegions(() => response.data.regions);
      setDistricts(() => {
        const entries = [];
        response.data.regions.forEach(entry => {
          if (!entries.includes(entry.district)) entries.push(entry.district);
        });
        return entries;
      });
      setState(state => ({ ...state, spinning: false }));
    }).catch(err => {
      console.log(err);
    });
  }

  const selectDistrict = (e) => {
    setMandals(() => {
      const mandals = [];
      regions.filter(x => x.district === e).forEach(entry => {
        if (!mandals.includes(entry.mandal)) mandals.push(entry.mandal);
      });
      return mandals;
    });
  }

  const selectMandal = (e) => {
    setVillages(() => {
      const villages = [];
      regions.filter(x => x.mandal === e).forEach(entry => {
        if (!villages.includes(entry.village)) villages.push(entry.village);
      });
      return villages;
    });
  }

  return (
    <div style={{ margin: '15px' }}>
      <Tag icon={<SyncOutlined spin />} color="processing" style={{ marginBottom: '10px' }}>
        {props.type === "edit_farm" ? `Editing: ${props.fields?.name}` : "Creating New Farm Record"}
      </Tag>
      <Form fields={fields} form={props.form} onFinish={props.onFinish} {...layout}>
        <Row>
          <Form.Item>
            <Button type="primary" htmlType="submit">Save</Button>
          </Form.Item>
          <Col span={24}>
            <Card title="Farm Ownership" className="g-ant-card">
              {showUsers &&
                <Form.Item name="user" label="For"
                  rules={[
                    {
                      required: true,
                      message: "Please input Member",
                    },
                  ]}>
                  <Select placeholder="Select Member" onChange={selectUser}>
                    {csrUsers.map(d => (
                      <Option key={d.id} value={d.id}>{d.firstName} ({d.phone})</Option>
                    ))}
                  </Select>
                </Form.Item>
              }
              <Form.Item name="isSelf" label="Owner"
                rules={[
                  {
                    required: true,
                    message: "Please input Owner Type",
                  },
                ]}>
                <Radio.Group onChange={selectOwnerType}>
                  <Radio value={true}>Self</Radio>
                  <Radio value={false}>Other</Radio>
                </Radio.Group>
              </Form.Item>
              {!ownerType &&
                <Form.Item name="relationship" label="Relationship"
                  rules={[
                    {
                      required: true,
                      message: "Please input Land Owner Relationship",
                    }
                  ]}>
                  <Select placeholder="Select Land Owner Relationship">
                    <Option value="spouse">Spouse</Option>
                    <Option value="father">Father</Option>
                    <Option value="mother">Mother</Option>
                    <Option value="paternal grandfather">Paternal Grandfather</Option>
                    <Option value="paternal grandmother">Paternal Grandmother</Option>
                    <Option value="maternal grandfather">Maternal Grandfather</Option>
                    <Option value="maternal grandmother">Maternal Grandmother</Option>
                    <Option value="nephew">Nephew</Option>
                    <Option value="niece">Niece</Option>
                    <Option value="brother">Brother</Option>
                    <Option value="sister">Sister</Option>
                    <Option value="brother inlaw">Brother Inlaw</Option>
                    <Option value="sister inlaw">Sister Inlaw</Option>
                    <Option value="son">Son</Option>
                    <Option value="daughter">Daughter</Option>
                    <Option value="son inlaw">Son Inlaw</Option>
                    <Option value="daughter inlaw">Daughter Inlaw</Option>
                    <Option value="grand son">Grand Son</Option>
                    <Option value="grand daughter">Grand Daughter</Option>
                    <Option value="lessor">Lessor</Option>
                  </Select>
                </Form.Item>
              }
              <Form.Item name="ownerFirstName" label="Owner First Name"
                rules={[
                  {
                    required: true,
                    message: "Please input Owner First Name",
                  },
                ]}>
                <Input disabled={ownerType} placeholder="Enter First Name" />
              </Form.Item>
              <Form.Item name="ownerLastName" label="Owner Last Name"
                rules={[
                  {
                    required: true,
                    message: "Please input Owner Last Name",
                  },
                ]}>
                <Input disabled={ownerType} placeholder="Enter Last Name" />
              </Form.Item>
              <Form.Item name="ownerGender" label="Owner Gender"
                rules={[
                  {
                    required: true,
                    message: "Please input Owner Gender",
                  },
                ]}>
                <Radio.Group disabled={ownerType} >
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                  <Radio value="other">Other</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item name="ownerAge" label=" Owner Age"
                rules={[
                  {
                    required: true,
                    message: "Please input Owner Age",
                  },
                ]}>
                <InputNumber disabled={ownerType} placeholder="Age" min={18} />
              </Form.Item>
              <Form.Item name="name" label="Farm Name"
                rules={[
                  {
                    required: true,
                    message: "Please input Farm Name",
                  },
                  { min: 2, message: 'Farm Name must be at least 2 characters' },
                ]}>
                <Input placeholder="Enter Farm Name" />
              </Form.Item>
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Demographics" className="g-ant-card" style={{ marginTop: '20px' }}>
              <Form.Item name="state" label="State"
                rules={[
                  {
                    required: true,
                    message: "Please input State",
                  },
                ]}>
                <Select placeholder="Select State" onChange={selectState}>
                  <Option value="ANDHRA PRADESH">Andhra Pradesh</Option>
                </Select>
              </Form.Item>
              <Form.Item name="district" label="District"
                rules={[
                  {
                    required: true,
                    message: "Please input District",
                  },
                ]}>
                <Select showSearch placeholder="Select District" onChange={selectDistrict}>
                  {districts.map(d => (
                    <Option key={d} value={d}>{d}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="mandala" label="Mandal"
                rules={[
                  {
                    required: true,
                    message: "Please input Mandala",
                  },
                  { min: 2, message: 'Mandala must be at least 2 characters' },
                ]}>
                <Select showSearch placeholder="Select Mandala" onChange={selectMandal}>
                  {mandals.map(d => (
                    <Option key={d} value={d}>{d}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="panchayat" label="Village"
                rules={[
                  {
                    required: true,
                    message: "Please input Panchayat",
                  },
                  { min: 2, message: 'Panchayat must be at least 2 characters' },
                ]}>
                <Select showSearch placeholder="Select Panchayat / Village">
                  {villages.map(d => (
                    <Option key={d} value={d}>{d}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="khata" label="Khata #"
                rules={[
                  {
                    required: true,
                    message: "Please input Khata #",
                  },
                ]}>
                <InputNumber placeholder="Khata #" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default FarmRecordForm;
