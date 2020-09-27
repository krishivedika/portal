import React, { useState, useEffect, useContext } from "react";
import { Spin, Input, Table, Row, Col, Card, Tooltip, Form, message, Button, Drawer, Descriptions } from "antd";
import { DeleteFilled } from "@ant-design/icons";

import CropService from "../../services/crop";
import { SharedContext } from "../../context";
import { ActivityForm } from "../../components";

const Sme = () => {

  const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  const [formSearch] = Form.useForm();
  const [form] = Form.useForm();
  const [showDrawer, setShowDrawer] = useState(false);
  const [state, setState] = useContext(SharedContext);
  const [activties, setActivities] = useState([]);
  const [dimensions, setDimensions] = useState({});

  const columns = [
    { title: "Crop", dataIndex: "crop", key: "crop" },
    { title: "Activity Type", dataIndex: "type", key: "type" },
    { title: "Activity", dataIndex: "name", key: "name" },
    { title: "Order", dataIndex: "order", key: "order", sorter: (a,b) => a.order - b.order },
    { title: "Dimension Type", dataIndex: "dimensionType", key: "dimensionType", sorter: (a,b) => a.order - b.order, render: (_, item) => (<p>{capitalize(item.dimensionType)}</p>) },
    { title: "Dimension", dataIndex: "dimension", key: "dimension" },
    {
      title: "Action",
      key: "action",
      render: (_, item) => (
        <>
          <Tooltip placement="top" title='Delete Activity'>
            <Button
              type="link"
              onClick={() => deleteActivity(item)}
              icon={<DeleteFilled />}
            />
          </Tooltip>
        </>
      ),
    },
  ]
  useEffect(() => {
    fetchAndUpdateRecords();
  }, []);

  const deleteActivity = (item) => {
    CropService.deleteActivityRecord(item).then(response => {
      message.success(response.data.message);
      fetchAndUpdateRecords();
    }).catch(err => {
      message.error(err.response.data.message);
    });
  };

  const search = async () => {
    const values = await formSearch.validateFields();
    fetchAndUpdateRecords(values);
  };

  const openNewForm = () => {
    setShowDrawer(true);
  };

  const closeNewForm = () => {
    setShowDrawer(false);
  };

  const onFinish = (values) => {
    CropService.createActivityRecord(values).then(response => {
      message.success(response.data.message);
      fetchAndUpdateRecords();
      form.resetFields();
      setShowDrawer(false);
    }).catch(err => {
      message.error(err.response.data.message);
    });
  };

  const fetchAndUpdateRecords = async (values = { search: "" }) => {
    const formValues = await formSearch.validateFields();
    CropService.getActivities(formValues).then(response => {
      setActivities(response.data.activities);
      setDimensions(() => {
        return {
          irrigations: response.data.irrigations,
          soils: response.data.soils,
          seasons: response.data.seasons,
          farmings: response.data.farmings,
          cultivations: response.data.cultivations,
          crops: response.data.cropTypes,
          inventory: response.data.inventoryTypes,
          machinery: response.data.machineryTypes,
        }
      });
    });
  };

  return (
    <>
      <Row style={{ padding: "10px", borderTop: "1px solid #90d150" }}>
      <Col xs={12} md={12} lg={14} xl={14}>
        <Form form={formSearch} layout="inline">
          <Form.Item
            name="search"
          >
            <Input onPressEnter={search} placeholder="Crop Name" />
          </Form.Item>
        </Form>
      </Col>
      <Col
        xs={10}
        md={10}
        lg={8}
        xl={8}
        offset={2}
        style={{ textAlign: "end" }}
      >
        <Button type="primary" onClick={openNewForm}>
            Add Activity
        </Button>
      </Col>
    </Row>
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
          ellipses={true}
          dataSource={activties}
          columns={columns}
          loading={false}
          rowKey="id"
          bordered
        />
      </Col>
    </Row>
    <Drawer
        visible={showDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={() => setShowDrawer(false)}
      >
        <Spin spinning={state.spinning} size="large">
          <ActivityForm form={form} onFinish={onFinish} dimensions={dimensions} onClose={closeNewForm} />
        </Spin>
      </Drawer>
  </>
  );
}

export default Sme;
