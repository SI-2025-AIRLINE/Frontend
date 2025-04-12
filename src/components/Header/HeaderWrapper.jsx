import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import HeaderAdmin from "./HeaderAdmin";

const HeaderWrapper = () => {
	const location = useLocation();

	// Rute na kojima se prikazuje admin header
	const adminPaths = ["/destination-management", "/user-management", "/aircraft-management", "/admin-homepage", "/flight-scheduling"];

	const isAdminPage = adminPaths.includes(location.pathname);

	return isAdminPage ? <HeaderAdmin /> : <Header />;
};

export default HeaderWrapper;