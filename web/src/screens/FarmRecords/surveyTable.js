import React, { useEffect, useState } from "react";
import { Tooltip, Button, Table } from "antd";
import { EditFilled } from "@ant-design/icons";

const SurveyTable = (props) => {
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState([]);

  const columns = [
    { title: "Survey #", dataIndex: "number", key: "number" },
    { title: "Subdivision", dataIndex: "subdivision", key: "subdivision" },
    { title: "Extent", dataIndex: "extent", key: "extent" },
    { title: "Land Type", dataIndex: "landType", key: "landType" },
    {
      title: "Action",
      dataIndex: "",
      key: "",
      render: (_, item) => (
        <Tooltip placement="top" title='Edit Survey'>
        <Button
          type="link"
          onClick={() => {
            props.review(item, "edit_survey");
          }}
          icon={<EditFilled />}
        />
      </Tooltip>
      ),
    },
  ];

  useEffect(() => {
    props.dataSource.forEach(farm => {
      if (farm.id === props.farmId) {
        setSurveys(() => farm.Surveys);
      }
    });
    setLoading(false);
  }, [props]);

  return (
    <Table
      columns={columns}
      dataSource={surveys}
      pagination={false}
      loading={loading}
      bordered
      rowKey="id"
      style={{ margin: "15px 0px" }}
    />
  );
};

export default SurveyTable;
