import React, { useEffect, useState, useContext } from "react";
import { Spin, Tooltip, Checkbox, Drawer, Button, Row, Col, Table, Form, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import AuthService from "../../services/auth";
import WarehouseService from "../../services/warehouse";

import { WarehouseForm, InventoryForm } from "../../components";
import InventoryTable from "./inventoryTable";
import MobileView from "./mobileView";
import { SharedContext } from "../../context";

const layout = {
  labelCol: { offset: 0, span: 0 },
  wrapperCol: { span: 12 },
};

const Warehouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState({id: 0});
  const [action, setAction] = useState("add_warehouse");
  const [state, setState] = useContext(SharedContext);
  const [csrUsers, setCsrUsers] = useState([]);

  useEffect(() => {
    fetchAndUpdateRecords();
  }, []);

  const user = AuthService.getCurrentUser();

  let columns = [];
  if (user.roles[0] !== "FARMER") {
    columns = [
      { title: "Member", key: "member", ellipsis: true, render: (_, item) => (
      <>{item.User.firstName} ({item.User.phone})</>
      )},
    ];
  }

  columns = [...columns,
    { title: "Warehouse Name", dataIndex: "name", key: "name", ellipsis: true },
    { title: "Address", dataIndex: "address", key: "address", ellipsis: true },
    { title: "Created At", dataIndex: "createdAt", key: "createdAt", render: (_, item) => (<>{new Date(item.createdAt).toDateString()}</>) },
    {
      title: "Action",
      key: "action",
      render: (_, item) => (
        <>
          {item.isActive &&
            <>
              <Tooltip placement="top" title='Add Inventory'>
                <Button type="link" icon={<PlusOutlined />} onClick={() => review(item, "add_inventory")} />
              </Tooltip>
            </>
          }
        </>
      ),
    },
  ];

  const review = (item, action) => {
    setAction(action);
    setSelectedItem(() => item);
    setShowInventoryDrawer(true);
  }

  const fetchAndUpdateRecords = () => {
    setLoading(true);
    WarehouseService.getWarehouses().then(
      (response) => {
        setWarehouses(() => response.data.warehouses);
        setCsrUsers(() => response.data.csrUsers);
        setLoading(false);
      }
    );
  };

  const [form] = Form.useForm();

  const onFinish = (values) => {
    WarehouseService.addWarehouse(values).then(response => {
      console.log(response);
      fetchAndUpdateRecords();
      setShowDrawer(false);
      message.success(response.data.message);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

  const openNewForm = (e) => {
    console.log(e);
    setShowDrawer(true);
  };

  const onDrawerClose = () => {
    setLoading(false);
    setShowDrawer(false);
  };

  const [formInventory] = Form.useForm();
  const [showInventoryDrawer, setShowInventoryDrawer] = useState(false);

  const onFinishInventory = (values) => {
    let formValues = {...values};
    formValues.warehouse = selectedItem.id;
    WarehouseService.addInventory(formValues).then(response => {
      fetchAndUpdateRecords();
      setShowInventoryDrawer(false);
      message.success(response.data.message);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

  const onInventoryDrawerClose = () => {
    setLoading(false);
    setShowInventoryDrawer(false);
  };

  const expandedRowRender = (item) => {
    return (
      <InventoryTable dataSource={warehouses} warehouse={item} review={review} />
    );
  };

  return (
    <>
      <Row style={{ padding: "10px", borderTop: "1px solid #90d150" }}>
        <Col xs={12} md={12} lg={14} xl={14}>
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
            Add Warehouse
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
            className="g-table-striped-rows g-ant-table-cell"
            rowClassName={(record, index) => record.isActive ? '' :  'g-table-striped-rows-danger'}
            ellipses={true}
            dataSource={warehouses}
            columns={columns}
            loading={loading}
            rowKey="id"
            bordered
            expandable={{ expandedRowRender, expandRowByClick: true }}
          />
        </Col>
      </Row>
      <MobileView
        warehouses={warehouses}
        review={review}
      />
      <Drawer
        visible={showDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={onDrawerClose}
      >
        <Spin spinning={state.spinning} size="large">
            <WarehouseForm
              type={action}
              fields={{}}
              form={form}
              csrUsers={csrUsers}
              onFinish={onFinish}
              onClose={onDrawerClose}
            />
        </Spin>
      </Drawer>
      <Drawer
        visible={showInventoryDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={onInventoryDrawerClose}
      >
        <Spin spinning={state.spinning} size="large">
            <InventoryForm
              type={action}
              fields={{warehouse: selectedItem.name}}
              form={formInventory}
              onFinish={onFinishInventory}
              onClose={onInventoryDrawerClose}
            />
        </Spin>
      </Drawer>
    </>
  );
};

export default Warehouse;
