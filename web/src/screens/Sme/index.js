import React, { useState, useEffect, useContext } from "react";
import { Spin, Input, Table, Row, Col, Card, Tooltip, Form, message, Button, Drawer, Descriptions, Select, Tag, List } from "antd";
import { DeleteFilled, EditFilled, CaretUpFilled, CaretDownOutlined, CaretDownFilled } from "@ant-design/icons";

import CropService from "../../services/crop";
import { SharedContext } from "../../context";
import { ActivityForm } from "../../components";

const { Option } = Select;

const Sme = () => {

  const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0) + s.slice(1)
  }

  const [formSearch] = Form.useForm();
  const [form] = Form.useForm();
  const [showDrawer, setShowDrawer] = useState(false);
  const [state, setState] = useContext(SharedContext);
  const [activties, setActivities] = useState([]);
  const [dimensions, setDimensions] = useState({});
  const [crops, setCrops] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [filteredActivties, setFilteredActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState([]);

  const columns = [
    { title: "Name", dataIndex: "name", key: "crop" },
    {
      title: 'Day',
      colSpan: 1,
      dataIndex: 'day',
      render: (value, row, index) => {
        const prev = filteredActivties[index - 1];

        const obj = {
          children: value,
          props: {},
        };
        var length = filteredActivties.filter(x => x.day === row.day).length;

        obj.props.rowSpan = length;

        // These two are merged into above cell

        if (prev && prev.day === row.day) {
          obj.props.rowSpan = 0;
        }

        return obj;

      },
    },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Seasons", dataIndex: "seasons", key: "name", ellipsis: true,
      render: tags => renderTags(tags)
    },
    {
      title: "Soils", dataIndex: "soils", key: "soils", textWrap: 'break-word', ellipsis: true,
      render: tags => renderTags(tags)
    },
    {
      title: "Irrigations", dataIndex: "irrigations", key: "irrigations", ellipsis: true,
      render: tags => renderTags(tags)
    },
    {
      title: "Cultivations", dataIndex: "cultivations", key: "cultivations", ellipsis: true,
      render: tags => renderTags(tags)
    },
    {
      title: "Farming Technologies", dataIndex: "farmingMethods", key: "farmingMethods", ellipsis: true,
      render: tags => renderTags(tags)
    },
    {
      title: "Action",
      key: "action",
      render: (_, item) => (
        <>
          <Tooltip placement="top" title='Edit Activity'>
            <Button
              type="link"
              onClick={() => openFormForEdit(item)}
              icon={<EditFilled />}
            />
          </Tooltip>

          <Tooltip placement="top" title='Up'>
            <Button
              type="link"
              onClick={() => changeOrder(item, -1)}
              icon={<CaretUpFilled />}
            />
          </Tooltip>

          <Tooltip placement="top" title='Down'>
            <Button
              type="link"
              onClick={() => changeOrder(item, 1)}
              icon={<CaretDownFilled />}
            />
          </Tooltip>
        </>
      ),
    },


  ]
  useEffect(() => {
    fetchAndUpdateRecords();
  }, []);

  const deleteActivity = (item) => {
    CropService.deleteActivityRecord(item).then(response => {
      message.success(response.data.message);
      fetchAndUpdateRecords();
    }).catch(err => {
      message.error(err.response.data.message);
    });
  };

  const renderTags = (tags) => {
    return (<List
      itemLayout="horizontal"
      dataSource={tags}
      renderItem={tag => (
        <List.Item
          actions={[<Tooltip placement="top" title='Delete Activity'>
            <Button
              type="link"
              onClick={() => deleteActivity(tag)}
              icon={<DeleteFilled />}
            />
          </Tooltip>]}
        >
          <List.Item.Meta
            title={tag.dimension}
          />
        </List.Item>
      )}
    />)
  }

  const search = async () => {
    const values = await formSearch.validateFields();
    fetchAndUpdateRecords(values);
  };

  const cropChange = async () => {
    const values = await formSearch.validateFields();
    formSearch.setFieldsValue({ ...values, search: values.crop });
    fetchAndUpdateRecords(values);
  };

  const categoryChange = async () => {
    const values = await formSearch.validateFields();
    const result = dimensions.crops.filter(x => x.category === values.category);
    formSearch.setFieldsValue({ ...values, subCategory: 'Select Sub Category', crop: 'Select Crop' });
    var subCategories = result.map(x => x.subcategory);
    setSubCategory(subCategories.filter(unique));
  }

  const subCategoryChange = async () => {
    const values = await formSearch.validateFields();
    const result = dimensions.crops.filter(x => x.subcategory === values.subCategory);
    formSearch.setFieldsValue({ ...values, crop: 'Select Crop' });
    setCrops(result);
  }

  const openNewForm = () => {
    setSelectedActivity({});
    setShowDrawer(true);
  };

  const openFormForEdit = (item) => {
    setSelectedActivity(item);
    setShowDrawer(true);
  }

  const changeOrder = (item, pos, isParallel) => {
    let activities = [...filteredActivties];
    const index = activities.indexOf(item);
    let targetItem;
    let targetIndex;
    do {
      targetIndex = index + pos;
      targetItem = activities[targetIndex];
      pos = pos + pos;
    } while (targetItem.day === item.day);

    const targetOrder = targetItem.day;
    const sourceItem = activities[index];
    const sourceOrder = sourceItem.day;
    sourceItem.day = targetOrder;
    targetItem.day = sourceOrder;

    const sourceData = CropService.changeActivityOrder(sourceItem);
    const targetData = CropService.changeActivityOrder(targetItem);

    Promise.all([sourceData, targetData]).then((responses) => {
      setFilteredActivities(activities.sort((a, b) => a.day - b.day));
    });


  }

  const closeNewForm = () => {
    setShowDrawer(false);
  };

  const onFinish = (values) => {
    CropService.createActivityRecord(values).then(response => {
      message.success(response.data.message);
      fetchAndUpdateRecords();
      form.resetFields();
      setShowDrawer(false);
    }).catch(err => {
      message.error(err.response.data.message);
    });
  };

  const unique = (value, index, self) => {
    return self.indexOf(value) === index
  }

  const getOrderNumber =  () => {
      return filteredActivties.length + 1;
  }

  const prepareActivites = async (activties) => {
    const formValues = await formSearch.validateFields();
    let cropActivites = activties.filter(x => x.crop === formValues.crop);
    let types = cropActivites.map(x => x.type).filter(unique);
    let allActivities = [];

    for (let index = 0; index < types.length; index++) {
      const element = types[index];
      let activity = cropActivites.find(x => x.type === element);
      let result = { name: '', type: '', day: 0, seasons: [], soils: [], irrigations: [], cultivations: [], farmingMethods: [] };
      result.name = activity.name;
      result.type = activity.type;
      result.day = activity.day;
      result.soils = cropActivites.filter(x => x.dimensionType === 'soil' && x.type === element);
      result.seasons = cropActivites.filter(x => x.dimensionType === 'season' && x.type === element);
      result.irrigations = cropActivites.filter(x => x.dimensionType === 'irrigation' && x.type === element);
      result.cultivations = cropActivites.filter(x => x.dimensionType === 'cultivation' && x.type === element);
      result.farmingMethods = cropActivites.filter(x => x.dimensionType === 'farming' && x.type === element);
      allActivities.push(result);

    }

    setFilteredActivities(allActivities.sort((a, b) => a.day - b.day));

  }

  const fetchAndUpdateRecords = async (values = { search: "" }) => {
    const formValues = await formSearch.validateFields();
    CropService.getActivities(formValues).then(response => {

      var categories = response.data.cropTypes.map(x => x.category);
      var subCategories = response.data.cropTypes.map(x => x.subcategory);
      setCategory(categories.filter(unique));
      setSubCategory(subCategories.filter(unique));

      setActivities(response.data.activities);

      // filtering and consolidating the activites
      prepareActivites(response.data.activities);
      setCrops(response.data.cropTypes);
      setDimensions(() => {
        return {
          irrigations: response.data.irrigations,
          soils: response.data.soils,
          seasons: response.data.seasons,
          farmings: response.data.farmings,
          cultivations: response.data.cultivations,
          crops: response.data.cropTypes,
          inventory: response.data.inventoryTypes,
          machinery: response.data.machineryTypes,
        }
      });
    });
  };

  return (
    <>
      <Row style={{ padding: "10px", borderTop: "1px solid #90d150" }}>
        <Col xs={12} md={12} lg={14} xl={14}>
          <Form form={formSearch} layout="inline">
            {/* <Form.Item
              name="search"
            >
              <Input onPressEnter={search} placeholder="Crop Name" />
            </Form.Item> */}

            <Form.Item name="category" label="Category"
            >
              <Select onChange={categoryChange} showSearch placeholder="Select Category">
                {category.map(p => (
                  <Option value={p} key={p}>{p}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="subCategory" label="Sub Category"
            >
              <Select onChange={subCategoryChange} showSearch placeholder="Select Sub Category">
                {subCategory.map(p => (
                  <Option value={p} key={p}>{p}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="crop" label="Crop"
            >
              <Select onChange={cropChange} showSearch placeholder="Select Crop">
                {crops.map(p => (
                  <Option value={p.name} key={p.name}>{p.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Col>
        <Col
          xs={10}
          md={10}
          lg={8}
          xl={8}
          offset={2}
          style={{ textAlign: "end" }}
        >
          <Button type="primary" onClick={openNewForm}>
            Add Activity
        </Button>
        </Col>
      </Row>
      <Row style={{ padding: "10px" }}>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={24}
          xl={24}
        >

          <Table
            className="g-table-striped-rows g-ant-table-cell \"
            ellipses={true}
            dataSource={filteredActivties}
            columns={columns}
            rowKey="name"
            loading={false}
            bordered
          />
        </Col>
      </Row>
      <Drawer
        visible={showDrawer}
        width={window.innerWidth > 768 ? 900 : window.innerWidth}
        onClose={() => setShowDrawer(false)}
      >
        <Spin spinning={state.spinning} size="large">
          <ActivityForm form={form} selectedCrop={formSearch.getFieldValue('crop')} activityOrder={getOrderNumber(formSearch.getFieldValue('crop'))} selectedActivity={selectedActivity} onFinish={onFinish} dimensions={dimensions} onClose={closeNewForm} />
        </Spin>
      </Drawer>
    </>
  );
}

export default Sme;
