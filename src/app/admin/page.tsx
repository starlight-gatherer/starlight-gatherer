"use client";

import { useState, useEffect } from "react";
import { ConfigProvider, App } from "antd";
import { LoginForm, ProFormText } from "@ant-design/pro-components";
import { LockOutlined } from "@ant-design/icons";
import { ADMIN_PASSWORD, SESSION_KEY } from "./_constants";
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
          if (values.password === ADMIN_PASSWORD) {
            sessionStorage.setItem(SESSION_KEY, "1");
            onAuth();
            return;
          }
          throw new Error("密码错误");
        }}
      >
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: "large",
            prefix: <LockOutlined />,
          }}
          placeholder="输入管理密码"
          rules={[{ required: true, message: "请输入密码" }]}
        />
      </LoginForm>
    </div>
  );
}

// ── Main Admin Page ────────────────────────────────────────────────────

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("archives");

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setAuthenticated(true);
    }
  }, []);

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
                sessionStorage.removeItem(SESSION_KEY);
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
