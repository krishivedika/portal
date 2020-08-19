import React, { useEffect } from "react";
import { Typography, Row, Col } from "antd";

import Routes from "../../routes";
import farmerImage from "../../images/banner.jpg";
import homeOneImage from "../../images/home1.jpg";
import homeTwoImage from "../../images/home2.jpg";
import homeThreeImage from "../../images/home3.jpg";

const { Title } = Typography;

const Home = () => {

  useEffect(() => {
  }, []);

  return (
    <>
      <Row>
        <Col xs={24}>
          <div>
            <img style={{ marginBottom: '40px', width: '100vw', minHeight: '100px' }} src={farmerImage} alt="FarmerFirst" />
          </div>
        </Col>
      </Row>
      <Row gutter={24} justify="center" style={{margin: '10px'}}>
        <Col xs={24}>
        <div style={{textAlign: 'center'}}>
          <Title level={2} strong type="secondary">We put farmers first</Title>
        </div>
        </Col>
        <Col xs={24} lg={{span: 8}} style={{marginBottom: '10px'}}>
          <img width="100%" src={homeOneImage} alt="" />
        </Col>
        <Col xs={24} lg={{span: 8}} style={{marginBottom: '10px'}}>
          <img width="100%" src={homeTwoImage} alt="" />
        </Col>
        <Col xs={24} lg={{span: 8}} style={{marginBottom: '10px'}}>
          <img width="100%" src={homeThreeImage} alt="" />
        </Col>
      </Row>
    </>
  );
};

export default Home;
