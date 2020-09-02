import React, { useEffect, useState } from "react";
import { Tooltip, Button, Table } from "antd";
import { CalendarFilled } from "@ant-design/icons";

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
        </>
      )
    },
  ];

  return (
    <Table
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
