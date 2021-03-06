import React, { useEffect, useState } from "react";
import { Checkbox, DatePicker, Card, Form, Button, Input, Row, Col, message, Select } from "antd";
import moment from 'moment';

import AuthService from "../../services/auth";
import CropService from "../../services/crop";

const { Option } = Select;

const layout = {
  labelCol: { offset: 0, span: 5 },
  wrapperCol: { span: 12 },
};

const CropRecordForm = (props) => {

  const [farms, setFarms] = useState([]);
  const [farm, setFarm] = useState(0);
  const [showFarms, setShowFarms] = useState(false);
  const [showPlots, setShowPlots] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [partitions, setPartitions] = useState([]);
  const [crops, setCrops] = useState([]);
  const [cropTypes, setCropTypes] = useState([]);
  const [seeds, setSeeds] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [layers, setLayers] = useState([]);
  const [showUsers, setShowUsers] = useState(true);
  const [fields, setFields] = useState([]);
  const [irrigations, setIrrigations] = useState([]);
  const [soils, setSoils] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [cultivations, setCultivations] = useState([]);
  const [farmings, setFarmings] = useState([]);

  useEffect(() => {
    setCrops(() => props.crops);
    setFarms(() => props.farms);
    const user = AuthService.getCurrentUser();
    if (user.roles[0] === "FARMER") {
      setShowUsers(false);
      setShowFarms(true);
    }
    if (props.type === "edit_crop") {
      setShowPlots(true);
      let fieldValues = [];
      props.fields.date = moment(new Date(props.fields.date), "DD-MM-YYYY");
      Object.entries(props.fields).forEach(entry => {
        fieldValues.push({ name: entry[0], value: entry[1] });
      });
      setFields(() => fieldValues);
    }
  }, [props]);

  useEffect(() => {
    CropService.getCropTypes().then(response => {
      setCropTypes(() => response.data.cropTypes);
      setBrands(() => response.data.brands);
      setAllBrands(() => response.data.brands);
      setIrrigations(() => response.data.irrigations);
      setSoils(() => response.data.soils);
      setSeasons(() => response.data.seasons);
      setCultivations(() => response.data.cultivations);
      setFarmings(() => response.data.farmings);
      setShowFields(true);
    }).catch(err => {
      console.log(err);
    });
  }, []);

  const onBrandChange = (e) => {
    if (e.target.checked) {
      setBrands(() => [{id: 13, name: "Bayer Vijaya", seed: "Okra Seed A"}]);
    } else {
      setBrands(() => allBrands);
    }
  };

  const selectBrand = (e) => {
    const tempSeeds = [];
    brands.forEach(b => {
      if (b.name === e) {
        tempSeeds.push(b);
      }
    });
    setSeeds(() => tempSeeds);
  };

  const selectMember = (e) => {
    setShowPlots(false);
    setShowFields(false);
    const farmsSelected = props.farms.filter(x => x.userId === e);
    setShowFarms(false);
    if (farmsSelected.length > 0) {
      setFarms(() => {
        return props.farms.filter(x => x.userId === e);
      });
      setShowFarms(true);
    }
    else {
      message.info("No Active Farms for this Member");
      setShowFarms(false);
    }
  };

  const selectFarm = async (e) => {
    setShowFields(false);
    let values;
    try {
      values = await props.form.validateFields();
    } catch {
      props.form.setFieldsValue({ ...values, plot: '' });
    }
    farms.forEach(farm => {
      if (farm.id === e) {
        const plots = [...JSON.parse(farm.partitions)?.partitions || []];
        if (plots.length == 0) {
          message.warning("Farm not plotted, please plot in Farm Records.", 10);
          props.onClose();
        }
        setFarm(e);
        setPartitions(() => plots);
        setShowPlots(true);
      }
    });
  }

  const selectPlot = (e) => {
    const layers = [
      { name: 'One', isActive: true },
      { name: 'Two', isActive: true },
      { name: 'Three', isActive: true },
    ]
    crops.filter(x => x.FarmId === farm).forEach(crop => {
      crop.Layers.forEach(layer => {
        layers.forEach(l => {
          if (l.name === layer.name && crop.name === e && layer.isActive === true && layer.isCompleted === false) {
            l.isActive = false;
          }
        });
      });
    });
    setLayers(() => layers);
    CropService.getCropTypes().then(response => {
      setCropTypes(() => response.data.cropTypes);
      setBrands(() => response.data.brands);
      setIrrigations(() => response.data.irrigations);
      setSoils(() => response.data.soils);
      setSeasons(() => response.data.seasons);
      setCultivations(() => response.data.cultivations);
      setFarmings(() => response.data.farmings);
      setShowFields(true);
    }).catch(err => {
      console.log(err);
    });
  };

  return (
    <div style={{ margin: '15px' }}>
      <Card
        title={props.type === "add_crop" ? "Create New Crop Record" : `Editing Crop: ${props.fields.farm} - ${props.fields.plot}`}
        className="g-ant-card"
        extra={[
          <Form key="save" form={props.form} layout="inline">
            <Form.Item>
              <Button type="primary" htmlType="submit">Save</Button>
            </Form.Item>
            <Form.Item>
              <Button htmlType="button" onClick={props.onAdd}>Save And Add</Button>
            </Form.Item>
            <Form.Item>
              <Button type="danger" onClick={props.onClose}>Cancel</Button>
            </Form.Item>
          </Form>
        ]}>
        <Form fields={fields} {...layout} preserve={false} form={props.form} onFinish={props.onFinish}>
          {showUsers &&
            <Form.Item name="member" label="Select Member"
              rules={[
                {
                  required: true,
                  message: "Please Select Member",
                },
              ]}>
              <Select placeholder="Select Member" onChange={selectMember}>
                {props.csrUsers.map(c => (
                  <Option value={c.id} key={c.id}>{c.firstName} ({c.phone})</Option>
                ))}
              </Select>
            </Form.Item>
          }
          {showFarms &&
            <>
              <Form.Item name="farm" label="Select Farm"
                rules={[
                  {
                    required: true,
                    message: "Please Select Farm",
                  },
                ]}>
                <Select placeholder="Select Farm" onChange={selectFarm}>
                  {farms.map(f => (
                    <Option value={f.id} key={f.id}>{f.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              {showPlots &&
                <Form.Item name="plot" label="Select Plot"
                  rules={[
                    {
                      required: true,
                      message: "Please Select Plot",
                    },
                  ]}>
                  <Select placeholder="Select Plot" onChange={selectPlot}>
                    {partitions.map(p => (
                      <Option value={p.item} key={p.item} disabled={p.isCurrentActive}>{!p.isCurrentActive ? p.item : `${p.item} (Currently Active)`}</Option>
                    ))}
                  </Select>
                </Form.Item>
              }
              {showFields &&
                <>
                  <Form.Item name="layer" label="Select Layer"
                    rules={[
                      {
                        required: true,
                        message: "Please Select Layer",
                      },
                    ]}>
                    <Select placeholder="Select Layer">
                      {layers.map(p => (
                        <Option value={p.name} key={p.name} disabled={!p.isActive}>{p.isActive ? p.name : `${p.name} (Currently Active)`}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="crop" label="Select Crop"
                    rules={[
                      {
                        required: true,
                        message: "Please Select Crop",
                      },
                    ]}>
                    <Select showSearch placeholder="Select Crop">
                      {cropTypes.map(p => (
                        <Option value={p.name} key={p.id}>{p.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                    <Form.Item name="inventory" valuePropName="checked" style={{ fontWeight: 'bold' }}>
                      <Checkbox style={{marginLeft: "150px"}} onChange={onBrandChange}>Only Inventory</Checkbox>
                    </Form.Item>
                    <Form.Item name="brand" label="Select Brand">
                      <Select defaultActiveFirstOption={false} placeholder="Select Brand" onChange={selectBrand}>
                        {brands.map(p => (
                          <Option value={p.name} key={p.name}>{p.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  <Form.Item name="seed" label="Select Seed">
                    <Select placeholder="Select Seed">
                      {seeds.map(p => (
                        <Option value={p.seed} key={p.id}>{p.seed}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="season" label="Season"
                    rules={[
                      {
                        required: true,
                        message: "Please Select Season",
                      },
                    ]}>
                    <Select placeholder="Select Season">
                      {seasons.map(p => (
                        <Option value={p.name} key={p.name}>{p.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="irrigation" label="Irrigation"
                    rules={[
                      {
                        required: true,
                        message: "Please Select Irrigation",
                      },
                    ]}>
                    <Select placeholder="Select Irrigation">
                      {irrigations.map(p => (
                        <Option value={p.name} key={p.name}>{p.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="soil" label="Soil"
                    rules={[
                      {
                        required: true,
                        message: "Please Select Soil Type",
                      },
                    ]}>
                    <Select placeholder="Select Soil">
                      {soils.map(p => (
                        <Option value={p.name} key={p.name}>{p.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="cultivation" label="Cultivation Type"
                    rules={[
                      {
                        required: true,
                        message: "Please Select Cultivation Type",
                      },
                    ]}>
                    <Select placeholder="Select Cultivation Type">
                      {cultivations.map(p => (
                        <Option value={p.name} key={p.name}>{p.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="farming" label="Farming Type"
                    rules={[
                      {
                        required: true,
                        message: "Please Select Farming Type",
                      },
                    ]}>
                    <Select placeholder="Select Farming Type">
                      {farmings.map(p => (
                        <Option value={p.name} key={p.name}>{p.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="date" label="Sowing Date"
                    rules={[
                      {
                        required: true,
                        message: "Please Select Sowing Date",
                      },
                    ]}>
                    <DatePicker format="DD-MM-YYYY" />
                  </Form.Item>
                </>
              }
            </>
          }
        </Form>
      </Card>
    </div>
  );
};

export default CropRecordForm;
