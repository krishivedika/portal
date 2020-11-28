import axios from "axios";

class CropService {

  // Crop Record end points
  getCropTypes(data) {
    return axios.get(`/crops/categories`, { params: data });
  }

  getCropRecords(data) {
    return axios.get(`/crops`, { params: data });
  }

  addCropRecords(data) {
    return axios.post(`/crop/add`, data);
  }

  restoreCropRecords(data) {
    return axios.post(`/crop/restore`, data);
  }

  deleteCropRecords(data) {
    return axios.post(`/crop/delete`, data);
  }

  getLayerActivity(data) {
    return axios.get(`crop/layer/activity`, {params: data});
  }

  getLayerRecord(data) {
    return axios.get(`crop/layer`, {params: data});
  }

  editLayerRecord(data) {
    return axios.post(`crop/layer/edit`, data);
  }

  updateLayerRecord(data) {
    return axios.post(`crop/layer/update`, data);
  }

  deleteLayerRecord(data) {
    return axios.post(`crop/layer/delete`, data);
  }

  abandonLayerRecord(data) {
    return axios.post(`crop/layer/abandon`, data);
  }

  getActivities(data) {
    return axios.get(`/crop/activities`, {params: data});
  }

  createActivityRecord(data) {
    return axios.post(`crop/activity/create`, data);
  }

  deleteActivityRecord(data) {
    return axios.post(`crop/activity/delete`, data);
  }

  changeActivityOrder(data){
    return axios.post(`crop/activity/changeOrder`, data);
  }

}

let cropServiceInstance = new CropService();
export default cropServiceInstance;
