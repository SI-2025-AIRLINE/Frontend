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
		"/admin/supportTickets",
		"/admin/fareManagement",
		"/admin/chatManagement",
		"/admin/feedbackAdmin"
	];

	const isAdminPage = adminPaths.includes(location.pathname);

	return isAdminPage ? <HeaderAdmin /> : <Header />;
};

export default HeaderWrapper;
