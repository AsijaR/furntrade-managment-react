
export const productDataColumns = [
    {
        title: "Id",
        dataIndex: "id",
        key: "id",
        width: "6%",
        editable: false
    },
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        editable: true
    },
    {
        title: "Model",
        dataIndex: "model",
        key: "model",
        editable: true
    },
    {
        title: "Material",
        dataIndex: "material",
        key: "material",
        editable: true
    },
    {
        title: "Color",
        dataIndex: "color",
        key: "color",
        editable: true
    },
    {
        title: "Price",
        dataIndex: "price",
        width: '10%',
        key: "price",
        className: 'column-money',
        editable: true
    },
    {
        title: 'Actions',
        dataIndex: 'actions',
        width: '10%'
    }
];
