import React, { useEffect, useState } from "react";
import { InputNumber, Card, Form, Button, Input, Row, Col, message, Select } from "antd";
import moment from 'moment';

import RegionService from "../../services/region";

const { Option } = Select;

const layout = {
  labelCol: { offset: 0, span: 8 },
  wrapperCol: { span: 12 },
};

const ActivityForm = (props) => {

  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [requiredRegion, setRequiredRegion] = useState(false);
  const [inm, setInm] = useState([{}]);
  const [ipm, setIpm] = useState([{}]);
  const [machinery, setMachinery] = useState([{}]);
  const [soils, setSoils] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [cultivations, setCultivations] = useState([]);
  const [farmings, setFarmings] = useState([]);
  const [irrigations, setIrrigations] = useState([]);
  const [inventoryTypes, setInventoryTypes] = useState([]);
  const [machineryTypes, setMachineryTypes] = useState([]);
  const [validMetrics, setValidMetrics] = useState({});

  useEffect(() => {
    setSoils(props.dimensions.soils);
    setSeasons(props.dimensions.seasons);
    setFarmings(props.dimensions.farmings);
    setCultivations(props.dimensions.cultivations);
    setIrrigations(props.dimensions.irrigations);
    setCrops(props.dimensions.crops);
    const inventories = [];
    const inventoriesNames = [];
    props.dimensions.inventory.forEach(i => {
      if (!inventoriesNames.includes(i.item)) {
        inventories.push(i);
        inventoriesNames.push(i.item);
      }
    });
    setInventoryTypes(() => inventories);
    setMachineryTypes(props.dimensions.machinery);

    // setting properties for edit
    props.form.setFieldsValue({crop:props.selectedCrop});
    props.form.setFieldsValue({type:props.selectedActivity.type});
    props.form.setFieldsValue({activity:props.selectedActivity.name});
  }, [props]);

  const selectState = async (e) => {
    if (e == undefined) {
      setRequiredRegion(false);
    } else {
      setRequiredRegion(true);
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
  }

  const selectDistrict = (e) => {
    setMandals(() => {
      const mandals = [];
      regions.filter(x => e.includes(x.district)).forEach(entry => {
        if (!mandals.includes(entry.mandal)) mandals.push(entry.mandal);
      });
      return mandals;
    });
  }

  const selectMandal = (e) => {
    setVillages(() => {
      const villages = [];
      regions.filter(x => e.includes(x.mandal)).forEach(entry => {
        if (!villages.includes(entry.village)) villages.push(entry.village);
      });
      return villages;
    });
  }

  const onItemSelect = (index, type, e) => {
    const metrics = [];
    props.dimensions.inventory.forEach(i => {
      if (i.item === e && i.metric !== "") {
        metrics.push(i.metric);
      }
    });
    setValidMetrics((state) => {
      const key = `${index}_${type}_material_metric`;
      const temp = {...state};
      temp[key] = metrics;
      return {...temp};
    });
  };

  return (
    <div style={{ margin: '15px' }}>
      <Card
        title={"Add Activity"}
        className="g-ant-card"
        extra={[
          <Form key="save" layout="inline" form={props.form}>
            <Form.Item>
              <Button type="primary" htmlType="submit">Save</Button>
            </Form.Item>
            <Form.Item>
              <Button type="danger" onClick={props.onClose}>Cancel</Button>
            </Form.Item>
          </Form>
        ]}>
        <Form fields={fields} {...layout} preserve={false} form={props.form} onFinish={props.onFinish}>
          <Form.Item name="crop" label="Crop"
            rules={[
              {
                required: true,
                message: "Please Select Crop",
              },
            ]}>
            <Select showSearch placeholder="Select Crop">
              {crops.map(p => (
                <Option value={p.name} key={p.name}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="type" label="Activity Type"
            rules={[
              {
                required: true,
                message: "Please Select Activity Type",
              },
            ]}>
            <Input placeholder="Enter Activity Type (Prewsowing, Sowing)" />
          </Form.Item>
          <Form.Item name="activity" label="Activity Name"
            rules={[
              {
                required: true,
                message: "Please enter Activity Name",
              },
            ]}>
            <Input placeholder="Enter Activity Name" />
          </Form.Item>
          <Form.Item name="order" label="Order"
            rules={[
              {
                required: true,
                message: "Please enter Order",
              },
            ]}>
            <InputNumber placeholder="0" />
          </Form.Item>
          <Form.Item name="season" label="Season">
            <Select mode="multiple" placeholder="Select Season">
              {seasons.map(p => (
                <Option value={p.name} key={p.name}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="irrigation" label="Irrigation">
            <Select mode="multiple" placeholder="Select Irrigation">
              {irrigations.map(p => (
                <Option value={p.name} key={p.name}>{p.name}</Option>
              ))}
          </Select>
          </Form.Item>
          <Form.Item name="soil" label="Soil">
            <Select mode="multiple" placeholder="Select Soil">
              {soils.map(p => (
                <Option value={p.name} key={p.name}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="cultivation" label="Cultivation Type">
            <Select mode="multiple" placeholder="Select Cultivation Type">
              {cultivations.map(p => (
                <Option value={p.name} key={p.name}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="farming" label="Farming Type">
            <Select mode="multiple" placeholder="Select Farming Type">
              {farmings.map(p => (
                <Option value={p.name} key={p.name}>{p.name}</Option>
              ))}
            </Select>
          </Form.Item>
          {/* <Form.Item name="days" label="Day to(-)/from(+) Sowing Date"
            rules={[
              {
                required: true,
                message: "Please enter Day",
              },
            ]}>
            <InputNumber placeholder="Enter Day" />
          </Form.Item> */}
          
        </Form>
      </Card>
      <Card
        title={"Material, Labour, Machinery"}
        className="g-ant-card"
        style={{ marginTop: "20px" }}
      >
        <Form scrollToFirstError fields={fields} preserve={false} form={props.form} onFinish={props.onFinish}>
          {inm.map((i, index) => (
            <Input.Group compact key={index}>
              <Form.Item name={`${index}_inm_material_name`} label="INM material">
                <Select showSearch allowClear placeholder="Select INM" onChange={onItemSelect.bind(this, index, "inm")}>
                  {inventoryTypes.map(p => (
                    <Option value={p.item} key={p.id}>{p.item}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name={`${index}_inm_material_metric`} label="Metric"
                rules={[({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (getFieldValue(`${index}_inm_material_name`) !== undefined && value == undefined && validMetrics[`${index}_inm_material_metric`].length != 0) {
                      return Promise.reject('Please select a metric');
                    }
                    return Promise.resolve();
                  },
                }),]}
              >
                <Select showSearch allowClear placeholder="Select Metric">
                  {validMetrics[`${index}_inm_material_metric`] &&
                    validMetrics[`${index}_inm_material_metric`].map(p => (
                      <Option value={p} key={p}>{p}</Option>
                      ))
                    }
                </Select>
              </Form.Item>
              <Form.Item name={`${index}_inm_material_quantity`} label="Quantity"
                rules={[({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (getFieldValue(`${index}_inm_material_name`) !== undefined && value == undefined) {
                      return Promise.reject('Please enter a quantity');
                    }
                    return Promise.resolve();
                  },
                }),]}
              >
                <InputNumber placeholder="0" />
              </Form.Item>
            </Input.Group>
          ))}
          {ipm.map((i, index) => (
            <Input.Group compact key={index}>
              <Form.Item name={`${index}_ipm_material_name`} label="IPM material">
                <Select showSearch allowClear placeholder="Select IPM" onChange={onItemSelect.bind(this, index, "ipm")}>
                  {inventoryTypes.map(p => (
                    <Option value={p.item} key={p.id}>{p.item}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name={`${index}_ipm_material_metric`} label="Metric"
                rules={[({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (getFieldValue(`${index}_ipm_material_name`) !== undefined && value == undefined && validMetrics[`${index}_ipm_material_metric`].length != 0) {
                      return Promise.reject('Please select a metric');
                    }
                    return Promise.resolve();
                  },
                }),]}>
                <Select showSearch allowClear placeholder="Select Metric">
                  {validMetrics[`${index}_ipm_material_metric`] &&
                    validMetrics[`${index}_ipm_material_metric`].map(p => (
                      <Option value={p} key={p}>{p}</Option>
                    ))
                  }
                </Select>
              </Form.Item>
              <Form.Item name={`${index}_ipm_material_quantity`} label="Quantity"
                rules={[({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (getFieldValue(`${index}_ipm_material_name`) !== undefined && value == undefined) {
                      return Promise.reject('Please enter a quantity');
                    }
                    return Promise.resolve();
                  },
                }),]}>
                <InputNumber placeholder="0" />
              </Form.Item>
            </Input.Group>
          ))}
          {machinery.map((i, index) => (
            <Input.Group compact key={index}>
              <Form.Item name={`${index}_machinery_name`} label="Machinery">
                <Select showSearch allowClear placeholder="Select Machinery">
                  {machineryTypes.map(p => (
                    <Option value={p.item} key={p.id}>{p.item}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name={`${index}_machinery_quantity`} label="Quantity"
                rules={[({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (getFieldValue(`${index}_machinery_name`) !== undefined && value == undefined) {
                      return Promise.reject('Please enter a quantity');
                    }
                    return Promise.resolve();
                  },
                }),]}
              >
                <InputNumber placeholder="0" />
              </Form.Item>
            </Input.Group>
          ))}
          <Input.Group compact>
            <Form.Item name={`man_labour`} label="Man Labour (Hours)">
              <InputNumber placeholder="0" />
            </Form.Item>
            <Form.Item style={{ marginLeft: '5px' }} name={`woman_labour`} label="Woman Labour (Hours)">
              <InputNumber placeholder="0" />
            </Form.Item>
          </Input.Group>
        </Form>
      </Card>
    </div>
  );
};

export default ActivityForm;
