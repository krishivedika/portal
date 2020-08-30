import React, { useEffect, useState } from "react";
import { Form, Input, Row, Col, Card, Button, Upload, message, InputNumber } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

import UserService from "../../services/user";

const { TextArea } = Input;

const layout = {
  labelCol: { xs: {span: 6}, md: {offset: 0, span: 5} },
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
      const temp = [...res.data.surveyFiles[0]?.SurveyFiles];
      temp.forEach(t => {
        t.uid = t.id;
      });
      setFilesList(() => [...temp]);
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
    } else {
      setFields(() => []);
      props.form.resetFields();
    }
  }, [props]);

  const [textAreaRemaining, setTextAreaRemaining] = useState(1000);
  const textAreaInput = (e) => {
    let len =  e.target.value.length;
    if (len >= 1000){
       e.preventDefault();
    } else{
       setTextAreaRemaining(1000 - len);
    }
  }

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
      <Card
        title={props.type === "edit_survey" ? `Editing Survey #: ${props.fields?.number}` : "Creating New Survey Record"}
        className="g-ant-card"
        extra={[
          <Form key="save" form={props.form} layout="inline">
            <Form.Item>
              <Button type="primary" htmlType="submit">Save</Button>
            </Form.Item>
            {props.type === 'add_survey' &&
              <Form.Item>
                <Button htmlType="button" onClick={props.onAdd}>Save And Add</Button>
              </Form.Item>
            }
            <Form.Item>
              <Button type="danger" onClick={props.onClose}>Cancel</Button>
            </Form.Item>
          </Form>
        ]}>
      <Form
        fields={fields}
        form={props.form}
        onFinish={props.onFinish}
        {...layout}
      >
        <Row>
          <Col span={24}>
            <Card
              title="Survey"
              className="g-ant-card"
            >
              <Form.Item
                name="number"
                label="Survey #"
              >
                <InputNumber placeholder={props.fields.number} />
              </Form.Item>
              <Form.Item {...layout}
                name="subdivision"
                label="Subdivision #"
                rules={[
                  {
                    required: true,
                    message: "Please input Subdivision",
                  },
                  { max: 4, message: 'Subdivision should be at max 4 characters' },
                ]}
              >
                <Input placeholder="#" />
              </Form.Item>
              <Form.Item
                name="extent"
                label="Extent"
                rules={[
                  {
                    required: true,
                    message: "Please input Extent in Acres",
                  },
                ]}
              >
                <InputNumber style={{width: "100%"}} precision={4} placeholder="Acres" />
              </Form.Item>
              <Form.Item
                name="landType"
                label="Land Type"
                rules={[
                  {
                    required: true,
                    message: "Please input Land Type",
                  },
                  { max: 50, message: 'Land Type should be at max 50 characters' },
                ]}
              >
                <Input placeholder="Enter Land Type" />
              </Form.Item>
              <Form.Item name="comment" label="Notes">
                <TextArea onKeyUp={textAreaInput} maxLength={1000} autoSize={{minRows: 4}} placeholder="Enter Notes" />
              </Form.Item>
              <p style={{marginLeft: '100px'}}>Remaining: {textAreaRemaining}</p>
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
    </Card>
  </div>
  );
};

export default SurveyForm;
