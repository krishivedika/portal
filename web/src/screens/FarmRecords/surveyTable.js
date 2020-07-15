import React, { useEffect, useState } from "react";
import { Button, Table } from "antd";
import UserService from "../../services/user";


const SurveyTable = (props) => {
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState([]);

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Subdivision", dataIndex: "subdivision", key: "subdivision" },
    { title: "Extent", dataIndex: "extent", key: "extent" },
    { title: "Link", dataIndex: "link", key: "link" },
    {
      title: "Action",
      dataIndex: "",
      key: "",
      render: (_, item) => (
        <span className="table-operation">
          <Button type="link" onClick={(event) => props.review(item, event)}>Edit</Button>
          <Button type="link" onClick={(event) => props.review(item, event)}>View</Button>
        </span>
      ),
    },
  ];

  const fetchAndUpdateRecords = (props) => {
    setLoading(true);
    UserService.getSurveys(props.FarmId).then((response) => {
      const tempSurveys = [...response.data.surveys];
      setSurveys(() => tempSurveys);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAndUpdateRecords(props);
  }, []);

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
