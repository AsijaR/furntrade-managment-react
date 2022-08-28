import moment from 'moment';
import API from "../server-apis/api";
import {Typography} from "antd";

function orderDetails(orderId){
    const token="Bearer "+ JSON.parse(localStorage.getItem("token"));
    API.get(`/orders/${orderId}`,{headers: { Authorization: token}})
        .then((response )=>
        {
            const orderDetails = response.data;
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
        render: orderId => <Typography.Link onClick={() => orderDetails(orderId)}>{orderId}</Typography.Link>,
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
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        editable: false,
    },
    {
        title: 'Actions',
        dataIndex: 'actions',
        width: '10%',
    }
];