import React, { useState, useEffect, useContext } from "react";
import { Tabs, Popconfirm, Input, InputNumber, Tooltip, Typography, Table, Row, Col, Card, Form, message, Button, } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { useHistory } from "react-router-dom";

import AuthService from "../../services/auth";
import CropService from "../../services/crop";
import { SharedContext } from "../../context";
import Routes from "../../routes";
const { Text } = Typography;
const { TabPane } = Tabs;

const Tasks = () => {

  const history = useHistory();
  const [isConfirm, setIsConfirm] = useState(false);
  const [state, setState] = useContext(SharedContext);
  const [loading, setLoading] = useState(true);
  const [cropRecord, setCropRecords] = useState([]);
  const [totalInventory, setTotalInventory] = useState({});
  const [totalMachinery, setTotalMachinery] = useState({});
  const [currentInventory, setCurrentInventory] = useState([]);
  const [currentMachinery, setCurrentMachinery] = useState([]);
  const [inventoryTypes, setInventoryTypes] = useState([]);
  const [machineryTypes, setMachineryTypes] = useState([]);
  const [initialValues, setInitialValues] = useState({});
  const [formMaterialActual] = Form.useForm();
  const [formLabourActual] = Form.useForm();
  const [formMachineryActual] = Form.useForm();
  const [formMiscellaneousActual] = Form.useForm();
  const [material, setMaterial] = useState({ isSet: false, material: 0, materialIpm: 0 });
  const [labour, setLabour] = useState({ isSet: false, man: 0, woman: 0, stage: 0 });
  const [machinery, setMachinery] = useState({ isSet: false, rent: 0, fuel: 0, man_power: 0 });
  const [miscellaneous, setMiscellaneous] = useState({ isSet: false, stage: 0, items: [{ name: "", value: "" }], totalMiscellaneousValue: 0 });
  const [miscellaneousAcutal, setMiscellaneousActual] = useState({ isSet: false, stage: 0, items: [{ name: "", value: "" }], totalMiscellaneousValue: 0 });

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
    { title: "Farm Name", key: "farmname", ellipsis: true, render: (_, item) => (<p>{item.Crop?.Farm?.name || null}</p>) },
    { title: "Khatha", key: "farmname", ellipsis: true, render: (_, item) => (<p>{item.Crop?.Farm?.khata || null}</p>) },
    { title: "Crop", dataIndex: "name", key: "name", ellipsis: true, render: (_, item) => (<p>{item.crop}</p>) },
    { title: "Plot", dataIndex: "name", key: "name", ellipsis: true, render: (_, item) => (<p>{item.name} (Size: {item.Crop?.size})</p>) },
    { title: "Activity", dataIndex: "activity", key: "activity", ellipsis: true, render: (_, item) => (<p>{item.stage.activity}</p>) },
    {
      title: "Mark Complete",
      key: "action",
      render: (_, item) => (
        <>
          <Tooltip placement="top" title='Complete Activity'>
            <Popconfirm
              overlayClassName="customPopconfirm"
              placement="bottom"
              title={getPopup(item.id, item.stage)}
              okText="Save Activity"
              onConfirm={() => completeActivity(item)}
              onClick={() => setIsConfirm(true)}
              onCancel={confirmClose}
            >
              <Button type="link" onClick={() => setInventory(item.id)}>
                <CheckCircleFilled />
              </Button>
            </Popconfirm>
          </Tooltip>
        </>
      ),
    },
  ];

  const getInventoryText = (stage) => {
    const { inventory, completed } = stage;
    if (!inventory) return "";
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
    if (!inventoryIpm) return "";
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

  const confirmClose = () => {
    setIsConfirm(false);
  }

  const getPopup = (layerId, stage) => {
    const s = stage;
    return (
      <>
        <Card title="Capture Actuals">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Material" key="1">
              <p>{s.inm ? `INM: ${s.inm}` : ""}</p>
              <p>{getInventoryText(s)}</p>
              <p>{s.ipm ? `IPM: ${s.ipm}` : ""}</p>
              <p>{getInventoryIpmText(s)}</p>
              <Form preserve={false} form={formMaterialActual} layout="inline" initialValues={initialValues[`${layerId}_${s.id}`].values}>
                {(s.inventory && s.inventory.name) &&
                  <Form.Item name={`${layerId}_${s.id}_material`} label="Quantity INM">
                    <InputNumber disabled={s.completed || false} onChange={enterMaterial.bind(this, s.id, "material")} placeholder="0" />
                  </Form.Item>
                }
                {(s.inventoryIpm && s.inventoryIpm.name) &&
                  <Form.Item name={`${layerId}_${s.id}_material_ipm`} label="Quantity IPM">
                    <InputNumber disabled={s.completed || false} onChange={enterMaterial.bind(this, s.id, "material_ipm")} placeholder="0" />
                  </Form.Item>
                }
              </Form>
              <p style={{ marginTop: '5px' }}><a href="http://www.krishivedika.com/" target="_blank">Purchase at KrishiVedika</a></p>
            </TabPane>
            <TabPane tab="Labour" key="2">
              {s.labour &&
                <>
                  <Form preserve={false} form={formLabourActual} layout="inline" initialValues={initialValues[`${layerId}_${s.id}`].values}>
                    <Form.Item name={`${layerId}_${s.id}_man_labour`} label="Man Labour Hours">
                      <InputNumber disabled={s.completed || false} onChange={enterLabour.bind(this, s.id, "man")} placeholder="0" />
                    </Form.Item>
                    <Form.Item name={`${layerId}_${s.id}_woman_labour`} label="Woman Labour Hours">
                      <InputNumber disabled={s.completed || false} onChange={enterLabour.bind(this, s.id, "woman")} placeholder="0" />
                    </Form.Item>
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
                  <Form preserve={false} form={formMachineryActual} layout="inline" initialValues={initialValues[`${layerId}_${s.id}`].values}>
                    <Form.Item name={`${layerId}_${s.id}_machinery_rent`} label="Rent">
                      <InputNumber disabled={s.completed || false} onChange={enterMachinery.bind(this, s.id, "rent")} placeholder="0" />
                    </Form.Item>
                    <Form.Item name={`${layerId}_${s.id}_machinery_fuel`} label="Fuel">
                      <InputNumber disabled={s.completed || false} onChange={enterMachinery.bind(this, s.id, "fuel")} placeholder="0" />
                    </Form.Item>
                    <Form.Item name={`${layerId}_${s.id}_machinery_man_power`} label="Man Power">
                      <InputNumber disabled={s.completed || false} onChange={enterMachinery.bind(this, s.id, "man_power")} placeholder="0" />
                    </Form.Item>
                  </Form>
                  <p style={{ marginTop: '5px' }}><a href="http://www.krishivedika.com/" target="_blank">Purchase at KrishiVedika</a></p>
                </>
              }
              {!s.machinery &&
                <p>No machinery needed for this activity.</p>
              }
            </TabPane>
            <TabPane tab="Miscellaneous" key="4">
              <>
                <p>Add Miscellaneous Costs here</p>
                <Form preserve={false} form={formMiscellaneousActual} layout="horizontal" initialValues={initialValues[`${layerId}_${s.id}`].values}>
                  {miscellaneous.items.map((i, index) => (
                    <Input.Group compact key={index}>
                      <Form.Item name={`${layerId}_${s.id}_miscellaneous_${index}_name`} label="Item Name">
                        <Input disabled={s.completed || false} onInput={enterMiscellaneousActual.bind(this, s.id, "name", index)} placeholder="Enter Item Name" />
                      </Form.Item>
                      <Form.Item name={`${layerId}_${s.id}_miscellaneous_${index}_value`} label="Value">
                        <InputNumber disabled={s.completed || false} onChange={enterMiscellaneousActual.bind(this, s.id, "value", index)} placeholder="0" min={1} />
                      </Form.Item>
                    </Input.Group>
                  ))}
                  <Button style={{ marginRight: '10px' }} onClick={() => addMiscellaneousItemActual(s)}>Add Item</Button>
                  <p>Total Miscellaneous Cost: {miscellaneous.totalMiscellaneousValue}</p>
                </Form>
              </>
            </TabPane>
          </Tabs>
        </Card>
      </>
    )
  };

  const setInventory = (layerId) => {
    setCurrentInventory(() => totalInventory[layerId] || []);
    setCurrentMachinery(() => totalMachinery[layerId] || []);
  };

  const completeActivity = async (item) => {
    const layerId = item.id;
    const stageId = item.stage.id;
    const stage = item.stage;
    const id = stageId;
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
    let values = {
      id: layerId, stageId: stageId,
      confirm: "confirm", inventoryId: inventoryId, inventoryIpmId: inventoryIpmId, complete: true,
    };
    let valuesActual = {};
    const materialActualValues = await formMaterialActual.getFieldsValue();
    const labourActualValues = await formLabourActual.getFieldsValue();
    const machineryActualValues = await formMachineryActual.getFieldsValue();
    valuesActual["material"] = materialActualValues[`${layerId}_${id}_material`] || 0;
    valuesActual["material_ipm"] = materialActualValues[`${layerId}_${id}_material_ipm`] || 0;
    valuesActual["man_labour"] = labourActualValues[`${layerId}_${id}_man_labour`] || 0;
    valuesActual["woman_labour"] = labourActualValues[`${layerId}_${id}_woman_labour`] || 0;
    valuesActual["extra_cost"] = miscellaneousAcutal.items;
    valuesActual["machinery_rent"] = machineryActualValues[`${layerId}_${id}_machinery_rent`] || 0;
    valuesActual["machinery_fuel"] = machineryActualValues[`${layerId}_${id}_machinery_fuel`] || 0;
    valuesActual["machinery_man_power"] = machineryActualValues[`${layerId}_${id}_machinery_man_power`] || 0;
    values["actual"] = valuesActual;
    CropService.updateLayerRecord(values).then(response => {
      message.success(response.data.message);
      fetchAndUpdateRecords();
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

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

  const addMiscellaneousItemActual = (s) => {
    setMiscellaneousActual((state) => ({ ...state, items: [...state.items, { name: "", value: 0 }] }));
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
          return { ...state, stage: id, items: tempItems, totalMiscellaneousValue: tempCost };
        });
      }
    });
  };

  const fetchAndUpdateRecords = (values = { search: "", deleted: false }) => {
    setLoading(true);
    CropService.getLayerActivity({ search: values.search || "", deleted: values.deleted || false }).then(
      (response) => {
        let tempLayers = [];
        response.data.layers.forEach(layer => {
          const stages = JSON.parse(layer.config)?.stages || [];
          const incompletedStages = [];
          stages.forEach((s, index) => {
            if (!s.completed && incompletedStages.length < 2) {
              incompletedStages.push({ stage: { ...s }, ...layer, tempId: `${index}_${layer.id}` });
              let fields = [];
              let values = {};
              fields.push({ name: `${layer.id}_${s.id}_material`, value: s.material });
              values[`${layer.id}_${s.id}_material`] = s.actual?.material || s.material;
              fields.push({ name: `${layer.id}_${s.id}_material_ipm`, value: s.materialIpm });
              values[`${layer.id}_${s.id}_material_ipm`] = s.actual?.material_ipm || s.materialIpm;
              let tempItems = [];
              let tempCost = 0;
              if (s.extra_cost) {
                if (s.completed) {
                  s.actual.extra_cost.forEach((entry, index) => {
                    fields.push({ name: `${layer.id}_${s.id}_miscellaneous_${index}_name`, value: entry.name});
                    fields.push({ name: `${layer.id}_${s.id}_miscellaneous_${index}_value`, value: entry.value});
                    values[`${layer.id}_${s.id}_miscellaneous_${index}_name`] = entry.name;
                    values[`${layer.id}_${s.id}_miscellaneous_${index}_value`] = entry.value;
                    tempItems.push({name: entry.name, value: entry.value});
                    tempCost += entry.value;
                  });
                } else {
                  s.extra_cost.forEach((entry, index) => {
                    fields.push({ name: `${layer.id}_${s.id}_miscellaneous_${index}_name`, value: entry.name});
                    fields.push({ name: `${layer.id}_${s.id}_miscellaneous_${index}_value`, value: entry.value});
                    values[`${layer.id}_${s.id}_miscellaneous_${index}_name`] = entry.name;
                    values[`${layer.id}_${s.id}_miscellaneous_${index}_value`] = entry.value;
                    tempItems.push({name: entry.name, value: entry.value});
                    tempCost += entry.value;
                  });
                }
                setMiscellaneous((state) => ({...state, items: tempItems, totalMiscellaneousValue: tempCost}));
              }
              if (s.labour) {
                fields.push({ name: `${layer.id}_${s.id}_man_labour`, value: s.actual?.man_labour || s.man_labour });
                fields.push({ name: `${layer.id}_${s.id}_woman_labour`, value: s.actual?.woman_labour || s.woman_labour });
                fields.push({ name: `${layer.id}_${s.id}_machinery_rent`, value: s.actual?.machinery_rent || s.machinery_rent });
                fields.push({ name: `${layer.id}_${s.id}_machinery_fuel`, value: s.actual?.machinery_fuel || s.machinery_fuel });
                fields.push({ name: `${layer.id}_${s.id}_machinery_man_power`, value: s.actual?.machinery_man_power || s.machinery_man_power });
                values[`${layer.id}_${s.id}_man_labour`] = s.actual?.man_labour || s.man_labour;
                values[`${layer.id}_${s.id}_woman_labour`] = s.actual?.woman_labour || s.woman_labour;
                values[`${layer.id}_${s.id}_machinery_rent`] = s.actual?.machinery_rent || s.machinery_rent;
                values[`${layer.id}_${s.id}_machinery_fuel`] = s.actual?.machinery_fuel || s.machinery_fuel;
                values[`${layer.id}_${s.id}_machinery_man_power`] = s.actual?.machinery_man_power || s.machinery_man_power;
              }
              initialValues[`${layer.id}_${s.id}`] = {fields: fields, values: values};
            }
          });
          tempLayers = [...tempLayers, ...incompletedStages];
        });
        setTotalInventory(() => response.data.inventories);
        setInventoryTypes(() => response.data.inventoryTypes);
        setTotalMachinery(() => response.data.machinery);
        setMachineryTypes(() => response.data.machineryTypes);
        setCropRecords(() => tempLayers);
        setLoading(false);
      }
    ).catch(err => {
      console.log(err);
      setLoading(false);
      message.warning(`${err.response.data.message}`);
    });
  };

  useEffect(() => {
    fetchAndUpdateRecords();
  }, []);

  return (
    <Row style={{ padding: "10px" }}>
      <Col
        xs={24}
        sm={24}
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
          rowKey="tempId"
          bordered
        />
      </Col>
    </Row>
  );
}

export default Tasks;
