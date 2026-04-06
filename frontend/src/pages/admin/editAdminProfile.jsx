import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminProfileForm from "@/components/admin/profile/AdminProfileForm";
import {
	getAdminProfileIncomplete,
	patchAdminProfile,
} from "@/services/adminServices";
const getChangedFields = (originalData, formData) => {
	const changedFields = {};

	Object.keys(formData).forEach((key) => {
		const originalValue = originalData?.[key] ?? "";
		const currentValue = formData?.[key] ?? "";

		if (String(originalValue) !== String(currentValue)) {
			changedFields[key] = currentValue;
		}
	});

	return changedFields;
};

const EditAdminProfile = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [adminData, setAdminData] = useState({});
	const [originalData, setOriginalData] = useState({});

	useEffect(() => {
		document.title = "Edit Profile - Admin Panel";

		const fetchAdminProfile = async () => {
			try {
				const response = await getAdminProfileIncomplete();
				console.log("Admin Profile Data:", response.data);
				setAdminData(response.data);
				setOriginalData(response.data);
			} catch (error) {
				toast.error("Failed to load profile. Please try again.");
			}
		};
		fetchAdminProfile();
	}, []);

	const handleSubmit = async (formData) => {
		try {
			setLoading(true);

			const changedFields = getChangedFields(originalData, formData);
			const response = await patchAdminProfile(changedFields);
			console.log("Edit Profile Submit:", response);

			toast.success("Profile updated successfully!");
			navigate("/admin/profile");
		} catch (error) {
			toast.error("Failed to update profile.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 p-4 sm:p-6">
			<div className="max-w-6xl mx-auto">
				<AdminProfileForm
					mode="edit"
					initialData={adminData}
					onSubmit={handleSubmit}
					loading={loading}
				/>
			</div>
		</div>
	);
};

export default EditAdminProfile;
