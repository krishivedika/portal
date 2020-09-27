import React, { useEffect, useState, useContext } from "react";
import { Spin, Tooltip, Drawer, Button, Row, Col, Table, Form, message } from "antd";
import { PlusOutlined, DeleteFilled, SettingOutlined, EditFilled } from "@ant-design/icons";

import AuthService from "../../services/auth";
import WarehouseService from "../../services/warehouse";
import { WarehouseForm, InventoryForm, MachineryForm } from "../../components";
import InventoryTable from "./inventoryTable";
import MachineryTable from "./machineryTable";
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
  const [selectedItem, setSelectedItem] = useState({ id: 0 });
  const [action, setAction] = useState("add_warehouse");
  const [state, setState] = useContext(SharedContext);
  const [csrUsers, setCsrUsers] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [machineries, setMachineries] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchAndUpdateRecords();
  }, []);

  const user = AuthService.getCurrentUser();

  let columns = [];
  if (user.roles[0] !== "FARMER") {
    columns = [
      {
        title: "Member", key: "member", ellipsis: true, render: (_, item) => (
          <>{item.User.firstName} ({item.User.phone})</>
        )
      },
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
            <Tooltip placement="top" title='Add Machinery'>
              <Button type="link" icon={<SettingOutlined />} onClick={() => review(item, "add_machinery")} />
            </Tooltip>
            <Tooltip placement="top" title='Edit Warehouse'>
              <Button type="link" icon={<EditFilled />} onClick={() => editWarehouse(item, "edit_warehouse")} />
            </Tooltip>
            <Tooltip placement="top" title='Delete Warehouse'>
              <Button type="link" icon={<DeleteFilled />} onClick={() => deleteWarehouse(item, "delete_warehouse")} />
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

  const [fields, setFields] = useState({});
  const editWarehouse = (item, action) => {
    setAction(action)
    setFields(item);
    setShowDrawer(true);
  };

  const deleteWarehouse = (item, action) => {
    WarehouseService.deleteWarehouse({id: item.id}).then(response => {
      message.success(response.data.message);
      fetchAndUpdateRecords();
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    })
  };

  const fetchAndUpdateRecords = () => {
    setLoading(true);
    WarehouseService.getWarehouses().then(
      (response) => {
        setWarehouses(() => response.data.warehouses);
        setCsrUsers(() => response.data.csrUsers);
        setInventories(() => response.data.inventories);
        setMachineries(() => response.data.machineries);
        setBrands(() => response.data.brands);
        setLoading(false);
      }
    );
  };

  const [form] = Form.useForm();

  const onFinishUpdate = (values) => {
    values.id = fields.id;
    WarehouseService.updateWarehouse(values).then(response => {
      fetchAndUpdateRecords();
      setFields(() => ({}));
      setShowDrawer(false);
      form.resetFields();
      message.success(response.data.message);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

  const onFinish = (values) => {
    WarehouseService.addWarehouse(values).then(response => {
      fetchAndUpdateRecords();
      setShowDrawer(false);
      form.resetFields();
      message.success(response.data.message);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

  const openNewForm = (e) => {
    setAction("add_warehouse");
    setShowDrawer(true);
  };

  const onDrawerClose = () => {
    setLoading(false);
    setFields({});
    setShowDrawer(false);
  };

  const [formInventory] = Form.useForm();
  const [showInventoryDrawer, setShowInventoryDrawer] = useState(false);

  const onFinishInventory = (values) => {
    let formValues = { ...values };
    formValues.warehouse = selectedItem.id;
    if (selectedItem.id)
    WarehouseService.addInventory(formValues).then(response => {
      fetchAndUpdateRecords();
      formInventory.resetFields();
      setShowInventoryDrawer(false);
      if (values.add) setShowInventoryDrawer(true);
      message.success(response.data.message);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

  const onFinishUpdateInventory = (values) => {
    let formValues = { ...values };
    formValues.id = selectedItem.id;
    if (selectedItem.id)
    WarehouseService.updateInventory(formValues).then(response => {
      fetchAndUpdateRecords();
      formInventory.resetFields();
      setShowInventoryDrawer(false);
      if (values.add) setShowInventoryDrawer(true);
      message.success(response.data.message);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

  const onAdd = async () => {
    try {
      const values = await formInventory.validateFields();
      values.add = true;
      onFinishInventory(values);
    } catch (err) {
      console.log(err);
    }
  }

  const onInventoryDrawerClose = () => {
    setLoading(false);
    setShowInventoryDrawer(false);
  };

  const [formMachinery] = Form.useForm();

  const onAddMachinery = async () => {
    try {
      const values = await formMachinery.validateFields();
      values.add = true;
      onFinishMachinery(values);
    } catch (err) {
      console.log(err);
    }
  }

  const onFinishMachinery = (values) => {
    let formValues = { ...values };
    formValues.warehouse = selectedItem.id;
    if (selectedItem.id)
    WarehouseService.addMachinery(formValues).then(response => {
      fetchAndUpdateRecords();
      formMachinery.resetFields();
      setShowInventoryDrawer(false);
      if (values.add) setShowInventoryDrawer(true);
      message.success(response.data.message);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

  const onFinishUpdateMachinery = (values) => {
    let formValues = { ...values };
    formValues.id = selectedItem.id;
    if (selectedItem.id)
    WarehouseService.updatemachinery(formValues).then(response => {
      fetchAndUpdateRecords();
      formMachinery.resetFields();
      setShowInventoryDrawer(false);
      if (values.add) setShowInventoryDrawer(true);
      message.success(response.data.message);
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

  const expandedRowRender = (item) => {
    return (
      <>
      <InventoryTable review={review} dataSource={warehouses} warehouse={item} review={review} />
      <MachineryTable review={review} dataSource={warehouses} warehouse={item} review={review} />
      </>
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
            rowClassName={(record, index) => record.isActive ? '' : 'g-table-striped-rows-danger'}
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
          {action === "add_warehouse" &&
            <WarehouseForm
              type={action}
              fields={{}}
              form={form}
              csrUsers={csrUsers}
              onFinish={onFinish}
              onClose={onDrawerClose}
            />
          }
          {action === "edit_warehouse" &&
            <WarehouseForm
              type={action}
              fields={fields}
              form={form}
              csrUsers={csrUsers}
              onFinish={onFinishUpdate}
              onClose={onDrawerClose}
            />
          }
        </Spin>
      </Drawer>
      <Drawer
        visible={showInventoryDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={onInventoryDrawerClose}
      >
        <Spin spinning={state.spinning} size="large">
          {action === "add_inventory" &&
            <InventoryForm
              type={action}
              fields={{ warehouse: selectedItem.name }}
              form={formInventory}
              onAdd={onAdd}
              inventories={inventories}
              brands={brands}
              onFinish={onFinishInventory}
              onClose={onInventoryDrawerClose}
            />
            }
          {action === "edit_inventory" &&
            <InventoryForm
              type={action}
              fields={{ ...selectedItem, warehouse: selectedItem.name }}
              form={formInventory}
              onAdd={onAdd}
              inventories={inventories}
              brands={brands}
              onFinish={onFinishUpdateInventory}
              onClose={onInventoryDrawerClose}
            />
          }
          {action === "add_machinery" &&
            <MachineryForm
              type={action}
              fields={{ ...selectedItem, warehouse: selectedItem.name }}
              form={formMachinery}
              onAdd={onAddMachinery}
              machineries={machineries}
              onFinish={onFinishMachinery}
              onClose={onInventoryDrawerClose}
            />
          }
          {action === "edit_machinery" &&
            <MachineryForm
              type={action}
              fields={{ ...selectedItem, warehouse: selectedItem.name }}
              form={formMachinery}
              onAdd={onAddMachinery}
              machineries={machineries}
              onFinish={onFinishUpdateMachinery}
              onClose={onInventoryDrawerClose}
            />
          }
        </Spin>
      </Drawer>
    </>
  );
};

export default Warehouse;
