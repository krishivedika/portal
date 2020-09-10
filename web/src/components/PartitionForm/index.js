import React, { useEffect, useState } from "react";
import { Card, Form, InputNumber, Button, Input, Row, Col, message, Checkbox } from "antd";
import { Chart } from "@antv/g2";

const PartitionForm = (props) => {

  let chart;
  const [partitions, setPartitions] = useState([]);
  const [partitionExtents, setPartitionExtents] = useState({});
  const [totalSize, setTotalSize] = useState(0);
  const [fields, setFields] = useState([]);

  useEffect(() => {
    let tempSize = 0.0000;
    props.data.Surveys.forEach(s => {
      tempSize += parseFloat(s.extent);
    });
    const tempSizeFixed = tempSize.toFixed(4);
    const fields = [];
    setPartitions(() => {
      let data = [...JSON.parse(props.data.partitions)?.partitions || []];
      if (data.length == 0) {
        data.push({item: "Plot 1", area: tempSizeFixed});
        fields.push({name: "Plot 1", value: tempSizeFixed});
      }
      data.forEach(item => {
        item.area = parseInt(item.area);
        fields.push({name: item.item, value: item.area});
      });
      return data;
    });
    setFields(() => fields);
    setTotalSize(tempSizeFixed);
  }, [props]);

  useEffect(() => {
    chart = new Chart({
      container: 'container',
      height: 250,
      width: 300,
    });
    chart.coordinate('theta', {
      radius: 0.75,
    });
    chart.legend(false);
    chart
    .interval()
    .color('item').position('area').label('item')
    .adjust('stack');
    chart.data(partitions);
    chart.render();
    props.form.validateFields();
    return () => {
      chart.destroy();
    }
  }, [partitions, partitionExtents]);

  const onInputChange = (e, item) => {
    props.form.validateFields();
    setPartitions((state) => {
      const newData = [...state];
      newData.forEach(p => {
        if (p.item === item) p.area = e;
      });
      return newData;
    });
  }

  const addPartition = async () => {
    const values = await props.form.getFieldsValue();
    if (partitions.length === 10) {
      message.warning('Maximum partitions is reached');
    } else {
      let newItem = {};
      setPartitions((state) => {
        let tempSize = 0;
        state.forEach(p => {
          p.area = values[p.item] || 0;
          tempSize += parseInt(p.area);
        });
        newItem = { item: `Plot ${partitions.length + 1}`, area: (totalSize - tempSize === 0) ? 1 : totalSize - tempSize };
        const newData = [...state, newItem];
        return newData;
      });
      setFields((state) => {
        const newData = [...state];
        newData.forEach(p => {
          p.value = values[p.name] || 0;
        });
        return [...newData, {name: newItem.item, value: newItem.area}];
      });
    }
  }

  const deletePartition = () => {
    if (partitions.length === 1) {
      message.warning('Minimum of 1 plot is required');
    } else {
      setPartitions((state) => {
        const newData = [...state.slice(0, state.length - 1)];
        chart.data(newData);
        chart.render();
        return newData;
      });
    }
  }

  const addExtent = (e, item, extent) => {
    if (e.target.checked) {
      setPartitionExtents(state => ({...state, [item]: (state[item] || 0) + extent}));
    } else {
      setPartitionExtents(state => ({...state, [item]: (state[item] || 0) - extent}));
    }
  }

  return (
    <div style={{ margin: '15px' }}>
      <Card title={`Plotting Farm: ${props.data.name}`}
        className="g-ant-card"
        extra={[
          <Form key="save" form={props.form} layout="inline">
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: '5px' }}>Save</Button>
              <Button key="close" type="danger" onClick={props.onClose}>Cancel</Button>
            </Form.Item>
          </Form>
        ]}>
      <Form preserve={true} fields={fields} form={props.form} onFinish={props.onFinish} layout="inline">
        <Row style={{ marginTop: '40px'}}>
          <Col>
            <Button onClick={addPartition}> + Add Plot</Button>
            <Button style={{ marginBottom: '15px', marginLeft: '5px' }} onClick={deletePartition}> - Remove Plot</Button>
            <div id="container" style={{ marginBottom: '15px' }}></div>
            <div style={{marginTop: '10px', marginBottom: '10px', }}><b>Total Size (Acres): {totalSize}</b></div>
            {partitions.map((p, index) => (
              <div key={index}>
                <Input.Group>
                  <Form.Item name={p.item} label={`Plot ${index + 1}`}
                  rules= {[() => ({
                    validator(rule, value) {
                      if (value <= partitionExtents[p.item]) {
                        return Promise.resolve();
                      }
                      return Promise.reject('The area should be less than or equal to total of selected Survey Extent areas.');
                    },
                  })
                  ]}>
                    <InputNumber  style={{width: '100%'}} precision={4} placeholder='Acres' onChange={(e) => onInputChange(e, p.item)} />
                  </Form.Item>
                  <Form.Item>
                    <Checkbox.Group>
                      {props.data.Surveys.map((s) => (
                        <Checkbox checked={true} onChange={(e) => addExtent(e, p.item, s.extent)} key={`${p.item}_${s.id}`} value={`${p.item}_${s.id}_${s.extent}`} style={{ lineHeight: '32px' }}>
                          Survey # {s.number} (Acres: {s.extent})
                        </Checkbox>
                      ))}
                    </Checkbox.Group>
                  </Form.Item>
                </Input.Group>
              </div>
            ))}
          </Col>
        </Row>
      </Form>
      </Card>
    </div>
  );
};

export default PartitionForm;
