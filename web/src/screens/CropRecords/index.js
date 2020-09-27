import React, { useContext, useEffect, useState } from "react";
import { Tabs, Spin, Tooltip, Typography, Timeline, Checkbox, Drawer, Button, Row, Col, Table, Input, Form, message, Popconfirm, InputNumber, Card } from "antd";
import { CheckCircleTwoTone, DeleteFilled, ReloadOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";

import AuthService from "../../services/auth";
import CropService from "../../services/crop";
import { CropRecordForm } from "../../components";
import MobileView from "./mobileView";
import LayerTable from "./layerTable";
import { SharedContext } from "../../context";
import Routes from "../../routes";
import "./index.less";

const { Text } = Typography;
const { TabPane } = Tabs;

const CropRecords = () => {
  const [farmRecord, setFarmRecords] = useState([]);
  const [cropRecord, setCropRecords] = useState([]);
  const [cropRecordActive, setCropRecordsActive] = useState([]);
  const [csrUsers, setCsrUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [action, setAction] = useState("add_farm");
  const [timeline, setTimeline] = useState(false);
  const [state, setState] = useContext(SharedContext);

  const user = AuthService.getCurrentUser();

  let columns = [];
  if (user.roles[0] !== "FARMER") {
    columns = [
      {
        title: "Member", key: "member", ellipsis: true, render: (_, item) => (
          <>{item.Farm.User.firstName} ({item.Farm.User.phone})</>
        )
      },
    ];
  }

  columns = [...columns,
  { title: "Farm Name", key: "farmname", ellipsis: true, render: (_, item) => (<p>{item.Farm.name}</p>) },
  { title: "Khatha", key: "farmname", ellipsis: true, render: (_, item) => (<p>{item.Farm.khata}</p>) },
  { title: "Plot", dataIndex: "plot", key: "plot", ellipsis: true, render: (_, item) => (<p>{item.name} (Size: {item.size})</p>) },
  {
    title: "Action",
    key: "action",
    render: (_, item) => (
      <>
        {item.isActive &&
          <>
            <Tooltip placement="top" title='Delete Crop'>
              <Button
                type="link"
                onClick={() => deleteCropRecord(item)}
                icon={<DeleteFilled />}
              />
            </Tooltip>
          </>
        }
        {!item.isActive &&
          <>
            <Tooltip placement="top" title='Restore Crop'>
              <Button
                type="link"
                onClick={() => restoreCropRecord(item)}
                icon={<ReloadOutlined />}
              />
            </Tooltip>
          </>
        }
      </>
    ),
  },
  ];

  const [stages, setStages] = useState([]);
  const [title, setTitle] = useState("");
  const [layerId, setLayerId] = useState(0);
  const [layerCost, setLayerCost] = useState(0);
  const [date, setDate] = useState({});
  const [currentInventory, setCurrentInventory] = useState([]);
  const [inventoryTypes, setInventoryTypes] = useState([]);
  const [machineryTypes, setMachineryTypes] = useState([]);
  const [currentMachinery, setCurrentMachinery] = useState([]);
  const [initialValues, setInitialValues] = useState([]);
  const [formMaterial] = Form.useForm();
  const [formLabour] = Form.useForm();
  const [formMachinery] = Form.useForm();
  const [formMaterialActual] = Form.useForm();
  const [formLabourActual] = Form.useForm();
  const [formMachineryActual] = Form.useForm();
  const [formMiscellaneous] = Form.useForm();
  const [formMiscellaneousActual] = Form.useForm();

  const updateStages = (data) => {
    setTimeline(false);
    const layer = data.layer;
    const config = JSON.parse(layer.config);
    setLayerId(layer.id);
    setLayerCost(layer.labourCost);
    setDate(layer.date);
    let currentCost = 0;
    config.stages.forEach(s => {
      if (s.completed) {
        currentCost += parseFloat(getTotalActualCostText(s).total);
      }
    });
    setTitle(`${layer.crop} (Size: ${layer.Crop.size}) - ${new Date(layer.date).toDateString()}, Cost till day: ${currentCost}`);
    setStages(() => config.stages);
    const fields = [];
    const values = {};
    config.stages.forEach(s => {
      fields.push({ name: `${s.id}_material`, value: s.material });
      values[`${s.id}_material`] = s.actual?.material || s.material;
      fields.push({ name: `${s.id}_material_ipm`, value: s.materialIpm });
      values[`${s.id}_material_ipm`] = s.actual?.material_ipm || s.materialIpm;
      let tempItems = [];
      let tempCost = 0;
      if (s.extra_cost) {
        if (s.completed) {
          s.actual.extra_cost.forEach((entry, index) => {
            fields.push({ name: `${s.id}_miscellaneous_${index}_name`, value: entry.name});
            fields.push({ name: `${s.id}_miscellaneous_${index}_value`, value: entry.value});
            values[`${s.id}_miscellaneous_${index}_name`] = entry.name;
            values[`${s.id}_miscellaneous_${index}_value`] = entry.value;
            tempItems.push({name: entry.name, value: entry.value});
            tempCost += entry.value;
          });
        } else {
          s.extra_cost.forEach((entry, index) => {
            fields.push({ name: `${s.id}_miscellaneous_${index}_name`, value: entry.name});
            fields.push({ name: `${s.id}_miscellaneous_${index}_value`, value: entry.value});
            values[`${s.id}_miscellaneous_${index}_name`] = entry.name;
            values[`${s.id}_miscellaneous_${index}_value`] = entry.value;
            tempItems.push({name: entry.name, value: entry.value});
            tempCost += entry.value;
          });
        }
        setMiscellaneous((state) => ({...state, items: tempItems, totalMiscellaneousValue: tempCost}));
      }
      if (s.labour) {
        fields.push({ name: `${s.id}_man_labour`, value: s.actual?.man_labour || s.man_labour });
        fields.push({ name: `${s.id}_woman_labour`, value: s.actual?.woman_labour || s.woman_labour });
        fields.push({ name: `${s.id}_machinery_rent`, value: s.actual?.machinery_rent || s.machinery_rent });
        fields.push({ name: `${s.id}_machinery_fuel`, value: s.actual?.machinery_fuel || s.machinery_fuel });
        fields.push({ name: `${s.id}_machinery_man_power`, value: s.actual?.machinery_man_power || s.machinery_man_power });
        values[`${s.id}_man_labour`] = s.actual?.man_labour || s.man_labour;
        values[`${s.id}_woman_labour`] = s.actual?.woman_labour || s.woman_labour;
        values[`${s.id}_machinery_rent`] = s.actual?.machinery_rent || s.machinery_rent;
        values[`${s.id}_machinery_fuel`] = s.actual?.machinery_fuel || s.machinery_fuel;
        values[`${s.id}_machinery_man_power`] = s.actual?.machinery_man_power || s.machinery_man_power;
      }
    });
    formMaterial.setFieldsValue(values);
    formLabour.setFieldsValue(values);
    formMachinery.setFieldsValue(values);
    formMaterialActual.setFieldsValue(values);
    formLabourActual.setFieldsValue(values);
    formMachineryActual.setFieldsValue(values);
    formMiscellaneous.setFieldsValue(values);
    formMiscellaneousActual.setFieldsValue(values);
    setCurrentInventory(() => data.inventories);
    setCurrentMachinery(() => data.machinery);
    setInitialValues(fields);
    setTimeline(true);
  };

  const showActivity = (item) => {
    const stages = JSON.parse(item.config);
    if (stages.stages.length > 0) {
      CropService.getLayerRecord({ id: item.id }).then(response => {
        setCurrentInventory(() => response.data.inventories);
        setInventoryTypes(() => response.data.inventoryTypes);
        setCurrentMachinery(() => response.data.machinery);
        setMachineryTypes(() => response.data.machineryTypes);
        updateStages(response.data);
      }).catch(err => {
        console.log(err);
        message.error(err.response.data.message);
      });
    } else {
      message.error('No POP for this crop, please contact CSR');
    }
  };

  const updateStage = (id, inventoryId, inventoryIpmId, confirmType, complete) => {
    let values = {
      id: layerId, stageId: id,
      confirm: confirmType, inventoryId: inventoryId, inventoryIpmId: inventoryIpmId, complete: complete,
    };
    let valuesActual = {};
    const materialActualValues = formMaterialActual.getFieldsValue();
    const labourActualValues = formLabourActual.getFieldsValue();
    const machineryActualValues = formMachineryActual.getFieldsValue();
    valuesActual["material"] = materialActualValues[`${id}_material`] || 0;
    valuesActual["material_ipm"] = materialActualValues[`${id}_material_ipm`] || 0;
    valuesActual["man_labour"] = labourActualValues[`${id}_man_labour`] || 0;
    valuesActual["woman_labour"] = labourActualValues[`${id}_woman_labour`] || 0;
    valuesActual["extra_cost"] = miscellaneousAcutal.items;
    valuesActual["machinery_rent"] = machineryActualValues[`${id}_machinery_rent`] || 0;
    valuesActual["machinery_fuel"] = machineryActualValues[`${id}_machinery_fuel`] || 0;
    valuesActual["machinery_man_power"] = machineryActualValues[`${id}_machinery_man_power`] || 0;
    values["material"] = material.material;
    values["material_ipm"] = material.materialIpm;
    if (labour.isSet && id == labour.stage) {
      values["labour"] = true;
      values["man"] = labour.man;
      values["woman"] = labour.woman;
    }
    if (machinery.isSet && id == machinery.stage) {
      values["machinery"] = true;
      values["machinery_lease"] = true;
      values["machinery_rent"] = machinery.rent;
      values["machinery_fuel"] = machinery.fuel;
      values["machinery_man_power"] = machinery.man_power;
    }
    values["extra_cost"] = miscellaneous.items;
    values["actual"] = valuesActual;
    CropService.updateLayerRecord(values).then(response => {
      message.success(response.data.message);
      updateStages(response.data);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

  const history = useHistory();

  const getInventoryText = (stage) => {
    const { inventory, completed } = stage;
    if (!inventory.name || !inventory.quantity) return "";
    else {
      let text = <Text type="danger">{`Material: ${inventory.name} - ${inventory.quantity} ${inventory.metric || "units"} (In Inventory: 0)`}</Text>;
      currentInventory.forEach(c => {
        if (c.item === inventory.name && c.metric == inventory.metric) {
          if (c.quantity >= inventory.quantity) {
            text = <Text>{`Material: ${inventory.name} - ${inventory.quantity} ${inventory.metric || "units"} (In Inventory: ${c.quantity}, Price: ${c.price})`}</Text>;
          } else {
            if (completed) text = <Text>{`Material: ${inventory.name} - ${inventory.quantity} ${inventory.metric || "units"} (In Inventory: ${c.quantity}, Price: ${c.price})`}</Text>;
            else {
              let definedCost = "NA";
              inventoryTypes.forEach(i => {
                if (i.item === inventory.name && i.metric == inventory.metric) {
                definedCost = i.price;
                }
              });
              text = <Text type="danger">{`Material: ${inventory.name} - ${inventory.quantity} ${inventory.metric} (In Inventory: ${c.quantity},  Price: ${definedCost})`}</Text>;
            }
          }
        }
      });
      return text;
    }
  }

  const getInventoryIpmText = (stage) => {
    const { inventoryIpm, completed } = stage;
    if (!inventoryIpm.name || !inventoryIpm.quantity) return "";
    else {
      let text = <Text type="danger">{`Material: ${inventoryIpm.name} - ${inventoryIpm.quantity} ${inventoryIpm.metric || "units"} (In Inventory: 0)`}</Text>;
      currentInventory.forEach(c => {
        if (c.item === inventoryIpm.name && c.metric == inventoryIpm.metric) {
          if (c.quantity >= inventoryIpm.quantity) {
            text = <Text>{`Material: ${inventoryIpm.name} - ${inventoryIpm.quantity} ${inventoryIpm.metric || "units"} (In Inventory: ${c.quantity}, Price: ${c.price})`}</Text>;
          } else {
            if (completed) text = <Text>{`Material: ${inventoryIpm.name} - ${inventoryIpm.quantity} ${inventoryIpm.metric || "units"} (In Inventory: ${c.quantity}, Price: ${c.price})`}</Text>;
            else {
              let definedCost = "NA";
              inventoryTypes.forEach(i => {
                if (i.item === inventoryIpm.name && i.metric == inventoryIpm.metric) {
                definedCost = i.price;
                }
              });
              text = <Text type="danger">{`Material: ${inventoryIpm.name} - ${inventoryIpm.quantity} ${inventoryIpm.metric} (In Inventory: ${c.quantity},  Price: ${definedCost})`}</Text>;
            }
          }
        }
      });
      return text;
    }
  }

  const getMachineryText = (stage) => {
    const { machinery, completed } = stage;
    if (!machinery) return "";
    else {
      let text = (<><Text type="danger">{`Machinery: ${machinery.name} - ${machinery.quantity}`}</Text><Button type="link" onClick={() => history.push(Routes.CHC)}>Rent/Lease from CHC</Button></>);
      currentMachinery.forEach(c => {
        if (c.item === machinery.name) {
          if (c.quantity >= machinery.quantity) {
            text = (<><Text>{`Machinery: ${machinery.name} - ${machinery.quantity}`}</Text><Button type="link" onClick={() => history.push(Routes.CHC)}>Rent/Lease from CHC</Button></>);
          } else {
            if (completed) text = (<><Text>{`Machinery: ${machinery.name} - ${machinery.quantity}`}</Text><Button type="link" onClick={() => history.push(Routes.CHC)}>Rent/Lease from CHC</Button></>);
            text = (<><Text type="danger">{`Machinery: ${machinery.name} - ${machinery.quantity}`}</Text><Button type="link" onClick={() => history.push(Routes.CHC)}>Rent/Lease from CHC</Button></>);
          }
        }
      });
      return text;
    }
  }

  const getTotalActualCostText = (stage) => {
    let totalIventory = 0;
    let totalMachinery = 0;
    let totalLabour = 0;
    let totalOther = 0;
    if (stage.extra_cost) {
      let tempCost = 0;
      stage.actual.extra_cost.forEach(i => {
        tempCost += parseFloat(i.value || 0);
      });
      totalOther = tempCost;
    };
    if (stage.inventory) {
      let found = false;
      currentInventory.forEach(i => {
        if (i.item === stage.inventory.name && i.metric === stage.inventory.metric) {
          found = true;
          totalIventory = (stage.actual?.material || stage.inventory.quantity) * i.price;
        }
      });
      if (!found) {
        inventoryTypes.forEach(i => {
          if (i.item === stage.inventory.name && i.metric === stage.inventory.metric) {
            totalIventory = stage.inventory.quantity * i.price;
          }
        });
      }
    }
    if (stage.machinery) {
      if (stage.machinery_lease) {
        totalMachinery = stage.machinery_rent + stage.machinery_fuel + stage.machinery_man_power;
      } else {
        let found = false;
        currentMachinery.forEach(i => {
          if (i.item === stage.machinery.name) {
            found = true;
            totalMachinery = (stage.actual?.machinery || stage.machinery.quantity) * i.price;
          }
        });
        if (!found) {
          machineryTypes.forEach(i => {
            if (i.item === stage.machinery.name) {
              totalMachinery = stage.machinery.quantity * i.price;
            }
          });
        }
      }
    }
    totalLabour = (stage.man_price * stage.actual?.man_labour) + (stage.woman_price * stage.actual?.woman_labour);
    const result = { total: totalMachinery + totalIventory + totalLabour + totalOther, totalIventory, totalMachinery, totalLabour, totalOther };
    console.log(stage);
    console.log(result);
    return result;
  };

  const getTotalCostText = (stage) => {
    let totalIventory = 0;
    let totalMachinery = 0;
    let totalLabour = 0;
    let totalOther = 0;
    if (stage.extra_cost) {
      let tempCost = 0;
      stage.extra_cost.forEach(i => {
        tempCost += parseFloat(i.value || 0);
      });
      totalOther = tempCost;
    }
    if (stage.inventory) {
      let found = false;
      currentInventory.forEach(i => {
        if (i.item === stage.inventory.name && i.metric === stage.inventory.metric) {
          found = true;
          if (stage.material) {
            totalIventory = stage.material * i.price;
          } else {
            totalIventory = stage.inventory.quantity * i.price;
          }
        }
      });
      if (!found) {
        inventoryTypes.forEach(i => {
          if (i.item === stage.inventory.name && i.metric === stage.inventory.metric) {
            totalIventory = stage.inventory.quantity * i.price;
          }
        });
      }
    }
    if (stage.machinery) {
      if (stage.machinery_lease) {
        totalMachinery = stage.machinery_rent + stage.machinery_fuel + stage.machinery_man_power;
      } else {
        let found = false;
        currentMachinery.forEach(i => {
          if (i.item === stage.machinery.name) {
            found = true;
            totalMachinery = (stage.actual?.machinery || stage.machinery.quantity) * i.price;
          }
        });
        if (!found) {
          machineryTypes.forEach(i => {
            if (i.item === stage.machinery.name) {
              totalMachinery = stage.machinery.quantity * i.price;
            }
          });
        }
      }
    }
    totalLabour = (stage.man_price * stage.man_labour) + (stage.woman_price * stage.woman_labour);
    const result = { total: totalMachinery + totalIventory + totalLabour + totalOther, totalIventory, totalMachinery, totalLabour, totalOther };
    return result;
  };

  const getTimeLineDate = (stage) => {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + stage.day);
    if (stage.stage === "presowing") {
      if (stage.day > -7) {
        return `${Math.abs(stage.day)} day(s) before`;
      } else {
        return `${Math.abs(parseInt(stage.day / 7))} week(s) before`;
      }
    };
    if (newDate.toDateString() === new Date(date).toDateString()) return <b>{newDate.toDateString()}</b>
    return newDate.toDateString();
  };

  const getTimeLineDot = (stage) => {
    let color = "orange";
    if (stage.completed) color = "green";
    else color = "gray";
    if (stage.stage.toLowerCase() === "presowing") color = "orange";
    if (stage.stage.toLowerCase() === "presowing" && stage.completed) color = "green";
    const fontStyle = { fontSize: stage.day === 0 ? "30px" : "12px" };
    if (stage.completed) {
      return (
        <Button type="link" disabled>
          <CheckCircleTwoTone style={fontStyle} twoToneColor={"green"} />
        </Button>
      )
    }
    if (!stage.current && stage.stage.toLowerCase() !== "presowing") {
      return (
        <Button type="link" disabled>
          <CheckCircleTwoTone style={fontStyle} twoToneColor={color} />
        </Button>
      )
    }
    else {
      let inventoryId = 0;
      let inventoryIpmId = 0;
      currentInventory.forEach(c => {
        if (c.item === stage.inventory?.name) {
          inventoryId = c.id;
        }
      });
      currentInventory.forEach(c => {
        if (c.item === stage.inventoryIpm?.name) {
          inventoryIpmId = c.id;
        }
      });
      const s = stage;
      const popup = (
        <>
          <Card title="Capture Actuals">
             <Tabs defaultActiveKey="1">
                <TabPane tab="Material" key="1">
                  <p>{s.inm ? `INM: ${s.inm}` : ""}</p>
                  <p>{getInventoryText(s)}</p>
                  <p>{s.ipm ? `IPM: ${s.ipm}` : ""}</p>
                  <p>{getInventoryIpmText(s)}</p>
                  <Form form={formMaterialActual} layout="inline" initialValues={initialValues}>
                    {s.inventory.name &&
                    <Form.Item name={`${s.id}_material`} label="Quantity INM">
                      <InputNumber disabled={s.completed || false} placeholder="0" min={0} />
                    </Form.Item>
                    }
                    {s.inventoryIpm.name &&
                      <Form.Item name={`${s.id}_material_ipm`} label="Quantity IPM">
                        <InputNumber disabled={s.completed || false} placeholder="0" min={0} />
                      </Form.Item>
                    }
                  </Form>
                </TabPane>
                <TabPane tab="Labour" key="2">
                    <>
                      <Form form={formLabourActual} layout="inline" initialValues={initialValues}>
                        <Form.Item name={`${s.id}_man_labour`} label="Man Labour Hours">
                          <InputNumber disabled={s.completed || false} placeholder="0" />
                        </Form.Item>
                        <Form.Item name={`${s.id}_woman_labour`} label="Woman Labour Hours">
                          <InputNumber disabled={s.completed || false} placeholder="0" />
                        </Form.Item>
                      </Form>
                    </>
                </TabPane>
                <TabPane tab="Machinery" key="3">
                  {s.machinery &&
                    <>
                    <p>{getMachineryText(s)}</p>
                    <Form form={formMachineryActual} layout="inline" initialValues={initialValues}>
                        <Form.Item name={`${s.id}_machinery_rent`} label="Rent">
                          <InputNumber disabled={s.completed || false} placeholder="0" />
                        </Form.Item>
                        <Form.Item name={`${s.id}_machinery_fuel`} label="Fuel">
                          <InputNumber disabled={s.completed || false} placeholder="0" />
                        </Form.Item>
                        <Form.Item name={`${s.id}_machinery_man_power`} label="Man Power">
                          <InputNumber disabled={s.completed || false} placeholder="0" />
                        </Form.Item>
                      </Form>
                    </>
                  }
                  {!s.machinery &&
                    <p>No machinery needed for this activity.</p>
                  }
                </TabPane>
                <TabPane tab="Miscellaneous" key="4">
                  <>
                    <p>Add Miscellaneous Costs here</p>
                    <Form form={formMiscellaneousActual} layout="horizontal" initialValues={initialValues}>
                      {miscellaneousAcutal.items.map((i, index) => (
                          <Input.Group compact key={index}>
                            <Form.Item name={`${s.id}_miscellaneous_${index}_name`} label="Item Name">
                              <Input disabled={s.completed || false} onInput={enterMiscellaneousActual.bind(this, s.id, "name", index)} placeholder="Enter Item Name"/>
                            </Form.Item>
                            <Form.Item name={`${s.id}_miscellaneous_${index}_value`} label="Value">
                              <InputNumber disabled={s.completed || false} onChange={enterMiscellaneousActual.bind(this, s.id, "value", index)} placeholder="0"/>
                            </Form.Item>
                          </Input.Group>
                      ))}
                      <Button style={{marginRight: '10px'}} onClick={() => addMiscellaneousItemActual(s)}>Add Item</Button>
                      <p>Total Miscellaneous Cost: {miscellaneousAcutal.totalMiscellaneousValue}</p>
                    </Form>
                  </>
                </TabPane>
              </Tabs>
          </Card>
        </>
      )
      return (
        <Popconfirm
        overlayClassName="customPopconfirm"
        placement="bottom"
        title={popup}
        okText="Save Activity"
        onConfirm={handleConfirm.bind(this, "confirm", true, stage.id, inventoryId, inventoryIpmId)}
        cancelText="Skip"
        onCancel={handleConfirm.bind(this, "skip", true, stage.id, inventoryId, inventoryIpmId)}
      >
        <Button type="link">
          <CheckCircleTwoTone style={fontStyle} twoToneColor={color} />
        </Button>
      </Popconfirm>
      )
    }
  };

  const getMaterialSave = (stage) => {
    return (
      <Button type="primary" onClick={handleConfirm.bind(this, "cancel", false, stage.id, 0, 0)}>
        Save
      </Button>
    )
  };

  const getLabourSave = (stage) => {
    return (
      <Button type="primary" onClick={handleConfirm.bind(this, "cancel", false, stage.id, 0, 0)}>
        Save
      </Button>
    )
  };

  const getMachinerySave = (stage) => {
    return (
      <Button type="primary" onClick={handleConfirm.bind(this, "cancel", false, stage.id, 0, 0)}>
        Save
      </Button>
    )
  };

  const getMiscellaneousSave = (stage) => {
    return (
      <Button type="primary" onClick={handleConfirm.bind(this, "cancel", false, stage.id, 0, 0)}>
        Save
      </Button>
    )
  };

  const handleConfirm = (confirm, complete, stage, inventoryId, inventoryIpmId, e) => {
    e.persist();
    updateStage(stage, inventoryId, inventoryIpmId, confirm, complete);
  };

  const [material, setMaterial] = useState({ isSet: false, material: 0, materialIpm: 0});
  const [labour, setLabour] = useState({ isSet: false, man: 0, woman: 0, stage: 0 });
  const [machinery, setMachinery] = useState({ isSet: false, rent: 0, fuel: 0, man_power: 0});
  const [miscellaneous, setMiscellaneous] = useState({ isSet: false, stage: 0, items: [{name: "", value: ""}], totalMiscellaneousValue: 0});
  const [miscellaneousAcutal, setMiscellaneousActual] = useState({ isSet: false, stage: 0, items: [{name: "", value: ""}], totalMiscellaneousValue: 0});

  const addMiscellaneousItem = (s) => {
    if (!s.completed) {
      setMiscellaneous((state) => ({ ...state, items: [...state.items, {name: "", value: 0}]}));
      setMiscellaneousActual((state) => ({ ...state, items: [...state.items, {name: "", value: 0}]}));
    }
  }

  const addMiscellaneousItemActual = (s) => {
    setMiscellaneousActual((state) => ({ ...state, items: [...state.items, {name: "", value: 0}]}));
  }

  const enterMaterial = (id, type, e) => {
    if (type === "material")
      setMaterial((state) => ({ ...state, stage: id, material: e, isSet: true }));
    if (type === "material_ipm")
      setMaterial((state) => ({ ...state, stage: id, materialIpm: e, isSet: true }));
  };
  const enterLabour = (id, type, e) => {
    if (type === "man")
      setLabour((state) => ({ ...state, stage: id, man: e, isSet: true }));
    if (type === "woman")
      setLabour((state) => ({ ...state, stage: id, woman: e, isSet: true }));
  };
  const enterMachinery = (id, type, e) => {
    if (type === "rent")
      setMachinery((state) => ({ ...state, stage: id, rent: e, isSet: true }));
    else if (type === "fuel")
      setMachinery((state) => ({ ...state, stage: id, fuel: e, isSet: true }));
    else
      setMachinery((state) => ({ ...state, stage: id, man_power: e, isSet: true }));
  };
  const enterMiscellaneous = (id, type, index, e) => {
    const tempItems = [...miscellaneous.items]
    tempItems.forEach((i, itemIndex) => {
      if (type === "name" && itemIndex == index) {
        i.name = e.target.value;
        setMiscellaneous((state) => ({ ...state, stage: id, items: tempItems }));
        setMiscellaneousActual((state) => ({ ...state, stage: id, items: tempItems }));
      }
      else if (type === "value" && itemIndex == index) {
        i.value = e;
        setMiscellaneous((state) => {
          let tempCost = 0;
          state.items.forEach(i => {
            tempCost += i.value;
          });
          return {...state, stage: id, items: tempItems, totalMiscellaneousValue: tempCost};
        });
        setMiscellaneousActual((state) => {
          let tempCost = 0;
          state.items.forEach(i => {
            tempCost += i.value;
          });
          return {...state, stage: id, items: tempItems, totalMiscellaneousValue: tempCost};
        });
      }
    });
  };

  const enterMiscellaneousActual = (id, type, index, e) => {
    const tempItems = [...miscellaneousAcutal.items]
    tempItems.forEach((i, itemIndex) => {
      if (type === "name" && itemIndex == index) {
        i.name = e.target.value;
        setMiscellaneousActual((state) => ({ ...state, stage: id, items: tempItems }));
      }
      else if (type === "value" && itemIndex == index) {
        i.value = e;
        setMiscellaneousActual((state) => {
          let tempCost = 0;
          state.items.forEach(i => {
            tempCost += i.value;
          });
          return {...state, stage: id, items: tempItems, totalMiscellaneousValue: tempCost};
        });
      }
    });
  };

  const expandedRowRender = (item) => {
    return (
      <LayerTable editLayer={editLayer} form={skipForm} abandonLayer={abandonLayer} deleteLayer={deleteLayer} showActivity={showActivity} dataSource={item} farmId={item.id} />
    );
  };

  const [formSearch] = Form.useForm();
  const search = async () => {
    const values = await formSearch.validateFields();
    fetchAndUpdateRecords(values);
  };

  const fetchAndUpdateRecords = (values = { search: "", deleted: false, abandoned: false }) => {
    setLoading(true);
    CropService.getCropRecords({ search: values.search || "", deleted: values.deleted || false, abandoned: values.abandoned || false }).then(
      (response) => {
        setFarmRecords(() => response.data.farms);
        setCropRecords(() => response.data.crops);
        setCropRecordsActive(() => {
          return response.data.crops.filter(x => x.isActive === true);
        });
        setCsrUsers(() => response.data.csrUsers);
        setLoading(false);
      }
    ).catch(err => {
      setLoading(false);
      message.warning(`${err.response.data.message}`);
    });
  };

  useEffect(() => {
    fetchAndUpdateRecords();
  }, []);

  const [form] = Form.useForm();

  const onAdd = async () => {
    try {
      const values = await form.validateFields();
      values.add = true;
      onFinish(values);
    } catch (err) {
      console.log(err);
    }
  };

  const onFinish = (values) => {
    CropService.addCropRecords(values).then(async response => {
      message.success(response.data.message);
      const valuesSearch = await formSearch.validateFields();
      fetchAndUpdateRecords(valuesSearch);
      setShowDrawer(false);
      form.resetFields();
      if (values.add) {
        setShowDrawer(true);
      }
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  }

  const onFinishEdit = (values) => {
    values = { ...values, id: selectedItem.id };
    CropService.editLayerRecord(values).then(async response => {
      message.success(response.data.message);
      let values = await formSearch.validateFields();
      fetchAndUpdateRecords(values);
      setShowDrawer(false);
      form.resetFields();
      if (values?.add) setShowDrawer(true);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  }

  const openNewForm = () => {
    setAction("add_crop");
    setShowDrawer(true);
  }

  const restoreCropRecord = (item) => {
    CropService.restoreCropRecords({ id: item.id, plot: item.name, farm: item.FarmId }).then(async response => {
      message.success(response.data.message);
      const values = await formSearch.validateFields();
      fetchAndUpdateRecords(values);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  }

  const deleteCropRecord = (item) => {
    CropService.deleteCropRecords({ id: item.id }).then(async response => {
      message.success(response.data.message);
      const values = await formSearch.validateFields();
      fetchAndUpdateRecords(values);
    }).catch(err => {
      message.error(err.response.data.message);
    });
  }

  const [selectedItem, setSelectedItem] = useState({});
  const editLayer = (item) => {
    setAction("edit_crop");
    cropRecord.forEach(c => {
      c.Layers.forEach(l => {
        if (l.id === item.id) {
          setSelectedItem({ ...item, farm: c.Farm.name, plot: c.name, layer: l.name });
        }
      })
    });
    setShowDrawer(true);
  };

  const deleteLayer = (confirm, item) => {
    if (confirm === "confirm") {
      CropService.deleteLayerRecord({ id: item.id }).then(async response => {
        message.success(response.data.message);
        const values = await formSearch.validateFields();
        fetchAndUpdateRecords(values);
      }).catch(err => {
        message.error(err.response.data.message);
      });
    }
  };

  const [skipForm] = Form.useForm();
  const abandonLayer = (confirm, item) => {
    try {
      const values = skipForm.getFieldsValue();
      if (confirm === "skip") {
        CropService.abandonLayerRecord({ id: item.id, ...values }).then(async response => {
          message.success(response.data.message);
          const values = await formSearch.validateFields();
          fetchAndUpdateRecords(values);
        }).catch(err => {
          message.error(err.response.data.message);
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const closeCropForm = () => {
    setShowDrawer(false);
    form.resetFields();
  };

  return (
    <>
      <Drawer visible={timeline} title={title} placement="bottom" height={(window.innerHeight * 90) / 100} onClose={() => setTimeline(false)}>
        <div style={{ padding: '10px', overflowY: 'scroll', height: '100%' }}>
          <Spin spinning={state.spinning} size="large">
            <Timeline mode='left'>
              {stages.map((s) => (
                <Timeline.Item dot={getTimeLineDot(s)} key={s.id} label={getTimeLineDate(s)}>
                  <p>Stage {s.stage}</p>
                  <p>Activity: {s.activity}</p>
                  <p>{s.general ? `General: ${s.general}` : ""}</p>
                  <Tabs defaultActiveKey="1">
                    <TabPane tab="Material" key="1">
                      <p>{s.inm ? `INM: ${s.inm}` : ""}</p>
                      <p>{getInventoryText(s)}</p>
                      <p>{s.ipm ? `IPM: ${s.ipm}` : ""}</p>
                      <p>{getInventoryIpmText(s)}</p>
                      <Form form={formMaterial} layout="inline" initialValues={initialValues}>
                        {s.inventory.name &&
                          <Form.Item name={`${s.id}_material`} label="Quantity INM">
                            <InputNumber disabled={s.completed || false} onChange={enterMaterial.bind(this, s.id, "material")} placeholder="0" />
                          </Form.Item>
                        }
                        {s.inventoryIpm.name &&
                          <Form.Item name={`${s.id}_material_ipm`} label="Quantity IPM">
                            <InputNumber disabled={s.completed || false} onChange={enterMaterial.bind(this, s.id, "material_ipm")} placeholder="0" />
                          </Form.Item>
                        }
                        {getMaterialSave(s)}
                      </Form>
                      <p style={{marginTop: '5px'}}><a href="http://www.krishivedika.com/" target="_blank">Purchase at KrishiVedika</a></p>
                    </TabPane>
                    <TabPane tab="Labour" key="2">
                      {s.labour &&
                        <>
                          <Form form={formLabour} layout="inline" initialValues={initialValues}>
                            <Form.Item name={`${s.id}_man_labour`} label="Man Labour Hours">
                              <InputNumber disabled={s.completed || false} onChange={enterLabour.bind(this, s.id, "man")} placeholder="0" />
                            </Form.Item>
                            <Form.Item name={`${s.id}_woman_labour`} label="Woman Labour Hours">
                              <InputNumber disabled={s.completed || false} onChange={enterLabour.bind(this, s.id, "woman")} placeholder="0" />
                            </Form.Item>
                            {getLabourSave(s)}
                          </Form>
                        </>
                      }
                      {!s.labour &&
                        <p>No labour needed for this activity.</p>
                      }
                    </TabPane>
                    <TabPane tab="Machinery" key="3">
                      {s.machinery &&
                        <>
                        <p>{getMachineryText(s)}</p>
                        <Form form={formMachinery} layout="inline" initialValues={initialValues}>
                            <Form.Item name={`${s.id}_machinery_rent`} label="Rent">
                              <InputNumber disabled={s.completed || false} onChange={enterMachinery.bind(this, s.id, "rent")} placeholder="0" />
                            </Form.Item>
                            <Form.Item name={`${s.id}_machinery_fuel`} label="Fuel">
                              <InputNumber disabled={s.completed || false} onChange={enterMachinery.bind(this, s.id, "fuel")} placeholder="0" />
                            </Form.Item>
                            <Form.Item name={`${s.id}_machinery_man_power`} label="Man Power">
                              <InputNumber disabled={s.completed || false} onChange={enterMachinery.bind(this, s.id, "man_power")} placeholder="0" />
                            </Form.Item>
                            {getMachinerySave(s)}
                          </Form>
                        <p style={{marginTop: '5px'}}><a href="http://www.krishivedika.com/" target="_blank">Purchase at KrishiVedika</a></p>
                        </>
                      }
                      {!s.machinery &&
                        <p>No machinery needed for this activity.</p>
                      }
                    </TabPane>
                    <TabPane tab="Miscellaneous" key="4">
                      <>
                        <p>Add Miscellaneous Costs here</p>
                        <Form form={formMiscellaneous} layout="horizontal" initialValues={initialValues}>
                          {miscellaneous.items.map((i, index) => (
                              <Input.Group compact key={index}>
                                <Form.Item name={`${s.id}_miscellaneous_${index}_name`} label="Item Name">
                                  <Input disabled={s.completed || false} onInput={enterMiscellaneous.bind(this, s.id, "name", index)} placeholder="Enter Item Name"/>
                                </Form.Item>
                                <Form.Item name={`${s.id}_miscellaneous_${index}_value`} label="Value">
                                  <InputNumber disabled={s.completed || false} onChange={enterMiscellaneous.bind(this, s.id, "value", index)} placeholder="0" min={1}/>
                                </Form.Item>
                              </Input.Group>
                          ))}
                          <Button style={{marginRight: '10px'}} onClick={() => addMiscellaneousItem(s)}>Add Item</Button>
                          {getMiscellaneousSave(s)}
                          <p>Total Miscellaneous Cost: {miscellaneous.totalMiscellaneousValue}</p>
                        </Form>
                      </>
                    </TabPane>
                  </Tabs>
                  <Card title="Costs" className="g-ant-card" style={{ marginTop: '10px' }}>
                    <Tooltip
                      title={`Total: ${getTotalCostText(s).total}, Inventory: ${getTotalCostText(s).totalIventory}, Machinery: ${getTotalCostText(s).totalMachinery}, Labour: ${getTotalCostText(s).totalLabour}, Miscellaneous: ${getTotalCostText(s).totalOther || 0}`}
                      placement="top"
                    >
                      <p>Estimated Activity Cost: {getTotalCostText(s)['total']}</p>
                    </Tooltip>
                    {s.completed &&
                      <Tooltip
                        title={`Total: ${getTotalActualCostText(s).total}, Inventory: ${getTotalActualCostText(s).totalIventory}, Machinery: ${getTotalActualCostText(s).totalMachinery}, Labour: ${getTotalActualCostText(s).totalLabour}, Miscellaneous: ${getTotalActualCostText(s).totalOther || 0}`}
                        placement="top"
                      >
                        <p>Total Actual Activity Cost: {getTotalActualCostText(s)['total']}</p>
                      </Tooltip>
                    }
                    {!s.completed &&
                      <p>Total Activity Cost: NA</p>
                    }
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </Spin>
        </div>
      </Drawer>
      <Row style={{ padding: "10px", borderTop: "1px solid #90d150" }}>
        <Col xs={12} md={12} lg={12} xl={12}>
          <Form form={formSearch} layout="inline">
            <Form.Item
              name="search"
            >
              <Input onPressEnter={search} placeholder="Farm Name" />
            </Form.Item>
            <Form.Item name="deleted" valuePropName="checked" style={{ fontWeight: 'bold' }}>
              <Checkbox onChange={search}>Include Deleted</Checkbox>
            </Form.Item>
            <Form.Item name="abandoned" valuePropName="checked" style={{ fontWeight: 'bold' }}>
              <Checkbox onChange={search}>Include Abandoned</Checkbox>
            </Form.Item>
          </Form>
        </Col>
        <Col
          xs={{ span: 8 }}
          lg={{ span: 10, offset: 2 }}
          style={{ textAlign: "end" }}
        >
          <Button type="primary" onClick={openNewForm}>
            Add Crop
          </Button>
        </Col>
      </Row>
      <Row style={{ padding: "10px" }}>
        <Col
          xs={0}
          sm={0}
          md={24}
          lg={24}
          xl={24}
        >
          <Table
            className="g-table-striped-rows g-ant-table-cell \"
            rowClassName={(record, index) => record.isActive ? '' : 'g-table-striped-rows-danger'}
            ellipses={true}
            dataSource={cropRecord}
            columns={columns}
            loading={loading}
            rowKey="id"
            bordered
            expandable={{ expandedRowRender }}
          />
        </Col>
      </Row>
      <MobileView
        farms={cropRecord}
        deleteCropRecord={deleteCropRecord}
        showActivity={showActivity}
        deleteLayer={deleteLayer}
        editLayer={editLayer}
        abandonLayer={abandonLayer}
      />
      <Drawer
        visible={showDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={() => setShowDrawer(false)}
      >
        <Spin spinning={state.spinning} size="large">
          {action === "add_crop" &&
            <CropRecordForm type={action} onAdd={onAdd} onClose={closeCropForm} csrUsers={csrUsers} crops={cropRecordActive} farms={farmRecord} form={form} onFinish={onFinish} />
          }
          {action === "edit_crop" &&
            <CropRecordForm fields={selectedItem} type={action} onAdd={onAdd} onClose={closeCropForm} csrUsers={csrUsers} crops={cropRecordActive} farms={farmRecord} form={form} onFinish={onFinishEdit} />
          }
        </Spin>
      </Drawer>
    </>
  );
};

export default CropRecords;
