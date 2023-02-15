import Content from "./components/Content"
import AdminPanel from "./components/AdminPanel"
import Authorization from "./components/Authorization";
import TestPdd from "./components/TestPdd"

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
    },
    {
        route: "pdd-online",
        component: <TestPdd start={true} options={{num: 10, random: true, max: 1000}} />,
        key: "textpdd"
    }
];

export default routes