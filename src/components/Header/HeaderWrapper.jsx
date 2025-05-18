import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import HeaderAdmin from "./HeaderAdmin";

const HeaderWrapper = () => {
	const location = useLocation();

	// Rute na kojima se prikazuje admin header
	const adminPaths = [
		"/admin", 
		"/admin/airlineManagement",
		"/admin/destinationManagement", 
		"/admin/userManagement", 
		"/admin/aircraftManagement", 
		"/admin/flightScheduling",
<<<<<<< HEAD
	    "/admin/fareManagement",
		"/admin/analytics"
=======
		"/admin/supportTickets",

		"/admin/fareManagement",
		"/admin/chatManagement"

>>>>>>> 61f89271ca95c4610e6cc0e41c2b14606c938257
	];

	const isAdminPage = adminPaths.includes(location.pathname);

	return isAdminPage ? <HeaderAdmin /> : <Header />;
};

export default HeaderWrapper;
