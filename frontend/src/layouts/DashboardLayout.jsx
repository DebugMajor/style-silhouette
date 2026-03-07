import Sidebar from "../components/Sidebar"
import { Outlet } from "react-router-dom"

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