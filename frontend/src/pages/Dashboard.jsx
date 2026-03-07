import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

function DashboardLayout() {

    return (

        <div className="dashboard-wrapper">

            <Sidebar />

            <div className="dashboard-main">
                <Outlet />
            </div>

        </div>

    )

}

export default DashboardLayout