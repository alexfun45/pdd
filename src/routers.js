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
        key: "admin",
        auth: "admin"
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
        component: <TestPdd start={true} options={{num: 20, max_error:2, random: false, recommended: false, max: 1000, dblclick: false, settings: false}} />,
        key: "textpdd"
    },
    {
        route: "pdd_for_school",
        component: <TestPdd start={false} options={{num: 20, max_error: 2, recommended: false, random: false, max: 1000, dblclick: false, settings: true}} />,
        key: "pdd_for_school"
    },
    {
        route: "pdd_recommended",
        component: <TestPdd start={false} options={{num: 20, max_error: 2, recommended: true, random: false, max: 1000, dblclick: false, settings: false}} />,
        key: "pdd_recommended",
        auth: "user"
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