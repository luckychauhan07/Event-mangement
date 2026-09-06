import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminProfileForm from "@/components/admin/profile/AdminProfileForm";
import {
	getAdminProfileIncomplete,
	updateAdminProfile,
} from "@/services/adminServices";
// import { getAdminProfile, updateAdminProfile, getInstitutions } from "@/services/adminServices";

const CompleteAdminProfile = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [adminData, setAdminData] = useState({});

	useEffect(() => {
		document.title = "Complete Profile - Admin Panel";

		const fetchAdminProfile = async () => {
			try {
				const response = await getAdminProfileIncomplete();
				setAdminData(response.data);
			} catch (error) {
				toast.error("Failed to load profile. Please try again.");
			}
		};

		fetchAdminProfile();
	}, []);

	const handleSubmit = async (formData) => {
		try {
			setLoading(true);

			await updateAdminProfile(formData);

			toast.success("Profile completed successfully!");
			navigate("/admin/profile");
		} catch (error) {
			toast.error("Failed to complete profile.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 p-4 sm:p-6">
			<div className="max-w-6xl mx-auto">
				<AdminProfileForm
					mode="complete"
					initialData={adminData}
					onSubmit={handleSubmit}
					loading={loading}
				/>
			</div>
		</div>
	);
};

export default CompleteAdminProfile;
