import React, { useState } from "react";
import { Card, Input, Form, Tooltip, Button, Popconfirm, Table } from "antd";
import { InfoCircleTwoTone, CalendarFilled, DeleteFilled, EditFilled, FireOutlined, ImportOutlined} from "@ant-design/icons";

const { TextArea } = Input;

const LayerTable = (props) => {

  const [textAreaRemaining, setTextAreaRemaining] = useState(1000);
  const textAreaInput = (e) => {
    let len =  e.target.value.length;
    if (len >= 1000){
       e.preventDefault();
    } else{
       setTextAreaRemaining(1000 - len);
    }
  }

  const getRecordStatus = (row) => {
    if (row.isCompleted) return 'g-table-striped-rows-success';
    else if (!row.isActive) return 'g-table-striped-rows-danger';
  };

  const columns = [
    { title: "Crop Name", dataIndex: "crop", key: "crop" },
    { title: "Layer", dataIndex: "name", key: "name" },
    {
      title: "Date", dataIndex: "date", key: "date", render: (_, item) => (
        <>{new Date(item.date).toDateString()}</>
      )
    },
    { title: "Brand", dataIndex: "brand", key: "brand" },
    { title: "Seed", dataIndex: "seed", key: "seed" },
    { title: "Irrigation", dataIndex: "irrigation", key: "irrigation" },
    { title: "Estimated Inventory Cost", dataIndex: "price", key: "price", render: (_,item) => (
      <>
      {item.initialVersion !== item.currentVersion &&
        <Tooltip placement="top" title="Price changed due to new Activity">
          <InfoCircleTwoTone twoToneColor="gold"></InfoCircleTwoTone> {item.price}
        </Tooltip>
      }
      {item.initialVersion === item.currentVersion &&
        <>{item.price}</>
      }
      </>
    ) },
    { title: "Estimated Machinery Cost", dataIndex: "machineryPrice", key: "machineryPrice", render: (_,item) => (
      <>
      {item.initialVersion !== item.currentVersion &&
        <Tooltip placement="top" title="Price changed due to new Activity">
          <InfoCircleTwoTone twoToneColor="gold"></InfoCircleTwoTone> {item.machineryPrice}
        </Tooltip>
      }
      {item.initialVersion === item.currentVersion &&
        <>{item.machineryPrice}</>
      }
      </>
    ) },
    { title: "Activity", dataIndex: "activity", render: (_, item) => (
        <>
          {item.isActive &&
          <Tooltip placement="top" title='Show Activity'>
            <Button
              type="link"
              onClick={() => props.showActivity(item)}
              icon={<CalendarFilled />}
            />
          </Tooltip>
          }
          {(item.isActive && !item.isStarted && !item.isCompleted) &&
            <Tooltip placement="top" title='Edit Crop'>
              <Button
                type="link"
                onClick={() => props.editLayer(item)}
                icon={<EditFilled />}
              />
            </Tooltip>
          }
          {(item.isActive && item.isStarted && !item.isCompleted) &&
            <Tooltip placement="top" title='Activity has been started!'>
              <Button
                disabled
                type="link"
                icon={<EditFilled />}
              />
            </Tooltip>
          }
          {(item.isActive && item.isStarted) &&
            <Tooltip placement="bottom" title='Delete Crop'>
              <Button
                type="link"
                icon={
                <Popconfirm
                  title="Activity has started and cost has already been spent on this crop, are you sure you want to delete?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={props.deleteLayer.bind(this, "confirm", item)}
                  onCancel={props.deleteLayer.bind(this, "cancel", item)}
                >
                  <DeleteFilled />
                </Popconfirm>
                }
              />
            </Tooltip>
          }
          {(item.isActive && !item.isStarted) &&
            <Tooltip placement="bottom" title='Delete Crop'>
              <Button
                type="link"
                onClick={props.deleteLayer.bind(this, "confirm", item)}
                icon={
                  <DeleteFilled />
                }
              />
            </Tooltip>
          }
          {(item.isActive && item.isCompleted) &&
            <Tooltip placement="bottom" title='Delete Crop'>
              <Button
                type="link"
                onClick={props.deleteLayer.bind(this, "confirm", item)}
                icon={
                  <DeleteFilled />
                }
              />
            </Tooltip>
          }
          {(item.isActive && !item.isAbandoned && !item.isCompleted) &&
              <Tooltip placement="bottom" title='Abandon Crop'>
              <Button
                type="link"
                icon={
                <Popconfirm
                  title={
                      <Card title="Are you sure to abandon this crop?">
                        <Form form={props.form}>
                          <Form.Item name="reason" label="Reason"
                            rules={[
                              {
                                required: true,
                                message: "Please enter reason",
                              }]}
                          >
                            <TextArea onKeyUp={textAreaInput} maxLength={1000} autoSize={{minRows: 4}} placeholder="Reason to abandon" />
                          </Form.Item>
                          <p style={{marginLeft: '100px'}}>Remaining: {textAreaRemaining}</p>
                        </Form>
                      </Card>
                    }
                  okText="Yes"
                  cancelText="No"
                  onConfirm={props.abandonLayer.bind(this, "skip", item)}
                >
                  <ImportOutlined />
                </Popconfirm>
                }
              />
            </Tooltip>
          }
          {item.isAbandoned &&
            <Tooltip placement="bottom" title={`Reason: ${item.reason}`}>
              Abandoned
            </Tooltip>
          }
        </>
      )
    },
  ];

  return (
    <Table
      className="g-table-striped-rows g-ant-table-cell \"
      rowClassName={(record, index) => getRecordStatus(record)}
      columns={columns}
      dataSource={props.dataSource.Layers}
      pagination={false}
      bordered
      rowKey="id"
      style={{ margin: "15px 0px" }}
    />
  );
};

export default LayerTable;
