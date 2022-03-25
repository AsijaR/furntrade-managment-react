import moment from 'moment';
import {Select} from "antd";
import API from "../server-apis/api";

function changeOrderStatus(value, id){
    console.log("value>>>",value);
    console.log("id>>>",id);

    // const token="Bearer "+ JSON.parse(localStorage.getItem("token"));
    // API.patch(`orders/change-status/`,id,{ headers: { Authorization: token}})
    //     .then(res => {
    //         // console.log(res.data._embedded.productList);
    //         const orders = res.data._embedded.ordersDtoList;
    //         this.setState({loading: false,data:orders });
    //     });
}
function orderDetails(orderId){
    console.log("value>>>",orderId);
    const token="Bearer "+ JSON.parse(localStorage.getItem("token"));
    const response = API.get(`/orders/${orderId}`,{headers: { Authorization: token}})
        .then((response )=>
        {
            const orderDetails = response.data;
            console.log(orderDetails)
        })
        .catch(error => {
         //   this.setState({ errorMessage: error.message });
        //    this.errorHappend("");
            console.error('There was an error!', error);
        });
}
export const ordersDataColumns = [
    {
        title: "Id",
        dataIndex: "id",
        key: "id",
        width: "6%",
        render: orderId => <a onClick={() => orderDetails(orderId)}>{orderId}</a>,
        editable: false
    },
    {
        title: "Customer",
        dataIndex: "customerName",
        key: "customerName",
        editable: false
    },
    {
        title: "Shippment Date",
        dataIndex: "shippmentDate",
        key: "shippmentDate",
        width: "10%",
        editable: false,
       render: (shippmentDate) => { return (<p>{moment(shippmentDate).format("DD-MM-YYYY")}</p>)}
    },
    {
        title: "Note 1",
        dataIndex: "note1",
        key: "note1",
        editable: false,
        ellipsis: true,
    },
    {
        title: "Note 2",
        dataIndex: "note2",
        key: "note2",
        editable: false,
        ellipsis: true,
    },
    {
        title: "Contact Person",
        dataIndex: "contactPersonName",
        key: "contactPersonName",
        editable: false
    }
];