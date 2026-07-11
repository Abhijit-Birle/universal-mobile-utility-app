import React, { useState } from "react";
import { User, Sun, Moon, Sparkles, ChevronDown, Check, EyeOff, Eye, Settings, DollarSign, Tag, AlertTriangle, X } from "lucide-react";
import { CURRENCIES } from "../utils/currency.js";

export default function ProfileTab({
  theme, fontDisplay, fontBody, darkMode, setDarkMode, setShowInsights, apiKey, setApiKey,
  baseCurrency, setBaseCurrency, setShowManageCategories, customCategoryRules, setCustomCategoryRules,
  setShowRuleModal, setShowWipeConfirm, NeoSurface, NeoInput, SectionLabel, IconBtn, PrimaryButton, NeoSelect
}) {
  const [keyVisible, setKeyVisible] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey || "");

  return (
    <div style={{ padding: "0 18px", paddingBottom: 100, paddingTop: 10, animation: "slideInRight 0.25s ease" }}>
      {/* Profile Card */}
      <NeoSurface style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <User size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.textPrimary, ...fontDisplay }}>Local User</div>
            <div style={{ fontSize: 13, color: theme.textSecondary, ...fontBody }}>Local User Profile</div>
          </div>
          <IconBtn icon={darkMode ? <Sun size={20} /> : <Moon size={20} />} onClick={() => setDarkMode(!darkMode)} />
        </div>
      </NeoSurface>

      <SectionLabel icon={<Sparkles size={16} />} title="AI Intelligence" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {/* AI Insights Card */}
        <div
          onClick={() => setShowInsights(true)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.bg, padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm, cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Sparkles size={18} color={theme.textPrimary} />
            <span style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>View AI Insights</span>
          </div>
          <ChevronDown size={16} color={theme.textSecondary} style={{ transform: "rotate(-90deg)" }} />
        </div>
        
        {/* API Key Card */}
        <div style={{ background: theme.bg, padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, ...fontDisplay, marginBottom: 4 }}>Gemini API Key</div>
          <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 12, ...fontBody }}>Used to power AI insights & statement import. Saved locally.</div>
          <div style={{ position: "relative" }}>
            <NeoInput type={keyVisible ? "text" : "password"} placeholder="Paste your API key" value={tempKey} onChange={(e) => setTempKey(e.target.value)} style={{ paddingRight: 40, marginBottom: 8 }} />
            <button onClick={() => setKeyVisible(!keyVisible)} style={{ position: "absolute", right: 10, top: 10, border: "none", background: "none", color: theme.textSecondary }}>
              {keyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <PrimaryButton label={apiKey === tempKey && tempKey ? "Saved" : "Save key"} icon={<Check size={15} />} onClick={() => setApiKey(tempKey)} style={{ width: "100%" }} />
        </div>
      </div>

      <SectionLabel icon={<Settings size={16} />} title="App Preferences" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {/* Base Currency */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.bg, padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <DollarSign size={18} color={theme.textPrimary} />
            <span style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>Base Currency</span>
          </div>
          <div style={{ width: 140 }}>
            <NeoSelect value={baseCurrency} onChange={setBaseCurrency} options={CURRENCIES.map(c => ({ value: c.code, label: `${c.code} (${c.symbol})` }))} theme={theme} fontBody={fontBody} style={{ marginBottom: 0 }} />
          </div>
        </div>
        
        {/* Manage Categories */}
        <div
          onClick={() => setShowManageCategories(true)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.bg, padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm, cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Tag size={18} color={theme.textPrimary} />
            <span style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, ...fontBody }}>Manage Categories</span>
          </div>
          <ChevronDown size={16} color={theme.textSecondary} style={{ transform: "rotate(-90deg)" }} />
        </div>
        
        {/* Custom Category Rules */}
        <div style={{ background: theme.bg, padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, ...fontDisplay, marginBottom: 12 }}>Custom Category Rules</div>
          
          {customCategoryRules.length === 0 && (
             <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 12 }}>Add rules to auto-categorize CSV imports.</div>
          )}
          
          {customCategoryRules.map((rule, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: theme.textSecondary, flex: 1 }}>"{rule.keyword}" &rarr; <b style={{color: theme.textPrimary}}>{rule.category}</b></span>
              <button onClick={() => setCustomCategoryRules(prev => prev.filter((_, i) => i !== idx))} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer" }}><X size={14} /></button>
            </div>
          ))}
          
          <button onClick={() => setShowRuleModal(true)} style={{ width: "100%", background: theme.accent, color: "#fff", border: "none", borderRadius: 8, padding: "12px", cursor: "pointer", fontWeight: 600, ...fontBody, marginTop: 8 }}>
            Add Custom Rule
          </button>
        </div>
      </div>

      <SectionLabel icon={<AlertTriangle size={16} />} title="Danger Zone" />
      {/* Wipe Data */}
      <div
        onClick={() => setShowWipeConfirm(true)}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#ff4d4d", padding: 16, borderRadius: 16, boxShadow: theme.shadowRaisedSm, cursor: "pointer", marginTop: 8 }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", ...fontBody }}>Wipe Transactions Data</span>
      </div>
    </div>
  );
}
