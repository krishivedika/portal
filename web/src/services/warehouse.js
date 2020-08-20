import axios from "axios";

class Warehouse {

  //Warehouse
  getWarehouses(data) {
    return axios.get(`/warehouses`, { params: data });
  }

  addWarehouse(data) {
    return axios.post(`/warehouse/add`, data);
  }

  addInventory(data) {
    return axios.post(`/warehouse/inventory/add`, data);
  }

}

let warehouseInstance = new Warehouse();
export default warehouseInstance;
