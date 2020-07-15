import React, { useEffect, useState } from "react";
import {
  Drawer,
  Button,
  Row,
  Col,
  Table,
  Input,
  Form,
  message,
  Carousel,
} from "antd";
import { EditFilled, DeleteFilled } from "@ant-design/icons";

import UserService from "../../services/user";
import AuthService from "../../services/auth";
import FarmRecordForm from "../../components/FarmRecordForm";
import SurveyForm from "../../components/SurveyForm";
import SurveyTable from "./surveyTable";
import MobileView from "./mobileView";

const FarmRecords = () => {
  const [farmRecord, setFarmRecord] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [action, setAction] = useState("Update");

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Address", dataIndex: "streetAddress", key: "streetAddress" },
    { title: "State", dataIndex: "state", key: "state" },
    { title: "District", dataIndex: "district", key: "district" },
    { title: "Mandala", dataIndex: "mandala", key: "mandala" },
    { title: "Panchayat", dataIndex: "panchayat", key: "panchayat" },
    {
      title: "Action",
      key: "action",
      render: (_, item) => (
        <>
          <Button
            type="link"
            onClick={(event) => review(item, event)}
            style={{ padding: "0 5px" }}
          >
            Add Survey
          </Button>
          <Button
            type="link"
            onClick={(event) => {
              // event.target.innerHTML = "Update";
              review(item, event);
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
        console.log(tempFarms);
        setFarmRecord(() => tempFarms);
        setLoading(false);
      }
    );
  };

  const handleWindowResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    window.addEventListener("load", handleWindowResize);
    window.addEventListener("resize", handleWindowResize);
    fetchAndUpdateRecords();
  }, []);

  const review = (item, event) => {
    setAction(event.target.innerHTML);
    setSelectedItem(item);
    setShowDrawer(true);
  };

  const [form] = Form.useForm();
  const onFinish = (values) => {
    let currentUser = AuthService.getCurrentUser();
    let formValues = { ...values };
    formValues.userId = currentUser.id;
    if (selectedItem.id) {
      formValues.id = selectedItem.id;
      UserService.updateFarmRecords(formValues)
        .then(() => {
          message.success(`Farm Record Successfully Added.`);
          setShowDrawer(false);
          fetchAndUpdateRecords();
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
        })
        .catch((err) => {
          console.log(err);
          message.error(
            `Failed to update Farm Record, ${err.response.data.message}`
          );
        });
    }
  };

  const onFinishSurvey = (values) => {
    let formValues = { ...values };
    if (selectedItem.farmId) {
      formValues.FarmId = selectedItem.farmId ? selectedItem.farmId : selectedItem.item.farmId;
      formValues.id = selectedItem.id ? selectedItem.id : selectedItem.item.id;
      UserService.updateSurvey(formValues)
        .then(() => {
          message.success(`Survey Successfully Updated.`);
          setShowDrawer(false);
          fetchAndUpdateRecords();
        })
        .catch((err) => {
          console.log(err);
          message.error(
            `Failed to update Survey, ${err.response.data.message}`
          );
        });
    } else {
      formValues.FarmId = selectedItem.id
        ? selectedItem.id
        : selectedItem.item.id;
      UserService.addSurvey(formValues)
        .then(() => {
          message.success(`Survey Successfully Added.`);
          setShowDrawer(false);
          fetchAndUpdateRecords();
        })
        .catch((err) => {
          console.log(err);
          message.error(`Failed to add Survey, ${err.response.data.message}`);
        });
    }
  };

  const openNewForm = () => {
    setSelectedItem({});
    setShowDrawer(true);
  };

  const expandedRowRender = (item) => {
    return <SurveyTable FarmId={item.id} review={review} />;
  };

  return (
    <>
      <Row style={{ padding: "15px", borderTop: "1px solid #90d150" }}>
        <Col xs={10} sm={10} md={10} lg={16} xl={10}>
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
          sm={10}
          md={16}
          lg={16}
          xl={10}
          offset={1}
          style={{ textAlign: "end" }}
        >
          <Button type="primary" onClick={openNewForm}>
            Add Farm Record
          </Button>
        </Col>
      </Row>
      {!isMobile ? (
        <Row style={{ padding: "10px" }}>
          <Col xs={24} lg={20} xl={24}>
            <Table
              className="g-table-striped-rows g-ant-table-cell components-table-demo-nested"
              dataSource={farmRecord}
              columns={columns}
              loading={loading}
              rowKey="id"
              bordered
              expandable={{ expandedRowRender }}
            />
          </Col>
        </Row>
      ) : (
        <MobileView
          farms={farmRecord}
          review={review}
          deleteRecord={deleteRecord}
        />
      )}
      <Drawer
        visible={showDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={() => setShowDrawer(false)}
      >
        {action === "Update" && (
          <FarmRecordForm
            type="self"
            fields={selectedItem}
            form={form}
            onFinish={onFinish}
          />
        )}
        {action === "Add Survey" && (
          <SurveyForm
            type="self"
            fields={selectedItem}
            form={form}
            onFinish={onFinishSurvey}
          />
        )}
        {action === "Edit" && (
          <SurveyForm
            type="self"
            fields={selectedItem}
            form={form}
            onFinish={onFinishSurvey}
          />
        )}
      </Drawer>
    </>
  );
};

export default FarmRecords;
