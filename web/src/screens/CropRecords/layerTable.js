import React from "react";
import { Tooltip, Button, Table } from "antd";
import { CalendarFilled, DeleteFilled, EditFilled} from "@ant-design/icons";

const LayerTable = (props) => {

  const columns = [
    { title: "Crop Name", dataIndex: "crop", key: "crop" },
    { title: "Layer", dataIndex: "name", key: "name" },
    {
      title: "Date", dataIndex: "date", key: "date", render: (_, item) => (
        <p>{new Date(item.date).toDateString()}</p>
      )
    },
    { title: "Brand", dataIndex: "brand", key: "brand" },
    { title: "Seed", dataIndex: "seed", key: "seed" },
    { title: "Irrigation", dataIndex: "irrigation", key: "irrigation" },
    { title: "Total Inventory Cost", dataIndex: "price", key: "price" },
    { title: "Total Machinery Cost", dataIndex: "machineryPrice", key: "machineryPrice" },
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
          <Tooltip placement="top" title='Delete Layer'>
            <Button
              type="link"
              onClick={() => props.deleteLayer(item)}
              icon={<DeleteFilled />}
            />
          </Tooltip>
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
