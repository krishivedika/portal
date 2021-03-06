import React, { useRef, useEffect, useState } from "react";
import { Drawer, Select, Form, Input, Radio, Button, Row, Col, Card, InputNumber, message } from "antd";

import RegionService from "../../services/region";
import WarehouseService from "../../services/warehouse";
import { WarehouseForm } from "../../components";

const { Option } = Select;

const layout = {
  labelCol: { xs: { span: 6 }, md: { offset: 0, span: 5 } },
  wrapperCol: { xs: { span: 16 }, md: { span: 12 } },
};

const FarmRecordForm = (props) => {

  const fieldsOld = useRef();

  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);
  const [fieldsCopy, setFieldsCopy] = useState([]);
  const [ownerType, setOwnerType] = useState(true);
  const [csrUsers, setCsrUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [warehouseUpdated, setWarehouseUpdated] = useState(false);

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
      if ([1, 2, 3, 4].includes(props.fields.role)) {
        setFields(() => ([{ name: 'isSelf', value: props.fields.isSelf }]));
        return true;
      }
      return false;
    });
    if (fieldsOld.current) {
      setPropFields(fieldsOld.current);
    }
    if (![1, 2, 3, 4].includes(props.fields.role)) {
      setWarehouses(props.warehouses);
    }
  }, [props]);

  const selectUser = (e) => {
    const selectUser = csrUsers.filter(x => x.id === e)[0];
    const warehouses = props.warehouses.filter(x => x.UserId == e);
    setWarehouses(() => warehouses);
    const fieldsUser = [
      { name: 'ownerFirstName', value: selectUser.firstName },
      { name: 'ownerLastName', value: selectUser.lastName },
      { name: 'ownerAge', value: new Date().getFullYear() - new Date(selectUser.age).getFullYear() },
      { name: 'ownerGender', value: selectUser.gender },
      { name: 'isSelf', value: true },
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

  const [warehouseDrawer, setWarehouseDrawer] = useState(false);
  const addWarehouse = () => {
    setWarehouseDrawer(true);
  };
  const onWarehouseDrawerClose = () => {
    setWarehouseDrawer(false);
  };

  const [warehouseForm] = Form.useForm();
  const onFinishWarehouse = (values) => {
    setLoading(true);
    WarehouseService.addWarehouse(values).then(response => {
      WarehouseService.getWarehouses().then(
        (response) => {
          setWarehouses(() => response.data.warehouses);
          setWarehouseDrawer(false)
        });
        setLoading(false);
      message.success(response.data.message);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

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
        <Form scrollToFirstError={true} fields={fields} preserve={true} form={props.form} onFinish={props.onFinish.bind(this, warehouseUpdated)} {...layout}>
          <Row>
            <Col span={24}>
              <Card title="Farm Ownership" className="g-ant-card">
                {showUsers &&
                  <Form.Item name="member" label="Member"
                    rules={[
                      {
                        required: true,
                        message: "Please select Member",
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
                      message: "Please select Owner Type",
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
                        message: "Please select Land Owner Relationship",
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
                      message: "Please enter Owner First Name",
                    },
                  ]}>
                  <Input disabled={ownerType} placeholder="Enter First Name" />
                </Form.Item>
                <Form.Item name="ownerLastName" label="Owner Last Name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Owner Last Name",
                    },
                    { max: 200, message: 'Owner name must be at max 200 characters' },
                  ]}>
                  <Input disabled={ownerType} placeholder="Enter Last Name" />
                </Form.Item>
                <Form.Item name="ownerGender" label="Owner Gender"
                  rules={[
                    {
                      required: true,
                      message: "Please select Owner Gender",
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
                      message: "Please enter Owner Age",
                    },
                  ]}>
                  <InputNumber disabled={ownerType} placeholder="Age" min={18} max={120}/>
                </Form.Item>
                <Form.Item name="name" label="Farm Name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Farm Name",
                    },
                    { min: 2, message: 'Farm Name must be at least 2 characters' },
                    { max: 200, message: 'Farm Name must be at max 200 characters' },
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
                      message: "Please select State",
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
                      message: "Please select District",
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
                      message: "Please select Mandal",
                    },
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
                      message: "Please select Village",
                    },
                  ]}>
                  <Select showSearch placeholder="Select Village / Village">
                    {villages.map(d => (
                      <Option key={d} value={d}>{d}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="khata" label="Khatha #"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Khatha #",
                    },
                    { max: 10, message: 'Khatha # should be at max 10 characters' },
                  ]}>
                  <Input placeholder="Khatha #" />
                </Form.Item>
              </Card>
              <Card title="Warehouse" className="g-ant-card" style={{ marginTop: '20px' }}>
                {!loading &&
                  <>
                    <Form.Item name="warehouse" label="Warehouse">
                      <Select showSearch placeholder="Select Warehouse" onChange={() => setWarehouseUpdated(true)}>
                        {warehouses.map(d => (
                          <Option key={d.id} value={d.id}>{d.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Button type="primary" onClick={addWarehouse}>Add Warehouse</Button>
                    <Drawer
                      title="Add Warehouse"
                      width={window.innerWidth > 768 ? 700 : window.innerWidth}
                      onClose={onWarehouseDrawerClose}
                      visible={warehouseDrawer}
                    >
                      <WarehouseForm form={warehouseForm} onFinish={onFinishWarehouse} onClose={onWarehouseDrawerClose} csrUsers={csrUsers} fields={{}} />
                    </Drawer>
                  </>
                }
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default FarmRecordForm;
