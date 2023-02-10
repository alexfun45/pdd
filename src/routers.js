import Content from "./components/Content"
import AdminPanel from "./components/AdminPanel"
import Authorization from "./components/Authorization";

const routes = [
    {
        route: "/",
        component: <Content/>,
        key: "/"
    },
    {
        route: "/:id",
        component: <Content key=":id"/>,
        key: "content"
    },
    {
        route: "admin",
        component: <AdminPanel />,
        key: "admin"
    },
    {
        route: "auth",
        component: <Authorization />,
        key: "auth"
    }
];

export default routes