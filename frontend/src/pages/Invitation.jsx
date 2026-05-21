import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import InvitationCard from "../components/InvitationCard.jsx";
import { SocketContext } from "../context/SocketContext.jsx";

const InvitationPage = () => {
  const { socket } = useContext(SocketContext);

  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);

  const pendingReceived = received.filter((inv) => inv.status === "pending").length;
  const acceptedSent = sent.filter((inv) => inv.status === "accepted").length;
  const rejectedSent = sent.filter((inv) => inv.status === "rejected").length;

  useEffect(() => {
    const loadInvitations = async () => {
      try {
        const res = await api.get("/invitation/myinvitation");
        setSent(res.data.sent || []);
        setReceived(res.data.received || []);
      } catch (err) {
        console.log(err);
      }
    };

    loadInvitations();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewInvitation = (data) => {
      setReceived((prev) => [data, ...prev]);
    };

    const handleAccepted = (updatedInv) => {
      const update = (prev) =>
        prev.map((inv) =>
          inv._id === updatedInv._id
            ? { ...inv, status: "accepted" }
            : inv
        );

      setSent(update);
      setReceived(update);
    };

    const handleRejected = (updatedInv) => {
      const update = (prev) =>
        prev.map((inv) =>
          inv._id === updatedInv._id
            ? { ...inv, status: "rejected" }
            : inv
        );

      setSent(update);
      setReceived(update);
    };

    socket.on("newInvitation", handleNewInvitation);
    socket.on("invitationAccepted", handleAccepted);
    socket.on("invitationRejected", handleRejected);

    return () => {
      socket.off("newInvitation", handleNewInvitation);
      socket.off("invitationAccepted", handleAccepted);
      socket.off("invitationRejected", handleRejected);
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <header className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-700">Invitation center</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900">Keep your chat requests in one place.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                Accept new invites, review sent requests, and stay on top of your chat activity.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-3xl font-semibold text-cyan-700">{received.length}</p>
                <p className="mt-1 text-sm text-slate-500">Received</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-3xl font-semibold text-cyan-700">{sent.length}</p>
                <p className="mt-1 text-sm text-slate-500">Sent</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-3xl font-semibold text-cyan-700">{pendingReceived}</p>
                <p className="mt-1 text-sm text-slate-500">Pending</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Received Invitations</h2>
                <p className="mt-1 text-sm text-slate-500">{received.length} invitation{received.length === 1 ? "" : "s"} received</p>
              </div>
              {received.length > 0 && (
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  {pendingReceived} pending
                </span>
              )}
            </div>

            {received.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                No invitations received yet.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {received.map((inv) => (
                  <InvitationCard
                    key={inv._id}
                    invitation={inv}
                    type="received"
                    setSent={setSent}
                    setReceived={setReceived}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Sent Invitations</h2>
                <p className="mt-1 text-sm text-slate-500">{sent.length} invitation{sent.length === 1 ? "" : "s"} sent</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">{acceptedSent} accepted</span>
                <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700">{rejectedSent} rejected</span>
              </div>
            </div>

            {sent.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                No invitations sent yet.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {sent.map((inv) => (
                  <InvitationCard
                    key={inv._id}
                    invitation={inv}
                    type="sent"
                    setSent={setSent}
                    setReceived={setReceived}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default InvitationPage;