import React, { useEffect, useState } from "react";
import { Form, Input, Row, Col, Card, Tag, Button, Upload, message } from "antd";
import { SyncOutlined, PlusOutlined } from "@ant-design/icons";
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

import UserService from "../../services/user";

const { TextArea } = Input;

const layout = {
  labelCol: { offset: 0, span: 3 },
  wrapperCol: { span: 12 },
};
const tailLayout = {
  wrapperCol: { xs: {offset: 0, span: 24}, lg: {offset: 3, span: 21} },
};

const SurveyForm = (props) => {
  const [fields, setFields] = useState([]);
  const [isImagePreview, setIsImagePreview] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [fileList, setFilesList] = useState([]);

  const uploadFile = (values) => {
    const formData = new FormData();
    formData.append('file', values.file)
    formData.append('survey', props.fields.id);
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    UserService.uploadFile(formData, config).then((res) => {
      setFilesList((state) => [...state, {id: res.data.id, url: res.data.url, uid: values.file.uid, status: 'done', name: values.file.name}]);
    });
  }

  const removeFile = (file) => {
    UserService.deleteFile({survey: file.id}).then(res => {
      setFilesList((state) => {
        return state.filter(f => f.uid !== file.uid);
      });
      message.info(res.data.message);
    }).catch(err => {
      console.log(err);
    });
    setImageIndex(0);
  }

  const preview = (e) => {
    fileList.forEach((image, index) => {
      if (image.url === e.url) setImageIndex(index);
    });
    setIsImagePreview(true);
  };

  useEffect(() => {
    const fields = [];
    if (props.type === "edit_survey") {
      Object.entries(props.fields).forEach((entry) => {
        fields.push({ name: entry[0], value: entry[1] });
      });
      setFields(fields);
      const tempSurveyFiles = [...props.fields.SurveyFiles];
      tempSurveyFiles.forEach(file => file.uid = file.id);
      setFilesList(() => tempSurveyFiles);
    }
  }, [props]);

  return (
    <div style={{ margin: "15px" }}>
      {isImagePreview &&
        <Lightbox
          mainSrc={fileList[imageIndex].url}
          nextSrc={fileList[(imageIndex + 1) % fileList.length].url}
          prevSrc={fileList[(imageIndex + fileList.length - 1) % fileList.length].url}
          onCloseRequest={() => setIsImagePreview(false)}
          onMovePrevRequest={() =>
            setImageIndex((imageIndex + fileList.length - 1) % fileList.length)
          }
          onMoveNextRequest={() =>
            setImageIndex((imageIndex + 1) % fileList.length)
          }
        />
      }
      <Tag
        icon={<SyncOutlined spin />}
        color="processing"
        style={{ marginBottom: "10px" }}
      >
        {props.type === "edit_survey" ? `Editing: ${props.fields?.name}` : "Creating New Survey Record"}
      </Tag>
      <Form
        fields={fields}
        form={props.form}
        onFinish={props.onFinish}
        {...layout}
      >
        <Row>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
          <Col span={24}>
            <Card
              title="Survey"
              className="g-ant-card"
            >
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  {
                    required: true,
                    message: "Please input Survey Name",
                  },
                ]}
              >
                <Input placeholder="Enter Name" />
              </Form.Item>
              <Form.Item
                name="subdivision"
                label="Subdivision"
                rules={[
                  {
                    required: true,
                    message: "Please input Subdivision",
                  },
                ]}
              >
                <Input placeholder="Enter Subdivision" />
              </Form.Item>
              <Form.Item
                name="extent"
                label="Extent"
                rules={[
                  {
                    required: true,
                    message: "Please input Extent",
                  },
                ]}
              >
                <TextArea placeholder="Enter Extent" />
              </Form.Item>
              <Form.Item name="comment" label="Comments">
                <TextArea placeholder="Enter Comments" />
              </Form.Item>
              {props.type === "edit_survey" &&
                <Form.Item name="upload" label="" {...tailLayout}>
                  <Upload multiple={false} onPreview={preview} accept={'.jpg,.jpeg,.png,.bmp'}  listType='picture-card' onRemove={removeFile} fileList={fileList} customRequest={uploadFile}>
                      <PlusOutlined /> Upload File (JPG, PNG, BMP)
                  </Upload>
                </Form.Item>
              }
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default SurveyForm;
