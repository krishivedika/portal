import React, { useRef, useEffect, useState } from "react";
import { Select, Form, Input, Radio, Button, Row, Col, Card, InputNumber, message } from "antd";

import RegionService from "../../services/region";

const { Option } = Select;

const layout = {
  labelCol: { xs: { span: 6 }, md: { offset: 0, span: 5 } },
  wrapperCol: { xs: { span: 16 }, md: { span: 12 } },
};

const FarmRecordForm = (props) => {

  const fieldsOld = useRef();

  const [fields, setFields] = useState([]);
  const [fieldsCopy, setFieldsCopy] = useState([]);
  const [ownerType, setOwnerType] = useState(true);
  const [csrUsers, setCsrUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);

  const setPropFields = (fieldsValue) => {
    const fields = [];
    Object.entries(fieldsValue).forEach(entry => {
      fields.push({ name: entry[0], value: entry[1] });
    });
    setFields(() => fields);
    setFieldsCopy(() => fields);
  }
  useEffect(() => {
    setPropFields(props.fields);
    setOwnerType(props.fields.isSelf);
    setCsrUsers(() => props.csrUsers);
    setShowUsers(() => {
      if ([1,2,3,4].includes(props.fields.role)) {
        setFields(() => ([{name: 'isSelf', value: props.fields.isSelf}]));
        return true;
      }
      return false;
    });
    if (fieldsOld.current) {
      setPropFields(fieldsOld.current);
    }
  }, [props]);

  const selectUser = (e) => {
    const selectUser = csrUsers.filter(x => x.id === e)[0];
    const fieldsUser = [
      { name: 'ownerFirstName', value: selectUser.firstName },
      { name: 'ownerLastName', value: selectUser.lastName },
      { name: 'ownerAge', value: new Date().getFullYear() - new Date(selectUser.age).getFullYear() },
      { name: 'ownerGender', value: selectUser.gender },
      { name: 'isSelf', value: true},
    ];
    setFields(() => fieldsUser);
    setFieldsCopy(() => fieldsUser)
    setOwnerType(true);
  }

  const selectOwnerType = (e) => {
    setOwnerType(e.target.value);
    if (e.target.value) {
      setFields(() => fieldsCopy);
    } else {
      setFields(() => [
        { name: 'ownerFirstName', value: '' },
        { name: 'ownerLastName', value: '' },
        { name: 'ownerAge', value: '' },
        { name: 'ownerGender', value: '' },
      ]);
    }
  }

  const selectState = async (e) => {
    fieldsOld.current = await props.form.getFieldsValue();
    RegionService.getRegions({ 'state': e }).then(response => {
      setRegions(() => response.data.regions);
      setDistricts(() => {
        const entries = [];
        response.data.regions.forEach(entry => {
          if (!entries.includes(entry.district)) entries.push(entry.district);
        });
        return entries;
      });
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
      <Card
        title={props.type === "edit_farm" ? `Editing: ${props.fields?.name}` : "Creating New Farm Record"}
        className="g-ant-card"
        extra={[
          <Form key="save" form={props.form} layout="inline">
            <Form.Item>
              <Button type="primary" htmlType="submit">Save</Button>
            </Form.Item>
            {props.type === 'add_farm' &&
              <Form.Item>
                <Button htmlType="button" onClick={props.onAdd}>Save And Add</Button>
              </Form.Item>
            }
            <Form.Item>
              <Button type="danger" onClick={props.onClose}>Cancel</Button>
            </Form.Item>
          </Form>
        ]}>
        <Form fields={fields} preserve={true} form={props.form} onFinish={props.onFinish} {...layout}>
          <Row>
            <Col span={24}>
              <Card title="Farm Ownership" className="g-ant-card">
                {showUsers &&
                  <Form.Item name="member" label="Member"
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
                  <Select placeholder="Select State" onSelect={selectState}>
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
                      message: "Please input Mandal",
                    },
                    { min: 2, message: 'Mandal must be at least 2 characters' },
                  ]}>
                  <Select showSearch placeholder="Select Mandal" onChange={selectMandal}>
                    {mandals.map(d => (
                      <Option key={d} value={d}>{d}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="panchayat" label="Village"
                  rules={[
                    {
                      required: true,
                      message: "Please input Village",
                    },
                    { min: 2, message: 'Village must be at least 2 characters' },
                  ]}>
                  <Select showSearch placeholder="Select Village / Village">
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
                  <Input placeholder="Khata #" />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default FarmRecordForm;
