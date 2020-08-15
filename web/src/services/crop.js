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

  deleteCropRecords(data) {
    return axios.post(`/crop/delete`, data);
  }

  getLayerRecord(data) {
    return axios.get(`crop/layer`, {params: data});
  }

  updateLayerRecord(data) {
    return axios.post(`crop/layer/update`, data);
  }

}

let cropServiceInstance = new CropService();
export default cropServiceInstance;
