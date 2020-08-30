import React, { useEffect, useState, useContext } from "react";
import { Spin, Tooltip, Checkbox, Drawer, Button, Row, Col, Table, Input, Form, message } from "antd";
import { AppstoreOutlined, EditFilled, DeleteFilled, PlusOutlined, ReloadOutlined } from "@ant-design/icons";

import AuthService from "../../services/auth";
import UserService from "../../services/user";
import WarehouseService from "../../services/warehouse";
import { FarmRecordForm, PartitionForm, SurveyForm } from "../../components";
import SurveyTable from "./surveyTable";
import MobileView from "./mobileView";
import { SharedContext } from "../../context";

const layout = {
  labelCol: { offset: 0, span: 0 },
  wrapperCol: { span: 12 },
};

const FarmRecords = () => {
  const [farmRecord, setFarmRecord] = useState([]);
  const [csrUsers, setCsrUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showPartitionDrawer, setShowPartitionDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState({id: 0});
  const [action, setAction] = useState("add_farm");
  const [state, setState] = useContext(SharedContext);

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
    { title: "Farm Name", dataIndex: "name", key: "name", ellipsis: true },
    { title: "Khata", dataIndex: "khata", key: "khata", ellipsis: true },
    { title: "State", dataIndex: "state", key: "state" },
    { title: "District", dataIndex: "district", key: "district" },
    { title: "Mandal", dataIndex: "mandala", key: "mandala" },
    { title: "Village", dataIndex: "panchayat", key: "panchayat" },
    {
      title: "Action",
      key: "action",
      render: (_, item) => (
        <>
          {item.isActive &&
            <>
              <Tooltip placement="top" title='Add Survey #'>
                <Button type="link" icon={<PlusOutlined />} onClick={() => review(item, "add_survey")} />
              </Tooltip>
              <Tooltip placement="top" title='Edit Farm'>
                <Button
                  type="link"
                  onClick={() => {
                    review(item, "edit_farm");
                  }}
                  icon={<EditFilled />}
                />
              </Tooltip>
              <Tooltip placement="top" title='Delete Farm'>
                <Button
                  type="link"
                  onClick={() => deleteRecord(item)}
                  icon={<DeleteFilled />}
                />
              </Tooltip>
              <Tooltip placement="top" title='Plot Farm'>
                <Button
                  disabled={item.Surveys.length === 0}
                  type="link"
                  onClick={() => reviewPartition(item, "partition_farm")}
                  icon={<AppstoreOutlined />}
                />
              </Tooltip>
            </>
          }
          {!item.isActive &&
            <Tooltip placement="top" title='Restore Farm'>
              <Button
                type="link"
                onClick={() => restoreRecord(item)}
                icon={<ReloadOutlined />}
              />
            </Tooltip>
          }
        </>
      ),
    },
  ];

  const [partitionForm] = Form.useForm();

  const onPartitionDrawerClose = () => {
    setLoading(false);
    setShowPartitionDrawer(false);
  };

  const onFinishPartition = (values) => {
    let total = 0;
    Object.entries(values).forEach(entry => {
      total += entry[1];
    });
    UserService.partitionFarmRecords({id: selectedItem.id, partitions: values}).then(response => {
      message.info('Successfully partitioned');
      fetchAndUpdateRecords();
      setShowPartitionDrawer(false);
    }).catch(err => {
      console.log(err);
      message.err(`Failed, ${err.response.data.message}`)
    });
  }

  const reviewPartition = (item, action) => {
    setLoading(true);
    setAction(action);
    setSelectedItem(() => item);
    setShowPartitionDrawer(true)
  };

  const restoreRecord = (item) => {
    UserService.restoreFarmRecords({id: item.id}).then(response => {
      message.success(response.data.message);
      fetchAndUpdateRecords();
    }).catch(err => {
      message.error(err.response.data.message);
    });
  };

  const deleteRecord = (item) => {
    UserService.deleteFarmRecords(item.id).then(response => {
      message.success(response.data.message);
      fetchAndUpdateRecords();
    }).catch(err => {
      message.error(err.response.data.message);
    });
  };

  const [formSearch] = Form.useForm();
  const search = async () => {
    const values = await formSearch.validateFields();
    fetchAndUpdateRecords(values);
  };

  const fetchAndUpdateRecords = (values = { search: "", deleted: false }) => {
    setLoading(true);
    UserService.getFarmRecords({ search: values.search || "",  deleted: values.deleted || false}).then(
      (response) => {
        const tempFarms = [];
        response.data.farms.forEach(farm => {
          farm.ownerAge = new Date().getFullYear() - new Date(farm.ownerAge).getFullYear();
          tempFarms.push(farm);
        });
        setFarmRecord(() => tempFarms);
        setCsrUsers(() => response.data.csrUsers);
        WarehouseService.getWarehouses().then(response => {
          setWarehouses(() => response.data.warehouses);
          setLoading(false);
        }).catch(err => {
          console.log(err);
          message.error(err.response.data.message);
        });
      }
    );
  };

  const review = (item, action) => {
    setLoading(true);
    setAction(action);
    if (item.Warehouses) {
      if (item.Warehouses.length !== 0) item.warehouse = item.Warehouses[0].name;
    }
    setSelectedItem(() => item);
    setShowDrawer(true);
  };

  const [form] = Form.useForm();

  const onAdd = async () => {
    try {
      const values = await form.validateFields();
      values.add = true;
      onFinish(values);
    } catch(err) {
      console.log(err);
    }
  }

  const onFinish = (values) => {
    let formValues = { ...values };
    if (selectedItem.id) {
      formValues.id = selectedItem.id;
      UserService.updateFarmRecords(formValues)
        .then(() => {
          message.success(`Farm Record Successfully Added.`);
          setShowDrawer(false);
          form.resetFields();
          fetchAndUpdateRecords();
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          message.error(
            `Failed to update Farm Record, ${err.response.data.message}`
          );
        });
    } else {
      UserService.addFarmRecords(formValues)
        .then(() => {
          message.success(`Farm Record Successfully Added.`);
          setShowDrawer(false);
          form.resetFields();
          fetchAndUpdateRecords();
          setLoading(false);
          if (values?.add) setShowDrawer(true);
        })
        .catch((err) => {
          console.log(err);
          message.error(
            `Failed to add Farm Record, ${err.response.data.message}`
          );
        });
    }
  };

  const [surveyForm] = Form.useForm();

  const onAddSurvey = async () => {
    try {
      const values = await surveyForm.validateFields();
      values.add = true;
      onFinishSurvey(values);
    } catch(err) {
      console.log(err);
    }
  }

  const onFinishSurvey = (values) => {
    let formValues = { ...values };
    if (selectedItem.FarmId) {
      formValues.FarmId = selectedItem.FarmId;
      formValues.khata = selectedItem.khata;
      formValues.id = selectedItem.id;
      UserService.updateSurvey(formValues)
        .then(() => {
          message.success(`Survey Successfully Updated.`);
          setShowDrawer(false);
          surveyForm.resetFields();
          fetchAndUpdateRecords();
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          message.error(
            `Failed to update Survey, ${err.response.data.message}`
          );
        });
    } else {
      formValues.FarmId = selectedItem.id;
      UserService.addSurvey(formValues)
        .then(() => {
          message.destroy();
          message.success(`Survey Successfully Added.`);
          setShowDrawer(false);
          surveyForm.resetFields();
          fetchAndUpdateRecords();
          setLoading(false);
          if (values?.add) setShowDrawer(true);
        })
        .catch((err) => {
          console.log(err);
          message.error(`Failed to add Survey, ${err.response.data.message}`, 0);
        });
    }
  };

  const deleteSurveyRecords = (id) => {
    UserService.deleteSurvey({id}).then(response => {
      message.success(response.data.message);
      fetchAndUpdateRecords();
    }).catch(err => {
      console.log(err);
      message.error(err.response.data.message);
    });
  };

  const openNewForm = () => {
    setAction("add_farm");
    UserService.getUser({ id: user.id }).then(response => {
      form.resetFields();
      response.data.user.age = new Date().getFullYear() - new Date(response.data.user.age).getFullYear();
      setSelectedItem({
        isSelf: true,
        ownerFirstName: response.data.user.firstName,
        ownerLastName: response.data.user.lastName,
        ownerAge: response.data.user.age,
        ownerGender: response.data.user.gender,
        role: response.data.user.Roles[0].id,
        name: '',
        streetAddress: '',
        state: '',
        district: '',
        mandala: '',
        panchayat: '',
        khata: '',
        relationship: '',
      });
      setShowDrawer(true);
    });
  };

  const onDrawerClose = () => {
    setLoading(false);
    setShowDrawer(false);
  };

  const expandedRowRender = (item) => {
    return (
      <SurveyTable dataSource={farmRecord} farmId={item.id} review={review} delete={deleteSurveyRecords}/>
    );
  };

  return (
    <>
      <Row style={{ padding: "10px", borderTop: "1px solid #90d150" }}>
        <Col xs={12} md={12} lg={14} xl={14}>
          <Form form={formSearch} layout="inline">
            <Form.Item
              name="search"
            >
              <Input onPressEnter={search} placeholder="Farm Name" />
            </Form.Item>
            <Form.Item name="deleted" valuePropName="checked" style={{fontWeight: 'bold'}}>
              <Checkbox onChange={search}>Include Deleted</Checkbox>
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
            Add Farm Record
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
            dataSource={farmRecord}
            columns={columns}
            loading={loading}
            rowKey="id"
            bordered
            expandable={{ expandedRowRender, expandRowByClick: true }}
          />
        </Col>
      </Row>
      <MobileView
        farms={farmRecord}
        review={review}
        deleteRecord={deleteRecord}
        restoreRecord={restoreRecord}
        reviewPartition={reviewPartition}
        deleteSurvey={deleteSurveyRecords}
      />
      <Drawer
        visible={showDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={onDrawerClose}
        footerStyle={{textAlign: 'right'}}
        footer={
          <Row justify="end">
            <Col>
            <Form key="save" form={form} layout="inline">
            <Form.Item>
              <Button type="primary" htmlType="submit">Save</Button>
            </Form.Item>
            {action === 'add_farm' &&
              <Form.Item>
                <Button htmlType="button" onClick={onAdd}>Save And Add</Button>
              </Form.Item>
            }
            <Form.Item>
              <Button type="danger" onClick={onDrawerClose}>Cancel</Button>
            </Form.Item>
          </Form>
            </Col>
          </Row>
        }
      >
        {showDrawer &&
        <Spin spinning={state.spinning} size="large">
          {(action === "edit_farm" || action === "add_farm") && (
            <FarmRecordForm
              type={action}
              fields={selectedItem}
              form={form}
              warehouses={warehouses}
              csrUsers={csrUsers}
              onFinish={onFinish}
              onClose={onDrawerClose}
              onAdd={onAdd}
            />
          )}
          {(action === "add_survey" || action === "edit_survey") && (
            <SurveyForm
              type={action}
              fields={selectedItem}
              form={surveyForm}
              onFinish={onFinishSurvey}
              onClose={onDrawerClose}
              onAdd={onAddSurvey}
            />
          )}
        </Spin>
        }
      </Drawer>
      <Drawer
        visible={showPartitionDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={onPartitionDrawerClose}
      >
        <Spin spinning={state.spinning} size="large">
          <PartitionForm onClose={onPartitionDrawerClose} form={partitionForm} onFinish={onFinishPartition} data={selectedItem}/>
        </Spin>
      </Drawer>
    </>
  );
};

export default FarmRecords;
