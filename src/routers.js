import Content from "./components/Content"
import AdminPanel from "./components/AdminPanel"
import Authorization from "./components/Authorization";
import TestPdd from "./components/TestPdd"
import Profile from "./components/Profile"
import Confirmation from "./components/Confirmation"
import AuthConfirm from "./components/AuthConfirm"
import PasswordRecovery from "./components/PasswordRecovery"
import GoogleAuth from "./components/GoogleAuth";
import YaAuth from "./components/YaAuth";
import Search from "./components/Search"

const routes = [
   
    {
        route: "admin",
        component: AdminPanel,
        key: "admin",
        auth: "admin"
    },
    {
        route: "auth",
        component: <Authorization />,
        key: "auth"
    },
    {
        route: "google_auth/:state/:access_token",
        component: <GoogleAuth />,
        key: "google_auth"
    },
    {
        route: "yauth",
        component: <YaAuth />,
        key: "yauth"
    },
    {
        route: "passwordrecovery/:email/:secret",
        component: <PasswordRecovery  />,
        key: "passwordrecovery"
    },
    {
        route: "pdd-online",
        component: <TestPdd start={true} options={{num: 20, max_error:2, subjects: false, random: false, recommended: false, max: 1000, dblclick: false, settings: false}} />,
        key: "textpdd"
    },
    {
        route: "search",
        component: <Search/>,
        key: "search"
    },
    {
        route: "subjects",
        component: <TestPdd start={true} options={{num: 400, max_error:2, subjects: true, random: false, recommended: false, max: 1000, dblclick: false, settings: false}} />,
        key: "subjects"
    },
    {
        route: "pdd_for_school",
        component: <TestPdd start={false} options={{num: 20, max_error: 2, subjects: false, recommended: false, random: false, max: 1000, dblclick: false, settings: true}} />,
        key: "pdd_for_school"
    },
    {
        route: "pdd_recommended",
        component: <TestPdd start={false} options={{num: 20, max_error: 2, subjects: false, recommended: true, random: false, max: 1000, dblclick: false, settings: false}} />,
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
    },
    {
        route: "/",
        component: <Content/>,
        key: "/"
    },
    {
        route: "/:id",
        component: <Content key=":id"/>,
        key: "content"
    }
];

export default routes