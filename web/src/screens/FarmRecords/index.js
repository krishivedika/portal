import React, { useEffect, useState } from "react";
import { Tooltip, Checkbox, Drawer, Button, Row, Col, Table, Input, Form, message } from "antd";
import { AppstoreOutlined, EditFilled, DeleteFilled, PlusOutlined, ReloadOutlined } from "@ant-design/icons";

import AuthService from "../../services/auth";
import UserService from "../../services/user";
import { FarmRecordForm, PartitionForm, SurveyForm } from "../../components";
import SurveyTable from "./surveyTable";
import MobileView from "./mobileView";

const layout = {
  labelCol: { offset: 0, span: 0 },
  wrapperCol: { span: 12 },
};

const FarmRecords = () => {
  const [farmRecord, setFarmRecord] = useState([]);
  const [csrUsers, setCsrUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showPartitionDrawer, setShowPartitionDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState({id: 0});
  const [action, setAction] = useState("add_farm");

  const columns = [
    { title: "Farm Name", dataIndex: "name", key: "name", ellipsis: true },
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
    UserService.restoreFarmRecords({id: item.id}).then(() => {
      fetchAndUpdateRecords();
    });
  };

  const deleteRecord = (item) => {
    UserService.deleteFarmRecords(item.id).then(() => {
      fetchAndUpdateRecords();
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
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchAndUpdateRecords();
  }, []);

  const review = (item, action) => {
    setLoading(true);
    setAction(action);
    setSelectedItem(() => item);
    setShowDrawer(true);
  };

  const [form] = Form.useForm();
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
          fetchAndUpdateRecords();
          setLoading(false);
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
          message.success(`Survey Successfully Added.`);
          setShowDrawer(false);
          fetchAndUpdateRecords();
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          message.error(`Failed to add Survey, ${err.response.data.message}`);
        });
    }
  };

  const user = AuthService.getCurrentUser();
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
      <SurveyTable dataSource={farmRecord} farmId={item.id} review={review} />
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
              <Input onPressEnter={search} placeholder="Search with Name" />
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
      />
      <Drawer
        visible={showDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={onDrawerClose}
      >
        {(action === "edit_farm" || action === "add_farm") && (
          <FarmRecordForm
            type={action}
            fields={selectedItem}
            form={form}
            csrUsers={csrUsers}
            onFinish={onFinish}
          />
        )}
        {(action === "add_survey" || action === "edit_survey") && (
          <SurveyForm
            type={action}
            fields={selectedItem}
            form={surveyForm}
            onFinish={onFinishSurvey}
          />
        )}
      </Drawer>
      <Drawer
        visible={showPartitionDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={onPartitionDrawerClose}
      >
        <PartitionForm form={partitionForm} onFinish={onFinishPartition} data={selectedItem}/>
      </Drawer>
    </>
  );
};

export default FarmRecords;
