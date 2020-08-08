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

  updateCropRecords(data) {
    return axios.post(`/crop/update`, data);
  }

}

let cropServiceInstance = new CropService();
export default cropServiceInstance;
