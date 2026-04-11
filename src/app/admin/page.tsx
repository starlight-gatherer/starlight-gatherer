"use client";

import { useState, useEffect } from "react";
import { ConfigProvider, App } from "antd";
import { LoginForm, ProFormText } from "@ant-design/pro-components";
import { KeyOutlined } from "@ant-design/icons";
import { TabBar } from "./_components/TabBar";
import { ArchivesTab } from "./_tabs/ArchivesTab";
import { EventsTab } from "./_tabs/EventsTab";
import { SeriesTab } from "./_tabs/SeriesTab";
import { CoverTab } from "./_tabs/CoverTab";
import { KeysTab } from "./_tabs/KeysTab";
import type { TabKey } from "./_types";

// ── Auth Gate ──────────────────────────────────────────────────────────

function AuthGate({ onAuth }: { onAuth: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <LoginForm
        title="Starlight Gatherer"
        subTitle="管理后台"
        onFinish={async (values) => {
          const res = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKey: values.apiKey }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "登录失败");
          }
          onAuth();
        }}
      >
        <ProFormText.Password
          name="apiKey"
          fieldProps={{
            size: "large",
            prefix: <KeyOutlined />,
          }}
          placeholder="输入 API Key"
          rules={[{ required: true, message: "请输入 API Key" }]}
        />
      </LoginForm>
    </div>
  );
}

// ── Main Admin Page ────────────────────────────────────────────────────

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("archives");

  useEffect(() => {
    fetch("/api/v1/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <ConfigProvider>
        <AuthGate onAuth={() => setAuthenticated(true)} />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider>
      <App>
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black">管理后台</h1>
            <button
              onClick={() => {
                fetch("/api/v1/auth/logout", { method: "POST" });
                setAuthenticated(false);
              }}
              className="text-sm text-slate-400 hover:text-red-500 transition-colors"
            >
              退出登录
            </button>
          </div>

          <TabBar active={activeTab} onChange={setActiveTab} />

          {activeTab === "archives" && <ArchivesTab />}
          {activeTab === "events" && <EventsTab />}
          {activeTab === "series" && <SeriesTab />}
          {activeTab === "cover" && <CoverTab />}
          {activeTab === "keys" && <KeysTab />}
        </main>
      </App>
    </ConfigProvider>
  );
}
