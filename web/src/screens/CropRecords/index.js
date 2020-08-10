import React, { useEffect, useState } from "react";
import { Timeline, Modal, Drawer, Button, Row, Col, Table, Input, Form, message } from "antd";
import { CalendarFilled } from "@ant-design/icons";

import AuthService from "../../services/auth";
import CropService from "../../services/crop";
import { CropRecordForm } from "../../components";
import MobileView from "./mobileView";

const CropRecords = () => {
  const [farmRecord, setFarmRecords] = useState([]);
  const [cropRecord, setCropRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState({ id: 1 });
  const [action, setAction] = useState("add_farm");
  const [timeline, setTimeline] = useState(false);

  const showTimeLine = () => {
    setTimeline(true);
  };

  const columns = [
  { title: "Farm Name (# Khata)", key: "farmname", ellipsis: true, render: (_, item) => (<p>{item.Farm.name} (# {item.Farm.khata})</p>) },
    { title: "Plot", dataIndex: "name", key: "name", ellipsis: true },
    { title: "Crop Layer One", dataIndex: "layerOne", key: "layerOne", ellipsis: true, render: (_, item) => (
      <>{item.layerOne} <Button onClick={showTimeLine}><CalendarFilled /> </Button></>
    )},
    { title: "Crop Layer Two", dataIndex: "layerTwo", key: "layerTwo", ellipsis: true },
    { title: "Crop Layer Three", dataIndex: "layerThree", key: "layerThree", ellipsis: true },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, item) => (
    //     <>
    //       <Tooltip placement="top" title='Add Crop'>
    //         <Button type="link" icon={<PlusOutlined />} onClick={() => review(item, "add_crop")} />
    //       </Tooltip>
    //       <Tooltip placement="top" title='Edit Crop'>
    //         <Button
    //           type="link"
    //           onClick={() => {
    //             review(item, "edit_crop");
    //           }}
    //           icon={<EditFilled />}
    //         />
    //       </Tooltip>
    //     </>
    //   ),
    // },
  ];

  const review = (e) => {
    console.log(e);
  }

  const [formSearch] = Form.useForm();
  const search = async () => {
    const values = await formSearch.validateFields();
    fetchAndUpdateRecords(values);
  };

  const fetchAndUpdateRecords = (values = { search: "" }) => {
    setLoading(true);
    CropService.getCropRecords().then(
      (response) => {
        setFarmRecords(() => response.data.farms);
        setCropRecords(() => response.data.crops);
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

  const onFinish = (values) => {
    const crops = [];
    let sections = 0;
    farmRecord.forEach(farm => {
      if (farm.id === values.farm) {
        sections = [...JSON.parse(farm.partitions).partitions].length;
      }
    });
    for (let i = 0; i < sections; i++) {
      const sectionName = `Plot ${i+1}`;
      crops.push({
        name: sectionName,
        layerOne: values[`${sectionName}_layerOne`],
        layerTwo: values[`${sectionName}_layerTwo`],
        layerThree: values[`${sectionName}_layerThree`],
      });
    }
    CropService.addCropRecords({farmId: values.farm, crops: crops}).then(response => {
      fetchAndUpdateRecords();
      setShowDrawer(false);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  }

  const openNewForm = () => {
    setAction("add_crop");
    setShowDrawer(true);
  }

  return (
    <>
      <Modal title='Mango POP' footer={null} visible={timeline} onCancel={() => setTimeline(false)}>
        <Timeline mode='left'>
          <Timeline.Item label="2015-09-01">Land Preparation <p>INM: 1. Well decomped FYM
8 to 10 tons/acre
inoculum T viridae & P floroscens 2 Kg/acre each
AND/OR
2. Vermicompost
5 tons/acre
inoculum T viridae & P floroscens 2 Kg/acre each</p></Timeline.Item>
          <Timeline.Item label="2015-09-02">Soil Preparation</Timeline.Item>
          <Timeline.Item label="2015-09-03">Fertigation</Timeline.Item>
          <Timeline.Item color="red" label="2015-09-04">Seed Treatment</Timeline.Item>
          <Timeline.Item color="gray" label="2015-09-05">Irrigation</Timeline.Item>
          <Timeline.Item color="gray" label="2015-09-06">Sowing Okra Seed</Timeline.Item>
        </Timeline>
      </Modal>
      <Row style={{ padding: "10px", borderTop: "1px solid #90d150" }}>
        <Col xs={12} md={12} lg={12} xl={12}>
          <Form form={formSearch} layout="vertical">
            <Form.Item
              name="search"
              onChange={search}
              style={{ marginBottom: "0" }}
            >
              <Input placeholder="Search with Name" />
            </Form.Item>
          </Form>
        </Col>
        <Col
          xs={10}
          md={10}
          lg={10}
          xl={10}
          offset={2}
          style={{ textAlign: "end" }}
        >
          <Button type="primary" onClick={openNewForm}>
            Add Crop Record
          </Button>
        </Col>
      </Row>
      <Row style={{ padding: "10px" }}>
        <Col
          xs={0}
          sm={0}
          md={window.innerWidth === 768 ? 0 : 24}
          lg={24}
          xl={24}
        >
          <Table
            className="g-table-striped-rows g-ant-table-cell \"
            ellipses={true}
            dataSource={cropRecord}
            columns={columns}
            loading={loading}
            rowKey="id"
            bordered
          />
        </Col>
      </Row>
      {/* <MobileView
        farms={cropRecord}
      /> */}
      <Drawer
        visible={showDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={() => setShowDrawer(false)}
      >
        {(action === "edit_crop" || action === "add_crop") && (
          <CropRecordForm farms={farmRecord} form={form} onFinish={onFinish} />
        )}
      </Drawer>
    </>
  );
};

export default CropRecords;
