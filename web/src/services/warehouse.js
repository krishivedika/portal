import axios from "axios";

class Warehouse {

  //Warehouse
  getWarehouses(data) {
    return axios.get(`/warehouses`, { params: data });
  }

  addWarehouse(data) {
    return axios.post(`/warehouse/add`, data);
  }

  updateWarehouse(data) {
    return axios.post(`/warehouse/update`, data);
  }

  deleteWarehouse(data) {
    return axios.post(`/warehouse/delete`, data);
  }

  addInventory(data) {
    return axios.post(`/warehouse/inventory/add`, data);
  }

  updateInventory(data) {
    return axios.post(`/warehouse/inventory/update`, data);
  }

  addMachinery(data) {
    return axios.post(`/warehouse/machinery/add`, data);
  }

  updatemachinery(data) {
    return axios.post(`/warehouse/machinery/update`, data);
  }

}

let warehouseInstance = new Warehouse();
export default warehouseInstance;
