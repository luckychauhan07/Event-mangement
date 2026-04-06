import { useEffect, useState } from "react";
import {
	approveTeacher,
	getPendingTeachers,
	rejectTeacher,
} from "../../services/adminServices";
import toast from "react-hot-toast";

const AdminTeacherApprovals = () => {
	const [teachers, setTeachers] = useState([]);
	const [processingRequest, setProcessingRequest] = useState(null);
	const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
	const [selectedTeacher, setSelectedTeacher] = useState(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const fetchTeachers = async () => {
		const res = await getPendingTeachers();
		setTeachers(res.data);
	};

	useEffect(() => {
		fetchTeachers();
	}, []);

	const handleApproval = async (id) => {
		if (processingRequest?.id === id) return;

		setProcessingRequest({ id, action: "approve" });

		try {
			const res = await approveTeacher(id);
			toast.success(res.message || "Teacher approved successfully");
			setTeachers((prev) => prev.filter((t) => t.user_id !== id));
		} finally {
			setProcessingRequest((current) =>
				current?.id === id ? null : current,
			);
		}
	};

	const openRejectModal = (teacher) => {
		if (processingRequest?.id === teacher.user_id) return;

		setSelectedTeacher(teacher);
		setRejectionReason("");

		setIsRejectModalOpen(true);
	};

	const closeRejectModal = () => {
		if (processingRequest?.action === "reject") return;

		setIsRejectModalOpen(false);
		setSelectedTeacher(null);
		setRejectionReason("");
	};

	const confirmRejectTeacher = async () => {
		if (!selectedTeacher) return;

		const reason = rejectionReason.trim();
		if (!reason) {
			toast.error("Please provide a reason before rejecting");
			return;
		}

		const id = selectedTeacher.user_id;
		if (processingRequest?.id === id) return;

		setProcessingRequest({ id, action: "reject" });

		try {
			await rejectTeacher(id, reason);
			toast.success("Teacher rejected successfully");
			setTeachers((prev) => prev.filter((t) => t.user_id !== id));
			closeRejectModal();
		} finally {
			setProcessingRequest((current) =>
				current?.id === id ? null : current,
			);
		}
	};

	return (
		<>
			<div className="p-6 md:p-8 bg-slate-50 min-h-full">
				<div className="max-w-6xl mx-auto space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
						<div>
							<h2 className="text-3xl font-bold text-slate-900 tracking-tight">
								Pending Teacher Requests
							</h2>
							<p className="text-slate-600 mt-1 text-sm">
								Review and approve teacher registrations.
							</p>
						</div>

						<button
							onClick={() => window.history.back()}
							className="inline-flex items-center gap-2 bg-slate-600 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-all duration-200 hover:shadow-md active:scale-[0.98]"
						>
							<span>←</span>
							<span>Go Back</span>
						</button>
					</div>

					<div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
						<table className="w-full">
							<thead className="border-b border-slate-200 bg-slate-100/80">
								<tr className="text-left">
									<th className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
										Name
									</th>
									<th className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
										Email
									</th>
									<th className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
										Phone
									</th>
									<th className="p-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
										Action
									</th>
								</tr>
							</thead>

							<tbody>
								{teachers.length === 0 && (
									<tr>
										<td
											className="p-8 text-slate-500 text-center"
											colSpan="4"
										>
											No pending requests
										</td>
									</tr>
								)}

								{teachers.map((teacher, index) => {
									const isProcessing =
										processingRequest?.id ===
										teacher.user_id;
									const isApproving =
										isProcessing &&
										processingRequest?.action === "approve";
									const isRejecting =
										isProcessing &&
										processingRequest?.action === "reject";

									return (
										<tr
											key={teacher.user_id}
											className="border-b last:border-b-0 border-slate-100 hover:bg-slate-50/70 transition-colors duration-200 animate-in fade-in slide-in-from-bottom-1"
											style={{
												animationDelay: `${index * 45}ms`,
											}}
										>
											<td className="p-4 text-slate-800 font-medium">
												{teacher.full_name}
											</td>

											<td className="p-4 text-slate-700">
												{teacher.email}
											</td>

											<td className="p-4 text-slate-700">
												{teacher.phone || "-"}
											</td>

											<td className="p-4">
												<div className="flex flex-wrap gap-2 items-center">
													<button
														disabled={isProcessing}
														onClick={() =>
															openRejectModal(
																teacher,
															)
														}
														className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 bg-white hover:bg-red-100 transition-all duration-200 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed font-medium"
													>
														{isRejecting
															? "Rejecting..."
															: "Reject"}
													</button>

													<button
														disabled={isProcessing}
														onClick={() =>
															handleApproval(
																teacher.user_id,
															)
														}
														className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
													>
														{isApproving
															? "Approving..."
															: "Approve"}
													</button>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{isRejectModalOpen && selectedTeacher && (
				<div className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-[1px] flex items-center justify-center p-4">
					<div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
						<div className="space-y-2">
							<h3 className="text-xl font-bold text-slate-900">
								Reject Teacher Request
							</h3>
							<p className="text-sm text-slate-600">
								Provide a reason for rejecting
								<span className="font-semibold text-slate-800">
									{selectedTeacher.full_name}
								</span>
								.
							</p>
						</div>

						<div className="mt-4 space-y-2">
							<label
								htmlFor="rejectReason"
								className="text-sm font-medium text-slate-700"
							>
								Reason <span className="text-red-600">*</span>
							</label>
							<textarea
								id="rejectReason"
								rows={4}
								value={rejectionReason}
								onChange={(e) =>
									setRejectionReason(e.target.value)
								}
								placeholder="Example: Required teaching credentials are missing."
								className="w-full rounded-xl border border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none px-3 py-2 text-sm resize-none"
							/>
							<p className="text-xs text-slate-500">
								This reason will be shared in rejection records.
							</p>
						</div>

						<div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
							<button
								onClick={closeRejectModal}
								disabled={
									processingRequest?.action === "reject"
								}
								className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
							>
								Cancel
							</button>
							<button
								onClick={confirmRejectTeacher}
								disabled={
									processingRequest?.action === "reject"
								}
								className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
							>
								{processingRequest?.action === "reject"
									? "Rejecting..."
									: "Confirm Reject"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default AdminTeacherApprovals;
