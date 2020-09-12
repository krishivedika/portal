import React from "react";
import { Tooltip, Button, Popconfirm, Table } from "antd";
import { CalendarFilled, DeleteFilled, EditFilled} from "@ant-design/icons";

const LayerTable = (props) => {

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
    { title: "Estimated Inventory Cost", dataIndex: "price", key: "price" },
    { title: "Estimated Machinery Cost", dataIndex: "machineryPrice", key: "machineryPrice" },
    { title: "Activity", dataIndex: "activity", render: (_, item) => (
        <>
          <Tooltip placement="top" title='Show Activity'>
            <Button
              type="link"
              onClick={() => props.showActivity(item)}
              icon={<CalendarFilled />}
            />
          </Tooltip>
          {!item.isStarted &&
            <Tooltip placement="top" title='Edit Layer'>
              <Button
                type="link"
                onClick={() => props.editLayer(item)}
                icon={<EditFilled />}
              />
            </Tooltip>
          }
          {item.isStarted &&
            <Tooltip placement="top" title='Activity has been started!'>
              <Button
                disabled
                type="link"
                icon={<EditFilled />}
              />
            </Tooltip>
          }
          {item.isStarted &&
            <Tooltip placement="bottom" title='Delete Layer'>
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
          {!item.isStarted &&
            <Tooltip placement="bottom" title='Delete Layer'>
              <Button
                type="link"
                onClick={props.deleteLayer.bind(this, "confirm", item)}
                icon={
                  <DeleteFilled />
                }
              />
            </Tooltip>
          }
        </>
      )
    },
  ];

  return (
    <Table
      className="g-table-striped-rows g-ant-table-cell \"
      rowClassName={(record, index) => record.isActive ? '' : 'g-table-striped-rows-danger'}
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
