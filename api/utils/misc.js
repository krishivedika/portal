const axios = require('axios').default;

const config = require("../config");

const onboardFarmer = (data) => {
    return axios.post(`${config.INPUTS_API_URL}?apiobj={"firstname":"${data.firstname}","lastname":"${data.lastname}","email":"${data.email}","telephone":"${data.telephone}","authkey":"${config.INPUTS_API_AUTH_KEY}"}`, {}, {});
};

module.exports = {
    onboardFarmer
}
