import React, { useEffect, useState } from "react";
import { Button, Table } from "antd";

const SurveyTable = (props) => {
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState([]);

  const columns = [
    { title: "Survey Name", dataIndex: "name", key: "name" },
    { title: "Subdivision", dataIndex: "subdivision", key: "subdivision" },
    { title: "Extent", dataIndex: "extent", key: "extent" },
    { title: "Link", dataIndex: "link", key: "link" },
    {
      title: "Action",
      dataIndex: "",
      key: "",
      render: (_, item) => (
        <span className="table-operation">
          <Button type="link" onClick={() => props.review(item, 'edit_survey')}>Edit</Button>
        </span>
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
