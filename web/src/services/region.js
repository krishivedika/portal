import axios from "axios";

class RegionService {

  // Region end points
  getRegions(data) {
    return axios.get(`/regions`, { params: data })
  }

}

let regionServiceInstance = new RegionService();
export default regionServiceInstance;
