import React, { useContext, useEffect, useState } from "react";
import { Spin, Tooltip, Timeline, Checkbox, Modal, Drawer, Button, Row, Col, Table, Input, Form, message } from "antd";
import { CheckCircleTwoTone, FlagTwoTone, DeleteFilled } from "@ant-design/icons";

import AuthService from "../../services/auth";
import CropService from "../../services/crop";
import { CropRecordForm } from "../../components";
import MobileView from "./mobileView";
import LayerTable from "./layerTable";
import { SharedContext } from "../../context";
import "./index.less";

const CropRecords = () => {
  const [farmRecord, setFarmRecords] = useState([]);
  const [cropRecord, setCropRecords] = useState([]);
  const [cropRecordActive, setCropRecordsActive] = useState([]);
  const [csrUsers, setCsrUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState({ id: 0 });
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
      </>
    ),
  },
  ];

  const [stages, setStages] = useState([]);
  const [title, setTitle] = useState("");
  const [layerId, setLayerId] = useState(0);
  const [date, setDate] = useState({});

  const updateStages = (data) => {
    const layer = data;
    const config = JSON.parse(layer.config);
    setLayerId(layer.id);
    setDate(layer.date);
    setTitle(`${layer.crop} - ${new Date(layer.date).toDateString()}`);
    setStages(() => config.stages);
    setTimeline(true);
  };

  const showActivity = (item) => {
    if (item.config) {
      CropService.getLayerRecord({ id: item.id }).then(response => {
        updateStages(response.data.layer);
      }).catch(err => {
        message.error(err.response.data.message);
      });
    } else {
      message.error('No POP for this crop, please contact CSR');
    }
  };

  const updateStage = (id) => {
    CropService.updateLayerRecord({ id: layerId, stageId: id }).then(response => {
      message.success(response.data.message);
      updateStages(response.data.layer);
    }).catch(err => {
      message.error(err.response.data.message);
    });
  };

  const getTimeLineDate = (stage) => {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + stage.day);
    if (stage.stage === "presowing") {
      if (stage.day > -7) {
        return `${Math.abs(stage.day)} day(s) before`;
      } else {
        return `${Math.abs(parseInt(stage.day/7))} week(s) before`;
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
    if (stage.day === 0) {
      return (
        <Button type="link" disabled>
          <FlagTwoTone style={{ fontSize: '30px' }} twoToneColor={color} />
        </Button>
      )
    }
    if (stage.completed) {
      return (
        <Button type="link" disabled>
          <CheckCircleTwoTone twoToneColor={"green"} />
        </Button>
      )
    }
    else {
      return (
        <Button onClick={() => updateStage(stage.id)} type="link">
          <CheckCircleTwoTone twoToneColor={color} />
        </Button>
      )
    }
  }

  const expandedRowRender = (item) => {
    return (
      <LayerTable showActivity={showActivity} dataSource={item} farmId={item.id} />
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

  const openNewForm = () => {
    setAction("add_crop");
    setShowDrawer(true);
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

  return (
    <>
      <Modal bodyStyle={{ height: '80vh' }} width={900} title={title} footer={null} visible={timeline} onCancel={() => setTimeline(false)}>
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
                </Timeline.Item>
              ))}
            </Timeline>
          </Spin>
        </div>
      </Modal>
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
          {(action === "edit_crop" || action === "add_crop") && (
            <CropRecordForm onAdd={onAdd} onClose={() => setShowDrawer(false)} csrUsers={csrUsers} crops={cropRecordActive} farms={farmRecord} form={form} onFinish={onFinish} />
          )}
        </Spin>
      </Drawer>
    </>
  );
};

export default CropRecords;
