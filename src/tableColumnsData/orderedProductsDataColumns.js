import moment from "moment";

export const orderedProductsDataColumns = [
    {
        title: "Id",
        dataIndex: "id",
        key: "id",
        width: "15%",
        editable: false
    },
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        editable: false
    },
    {
        title: "Model",
        dataIndex: "model",
        key: "model",
        editable: false
    },
    {
        title: "Color",
        dataIndex: "color",
        key: "color",
        editable: false
    },
    {
        title: "Price",
        dataIndex: "price",
        key: "price",
        editable: false,
        render: (price) => { return(<p>{price}€</p>)}
    },
    {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
        width: "15%",
        editable: true
    }
];
