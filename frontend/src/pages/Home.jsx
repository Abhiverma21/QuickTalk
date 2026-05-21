import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchUser from "../components/SearchUser";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";

const Home = () => {
  const { user } = useContext(AuthContext);
  

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header/>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <div className="max-w-xl space-y-4">
              <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1 text-sm text-cyan-700">Welcome back, {user?.name || "there"}!</span>
              <h2 className="text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
                Chat faster. Connect smarter.
              </h2>
              <p className="text-lg leading-8 text-slate-600">
                QuickTalk brings your conversations together in one beautiful space. Start a private chat, launch group conversations, and stay on top of every notification.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link to="/personalchat" className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500">
                Start 1-1 Chat
              </Link>
              <Link to="/group-chat" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700">
                Open Group Chat
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-4xl font-semibold text-cyan-700">1+</p>
                <p className="mt-2 text-sm text-slate-500">Active users chatting now</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-4xl font-semibold text-cyan-700">99.9%</p>
                <p className="mt-2 text-sm text-slate-500">Realtime delivery reliability</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-4xl font-semibold text-cyan-700">24/7</p>
                <p className="mt-2 text-sm text-slate-500">Connected group support</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-4xl border border-slate-200 bg-white p-7 shadow-lg">
            <div className="flex items-center justify-between text-slate-700">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-700">Live preview</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">Conversation snapshot</h3>
              </div>
              <div className="rounded-full bg-cyan-50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-700">Online</div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-full bg-cyan-600 text-center leading-10 font-bold text-white">A</span>
                  <div>
                    <p className="font-semibold text-slate-900">Alex</p>
                    <p className="text-xs text-slate-500">10:24 AM</p>
                  </div>
                </div>
                <div className="rounded-3xl bg-white p-4 text-slate-700">Hey! Want to start the new project chat now?</div>
                <div className="rounded-3xl bg-white p-4 text-slate-700 text-right">Sure — I already created the invite link.</div>
                <div className="rounded-3xl bg-white p-4 text-slate-700">You can add anyone and keep messages organized in groups.</div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-cyan-400" to="/notifications">
                View Alerts
              </Link>
              <Link className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500" to="/invitations">
                Check Invitations
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Instant Messaging</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Send and receive messages instantly in private chats with a sleek interface designed for clarity.</p>
          </div>
          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Group Conversations</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Create rooms, invite friends, and keep every discussion organized with group-specific chat flows.</p>
          </div>
          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">Smart Notifications</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Never miss an important message with realtime alerts and quick access to new invites.</p>
          </div>
        </section>

        <section className="mt-16 rounded-4xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-700">Quick start</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900">Find someone to chat with right away.</h3>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">Use the search below to start a private conversation, add contacts, or invite friends to a group discussion.</p>
            </div>
            <div className="mt-4 lg:mt-0 inline-flex gap-3">
              <Link to="/personalchat" className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500">Start Chat</Link>
              <Link to="/group-chat" className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-700 transition hover:border-cyan-400">Create Group</Link>
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <SearchUser />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;