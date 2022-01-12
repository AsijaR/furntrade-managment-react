import {Tag} from "antd";

export const ordersDataColumns = [
    {
        title: "Id",
        dataIndex: "id",
        key: "id",
        width: "6%",
        editable: false,
        fixed: 'left'
    },
    {
        title: "Customer",
        dataIndex: "customerName",
        key: "customerName",
        editable: false,
        fixed: 'left'
    },
    {
        title: "Shippment Date",
        dataIndex: "shippmentDate",
        key: "shippmentDate",
        width: "10%",
        editable: false
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        editable: false,
        // render: status => (
        //     <>
        //         {status.map(stat => {
        //             let color = stat.length > 5 ? 'geekblue' : 'green';
        //             if (stat === 'WAITING') {
        //                 color = 'volcano';
        //             }
        //             return (
        //                 <Tag color={color} key={stat}>
        //                     {stat.toUpperCase()}
        //                 </Tag>
        //             );
        //         })}
        //     </>
        // ),
    },
    {
        title: "Note 1",
        dataIndex: "note1",
        key: "note1",
        editable: false
    },
    {
        title: "Note 2",
        dataIndex: "note2",
        key: "note2",
        editable: false
    },
    {
        title: "Contact Person",
        dataIndex: "contactPersonName",
        key: "contactPersonName",
        editable: false
    }
];
