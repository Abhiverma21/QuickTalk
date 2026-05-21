import api from "../api/axios";

const InvitationCard = ({
  invitation,
  type,
  setSent,
  setReceived,
}) => {
  const statusClass =
    invitation.status === "accepted"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : invitation.status === "rejected"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-slate-200 bg-slate-100 text-slate-700";

  const statusLabel =
    invitation.status === "pending"
      ? type === "sent"
        ? "Awaiting"
        : "Pending"
      : invitation.status;

  const updateState = (status) => {
    const updater = (prev) =>
      prev.map((inv) =>
        inv._id === invitation._id
          ? { ...inv, status }
          : inv
      );

    setSent(updater);
    setReceived(updater);
  };

  async function acceptInvitation() {
    try {
      await api.put(`/invitation/accept/${invitation._id}`);
      updateState("accepted");
    } catch (err) {
      console.log(err.response?.data);
    }
  }

  async function rejectInvitation() {
    try {
      await api.put(`/invitation/reject/${invitation._id}`);
      updateState("rejected");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-slate-900">
            {type === "received"
              ? invitation.sender?.name || invitation.sender?.username || "Unknown User"
              : invitation.receiver?.name || invitation.receiver?.username || "Unknown User"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {type === "received"
              ? invitation.sender?.email || ""
              : invitation.receiver?.email || ""}
          </p>
        </div>

        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      {type === "received" && invitation.status === "pending" && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={acceptInvitation}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Accept
          </button>

          <button
            onClick={rejectInvitation}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default InvitationCard;