import React, { useEffect, useState } from "react";
import { Drawer, Button, Row, Col, Table, Input, Form, message } from "antd";
import { EditFilled, DeleteFilled } from "@ant-design/icons";

import UserService from "../../services/user";
import FarmRecordForm from "../../components/FarmRecordForm";
import SurveyForm from "../../components/SurveyForm";
import SurveyTable from "./surveyTable";
import MobileView from "./mobileView";

const FarmRecords = () => {
  const [farmRecord, setFarmRecord] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState({ id: 1 });
  const [action, setAction] = useState("add_farm");

  const columns = [
    { title: "Farm Name", dataIndex: "name", key: "name", ellipsis: true },
    { title: "Address", dataIndex: "streetAddress", key: "streetAddress", ellipsis: true },
    { title: "State", dataIndex: "state", key: "state" },
    { title: "District", dataIndex: "district", key: "district" },
    { title: "Mandala", dataIndex: "mandala", key: "mandala" },
    { title: "Panchayat", dataIndex: "panchayat", key: "panchayat" },
    {
      title: "Action",
      key: "action",
      render: (_, item) => (
        <>
          <Button type="link" onClick={() => review(item, "add_survey")}>
            Add Survey
          </Button>
          <Button
            type="link"
            onClick={() => {
              review(item, "edit_farm");
            }}
            icon={<EditFilled />}
          />
          <Button
            type="link"
            onClick={() => deleteRecord(item)}
            icon={<DeleteFilled />}
          />
        </>
      ),
    },
  ];

  const deleteRecord = (item) => {
    if (item.id) {
      UserService.deleteFarmRecords(item.id).then(() => {
        fetchAndUpdateRecords();
      });
    } else {
      UserService.deleteFarmRecords(item.item.id).then(() => {
        fetchAndUpdateRecords();
      });
    }
  };

  const [formSearch] = Form.useForm();
  const search = async () => {
    const values = await formSearch.validateFields();
    fetchAndUpdateRecords(values);
  };

  const fetchAndUpdateRecords = (values = { search: "" }) => {
    setLoading(true);
    UserService.getFarmRecords({ search: values.search || "" }).then(
      (response) => {
        const tempFarms = [...response.data.farms];
        setFarmRecord(() => tempFarms);
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
            `Failed to add Farm Record, ${err.response.data.message}`
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
            `Failed to update Farm Record, ${err.response.data.message}`
          );
        });
    }
  };

  const [surveyForm] = Form.useForm();
  const onFinishSurvey = (values) => {
    let formValues = { ...values };
    if (selectedItem.FarmId) {
      formValues.FarmId = selectedItem.FarmId;
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

  const openNewForm = () => {
    setAction("add_farm");
    setSelectedItem({});
    setShowDrawer(true);
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
      <Row style={{ padding: "15px", borderTop: "1px solid #90d150" }}>
        <Col xs={12} md={12} lg={12} xl={12}>
          <Form form={formSearch} layout="vertical">
            <Form.Item
              name="search"
              onChange={search}
              style={{ marginBottom: "0" }}
            >
              <Input placeholder="Search with Name/Address" />
            </Form.Item>
          </Form>
        </Col>
        <Col
          xs={10}
          md={10}
          lg={10}
          xl={10}
          offset={1}
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
            className="g-table-striped-rows g-ant-table-cell components-table-demo-nested"
            
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
    </>
  );
};

export default FarmRecords;
