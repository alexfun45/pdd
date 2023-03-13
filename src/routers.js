import Content from "./components/Content"
import AdminPanel from "./components/AdminPanel"
import Authorization from "./components/Authorization";
import TestPdd from "./components/TestPdd"
import Profile from "./components/Profile"
import Confirmation from "./components/Confirmation"
import AuthConfirm from "./components/AuthConfirm"
import PasswordRecovery from "./components/PasswordRecovery"

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
        route: "passwordrecovery/:email/:secret",
        component: <PasswordRecovery  />,
        key: "passwordrecovery"
    },
    {
        route: "pdd-online",
        component: <TestPdd start={true} options={{num: 10, max_error:2, random: true, max: 1000}} />,
        key: "textpdd"
    },
    {
        route: "profile/",
        component: <Profile />,
        key: "profile"
    },
    {
        route: "confirm/",
        component: <Confirmation />,
        key: "confirmation"
    },
    {
        route: "confirmation/:userid/:secret",
        component: <AuthConfirm />,
        key: "authorize_confirmation"
    }
];

export default routes