import React, { useContext, useEffect, useState } from "react";
import { Spin, Tooltip, Typography, Timeline, Checkbox, Drawer, Button, Row, Col, Table, Input, Form, message, Popconfirm, InputNumber } from "antd";
import { CheckCircleTwoTone, DeleteFilled, ReloadOutlined } from "@ant-design/icons";

import AuthService from "../../services/auth";
import CropService from "../../services/crop";
import { CropRecordForm } from "../../components";
import MobileView from "./mobileView";
import LayerTable from "./layerTable";
import { SharedContext } from "../../context";
import "./index.less";

const { Text } = Typography;

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
  { title: "Khata", key: "farmname", ellipsis: true, render: (_, item) => (<p>{item.Farm.khata}</p>) },
  { title: "Plot", dataIndex: "name", key: "name", ellipsis: true },
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
  const [date, setDate] = useState({});
  const [currentInventory, setCurrentInventory] = useState([]);
  const [inventoryTypes, setInventoryTypes] = useState([]);
  const [machineryTypes, setMachineryTypes] = useState([]);
  const [currentMachinery, setCurrentMachinery] = useState([]);
  const [initialValues, setInitialValues] = useState([]);
  const [formLabour] = Form.useForm();

  const updateStages = (data) => {
    setTimeline(false);
    const layer = data.layer;
    const config = JSON.parse(layer.config);
    setLayerId(layer.id);
    setDate(layer.date);
    setTitle(`${layer.crop} - ${new Date(layer.date).toDateString()}`);
    setStages(() => config.stages);
    const fields = [];
    const values = {};
    config.stages.forEach(s => {
      if (s.labour) {
        fields.push({ name: `${s.id}_man_labour`, value: s.man_labour });
        fields.push({ name: `${s.id}_woman_labour`, value: s.woman_labour });
        fields.push({ name: `${s.id}_cost_labour`, value: s.cost_labour });
        values[`${s.id}_man_labour`] = s.man_labour;
        values[`${s.id}_woman_labour`] = s.woman_labour;
        values[`${s.id}_cost_labour`] = s.cost_labour;
      }
    });
    formLabour.setFieldsValue(values);
    setInitialValues(fields);
    setTimeline(true);
  };

  const showActivity = (item) => {
    if (item.config) {
      CropService.getLayerRecord({ id: item.id }).then(response => {
        updateStages(response.data);
        setCurrentInventory(() => response.data.inventories);
        setInventoryTypes(() => response.data.inventoryTypes);
        setCurrentMachinery(() => response.data.machinery);
        setMachineryTypes(() => response.data.machineryTypes);
      }).catch(err => {
        message.error(err.response.data.message);
      });
    } else {
      message.error('No POP for this crop, please contact CSR');
    }
  };

  const updateStage = (id, inventoryId, confirm) => {
    let values = {
      id: layerId, stageId: id,
      confirm: confirm, inventoryId: inventoryId,
    };
    if (labour.isSet && id == labour.stage) {
      values["labour"] = true;
      values["man"] = labour.man;
      values["woman"] = labour.woman;
      values["cost"] = labour.cost;
    }
    CropService.updateLayerRecord(values).then(response => {
      message.success(response.data.message);
      updateStages(response.data);
      setCurrentInventory(() => response.data.inventories);
      setCurrentMachinery(() => response.data.machinery);
    }).catch(err => {
      message.error(err.response.data.message);
    });
  };

  const getInventoryText = (stage) => {
    const { inventory, completed } = stage;
    if (!inventory) return "";
    else {
      let text = <Text type="danger">{`Material: ${inventory.name} Quantity: ${inventory.quantity}`}</Text>;
      currentInventory.forEach(c => {
        if (c.item === inventory.name && c.metric == inventory.metric) {
          if (c.quantity >= inventory.quantity) {
            text = <Text>{`Material: ${inventory.name} Quantity: ${inventory.quantity} (In Inventory: ${c.quantity})`}</Text>;
          } else {
            if (completed) text = <Text>{`Material: ${inventory.name} Quantity: ${inventory.quantity} (In Inventory: ${c.quantity})`}</Text>;
            else text = <Text type="danger">{`Material: ${inventory.name} Quantity: ${inventory.quantity} (In Inventory: ${c.quantity})`}</Text>;
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
      let text = <Text type="danger">{`Machinery: ${machinery.name} Quantity: ${machinery.quantity}`}</Text>;
      currentMachinery.forEach(c => {
        if (c.item === machinery.name) {
          if (c.quantity >= machinery.quantity) {
            text = <Text>{`Machinery: ${machinery.name} Quantity: ${machinery.quantity}`}</Text>;
          } else if (completed) text = <Text>{`Machinery: ${machinery.name} Quantity: ${machinery.quantity}`}</Text>;
        }
      });
      return text;
    }
  }

  const getTotalCostText = (stage) => {
    let totalIventory = 0;
    let totalMachinery = 0;
    let totalLabour = 0;
    if (stage.inventory) {
      inventoryTypes.forEach(i => {
        if (i.item === stage.inventory.name && i.metric === stage.inventory.metric) {
          totalIventory += stage.inventory.quantity * i.price;
        }
      });
    }
    if (stage.machinery) {
      machineryTypes.forEach(i => {
        if (i.item === stage.machinery.name) {
          totalMachinery += stage.inventory.quantity * i.price;
        }
      });
    }
    totalLabour += (stage.man_labour || 0 + stage.woman_labour || 0 ) * (stage.cost_labour || 0);
    return {total:  totalMachinery + totalIventory + totalLabour, totalIventory, totalMachinery, totalLabour};
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
    if (stage.stage === "presowing") color = "orange";
    if (stage.stage === "presowing" && stage.completed) color = "green";
    const fontStyle = { fontSize: stage.day === 0 ? "30px" : "12px" };
    if (stage.completed) {
      return (
        <Button type="link" disabled>
          <CheckCircleTwoTone style={fontStyle} twoToneColor={"green"} />
        </Button>
      )
    }
    if (!stage.current && stage.stage !== "presowing") {
      return (
        <Button type="link" disabled>
          <CheckCircleTwoTone style={fontStyle} twoToneColor={color} />
        </Button>
      )
    }
    else {
      let inventoryId = 0;
      currentInventory.forEach(c => {
        if (c.item === stage.inventory?.name && c.metric == stage.inventory?.metric) {
          inventoryId = c.id;
        }
      });
      return (
        <Popconfirm
          title="Do you want to adjust item quantity in warehouse?"
          okText="Yes and Save Activity"
          cancelText="No and Save Activity"
          onConfirm={handleConfirm.bind(this, "confirm", stage.id, inventoryId)}
          onCancel={handleConfirm.bind(this, "cancel", stage.id, inventoryId)}
        >
          <Button type="link">
            <CheckCircleTwoTone style={fontStyle} twoToneColor={color} />
          </Button>
        </Popconfirm>
      )
    }
  };

  const handleConfirm = (confirm, stage, inventoryId, e) => {
    e.persist();
    updateStage(stage, inventoryId, confirm == "confirm" ? true : false);
  };

  const [labour, setLabour] = useState({ isSet: false, man: 0, woman: 0, stage: 0, cost: 0 });
  const enterLabour = (id, type, e) => {
    if (type === "man")
      setLabour((state) => ({ ...state, stage: id, man: e, isSet: true }));
    else if (type === "woman")
      setLabour((state) => ({ ...state, stage: id, woman: e, isSet: true }));
    else
      setLabour((state) => ({ ...state, stage: id, cost: e, isSet: true }));
  };

  const expandedRowRender = (item) => {
    return (
      <LayerTable editLayer={editLayer} deleteLayer={deleteLayer} showActivity={showActivity} dataSource={item} farmId={item.id} />
    );
  };

  const [formSearch] = Form.useForm();
  const search = async () => {
    const values = await formSearch.validateFields();
    fetchAndUpdateRecords(values);
  };

  const fetchAndUpdateRecords = (values = { search: "", deleted: false }) => {
    setLoading(true);
    CropService.getCropRecords({ search: values.search || "", deleted: values.deleted || false }).then(
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
      const values = await formSearch.validateFields();
      fetchAndUpdateRecords(values);
      setShowDrawer(false);
      form.resetFields();
      if (values?.add) setShowDrawer(true);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  }

  const onFinishEdit = (values) => {
    values = {...values, id: selectedItem.id};
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
          setSelectedItem({...item, farm: c.Farm.name, plot: c.name, layer: l.name});
        }
      })
    });
    setShowDrawer(true);
  };

  const deleteLayer = (item) => {
    CropService.deleteLayerRecord({ id: item.id }).then(async response => {
      message.success(response.data.message);
      const values = await formSearch.validateFields();
      fetchAndUpdateRecords(values);
    }).catch(err => {
      message.error(err.response.data.message);
    });
  }

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
                  <p>{s.inm ? `INM: ${s.inm}` : ""}</p>
                  <p>{s.ipm ? `IPM: ${s.ipm}` : ""}</p>
                  <p>{getInventoryText(s)}</p>
                  <p>{getMachineryText(s)}</p>
                  <p><a href="http://www.krishivedika.com/" target="_blank">Purchase at KrishiVedika</a></p>
                  {s.labour &&
                    <>
                    <Form form={formLabour} layout="inline" initialValues={initialValues}>
                      <Form.Item name={`${s.id}_man_labour`} label="Man Labour">
                        <InputNumber disabled={s.completed || false} onChange={enterLabour.bind(this, s.id, "man")} placeholder="0" min={1} />
                      </Form.Item>
                      <Form.Item name={`${s.id}_woman_labour`} label="Woman Labour">
                        <InputNumber disabled={s.completed || false} onChange={enterLabour.bind(this, s.id, "woman")} placeholder="0" min={1} />
                      </Form.Item>
                      <Form.Item name={`${s.id}_cost_labour`} label="Cost">
                        <InputNumber disabled={s.completed || false} onChange={enterLabour.bind(this, s.id, "cost")} placeholder="0" min={1} />
                      </Form.Item>
                    </Form>
                    <Tooltip
                    title={`Total: ${getTotalCostText(s).total}, Inventory: ${getTotalCostText(s).totalIventory}, Machinery: ${getTotalCostText(s).totalMachinery}, Labour: ${getTotalCostText(s).totalLabour}`}
                    placement="top"
                    >
                    <p>Total Activity Cost: {getTotalCostText(s)['total']}</p>
                    </Tooltip>
                    </>
                  }
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
      />
      <Drawer
        visible={showDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={() => setShowDrawer(false)}
      >
        <Spin spinning={state.spinning} size="large">
          {action === "add_crop" &&
            <CropRecordForm type={action} onAdd={onAdd} onClose={() => setShowDrawer(false)} csrUsers={csrUsers} crops={cropRecordActive} farms={farmRecord} form={form} onFinish={onFinish} />
          }
          {action === "edit_crop" &&
            <CropRecordForm fields={selectedItem} type={action} onAdd={onAdd} onClose={() => setShowDrawer(false)} csrUsers={csrUsers} crops={cropRecordActive} farms={farmRecord} form={form} onFinish={onFinishEdit} />
          }
        </Spin>
      </Drawer>
    </>
  );
};

export default CropRecords;
