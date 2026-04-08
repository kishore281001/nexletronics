'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getBankSettings, saveBankSettings, getSiteSettings, saveSiteSettings } from '@/lib/store';
import { setAdminPassword, verifyAdminPassword } from '@/lib/admin-auth-context';
import { useToast } from '@/lib/toast-context';
import { BankSettings, SiteSettings } from '@/lib/types';
import { Building, CreditCard, Globe, CheckCircle, Eye, EyeOff, Info, Lock, Shield, Megaphone } from 'lucide-react';

// ─── Stable sub-components (defined OUTSIDE the page so they don't remount on re-render) ───
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ color: 'var(--accent-cyan)' }}>{icon}</div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export default function SettingsPage() {
  const [bank, setBank] = useState<BankSettings>({ account_holder: '', account_number: '', ifsc_code: '', bank_name: '', razorpay_key: '', razorpay_secret: '' });
  const [site, setSite] = useState<SiteSettings>({ announcement_text: '', featured_panel_title: '', show_announcement: true, contact_email: '', contact_phone: '', instagram_url: '', twitter_url: '' });
  const [bankSaved, setBankSaved] = useState(false);
  const [siteSaved, setSiteSaved] = useState(false);
  const { showToast } = useToast();
  // Admin password change
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSaved, setPassSaved] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    setBank(getBankSettings());
    setSite(getSiteSettings());
  }, []);

  const saveBankBtn = () => { saveBankSettings(bank); setBankSaved(true); setTimeout(() => setBankSaved(false), 2000); };
  const saveSiteBtn = () => { saveSiteSettings(site); setSiteSaved(true); setTimeout(() => setSiteSaved(false), 2000); };

  const changePassword = async () => {
    setPassError('');
    const currentOk = await verifyAdminPassword(currentPass);
    if (!currentOk) { setPassError('Current password is incorrect.'); return; }
    if (newPass.length < 8) { setPassError('New password must be at least 8 characters.'); return; }
    if (newPass !== confirmPass) { setPassError('Passwords do not match.'); return; }
    await setAdminPassword(newPass);
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    setPassSaved(true); setTimeout(() => setPassSaved(false), 2500);
    showToast('success', '🔒 Password changed!', 'New admin password is active. Use it next time you log in.');
  };


  return (
    <div className="admin-page-wrap" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: 32, overflowY: 'auto', maxWidth: 800 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Configure your store's bank account, Razorpay keys, and site settings.</p>
        </div>

        {/* Info banner */}
        <div style={{ background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Info size={14} color="var(--accent-cyan)" style={{ marginTop: 1, flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent-cyan)' }}>Data is stored locally on this browser.</strong> Once you connect Supabase, all settings will sync to the cloud. For now, don't clear browser data to keep your settings.
          </div>
        </div>

        {/* Bank Account */}
        <Section icon={<Building size={16} />} title="Bank Account">
          <div className="admin-2col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Account Holder Name">
              <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} value={bank.account_holder} onChange={e => setBank(b => ({ ...b, account_holder: e.target.value }))} placeholder="Your full name" />
            </Field>
            <Field label="Bank Name">
              <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} value={bank.bank_name} onChange={e => setBank(b => ({ ...b, bank_name: e.target.value }))} placeholder="State Bank of India" />
            </Field>
            <Field label="Account Number">
              <input className="input-field" style={{ padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-mono)' }} type="password" value={bank.account_number} onChange={e => setBank(b => ({ ...b, account_number: e.target.value }))} placeholder="••••••••••••••" />
            </Field>
            <Field label="IFSC Code">
              <input className="input-field" style={{ padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }} value={bank.ifsc_code} onChange={e => setBank(b => ({ ...b, ifsc_code: e.target.value.toUpperCase() }))} placeholder="SBIN0000123" />
            </Field>
          </div>
          <button onClick={saveBankBtn} className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
            {bankSaved ? <><CheckCircle size={15} /> Saved!</> : 'Save Bank Details'}
          </button>
        </Section>

        {/* Razorpay */}
        <Section icon={<CreditCard size={16} />} title="Razorpay Payment Gateway">
          {/* Key ID — safe to store in frontend (public key) */}
          <Field label="Razorpay Key ID" hint="Public key — starts with rzp_test_ or rzp_live_. Safe to save here.">
            <input className="input-field" style={{ padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-mono)' }} value={bank.razorpay_key} onChange={e => setBank(b => ({ ...b, razorpay_key: e.target.value }))} placeholder="rzp_live_xxxxxxxxxxxx" />
          </Field>

          {/* Secret key warning — removed from UI for security */}
          <div style={{ display: 'flex', gap: 14, padding: '14px 16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, marginBottom: 20 }}>
            <Shield size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#EF4444', marginBottom: 4 }}>Secret Key Must NOT Be Stored Here</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Your Razorpay <strong>Key Secret</strong> must only be used on a secure server, never in the browser. Storing it here would expose it to anyone with DevTools access and violates payment security standards (PCI-DSS).<br /><br />
                ✅ Add it to your backend environment variables (<code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 3 }}>RAZORPAY_KEY_SECRET</code>) once you set up a server.
              </div>
            </div>
          </div>

          <button onClick={saveBankBtn} className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
            {bankSaved ? <><CheckCircle size={15} /> Saved!</> : 'Save Razorpay Key ID'}
          </button>
        </Section>

        {/* Site Settings */}
        <Section icon={<Globe size={16} />} title="Store Information">
          {/* Announcement Bar */}
          <Field label="Announcement Bar Text" hint="Shown at the top of every page on the customer store">
            <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }}
              value={site.announcement_text}
              onChange={e => setSite(s => ({ ...s, announcement_text: e.target.value }))}
              placeholder="⚡ Free shipping on orders above ₹999!" />
          </Field>
          <Field label="Show Announcement Bar">
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div
                onClick={() => setSite(s => ({ ...s, show_announcement: !s.show_announcement }))}
                style={{
                  width: 40, height: 22, borderRadius: 11, background: site.show_announcement ? 'var(--accent-cyan)' : 'var(--bg-elevated)',
                  border: '1px solid var(--border)', cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
                }}
              >
                <div style={{ position: 'absolute', top: 2, left: site.show_announcement ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
              </div>
              <span style={{ fontSize: 13, color: site.show_announcement ? 'var(--success)' : 'var(--text-muted)' }}>
                {site.show_announcement ? 'Visible to customers' : 'Hidden'}
              </span>
            </label>
          </Field>
          <Field label="Featured Section Title" hint="Heading above the featured products panel on the homepage">
            <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }}
              value={site.featured_panel_title}
              onChange={e => setSite(s => ({ ...s, featured_panel_title: e.target.value }))}
              placeholder="Featured Products" />
          </Field>
          <Field label="Contact Email">
            <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} value={site.contact_email} onChange={e => setSite(s => ({ ...s, contact_email: e.target.value }))} placeholder="support@nexletronics.in" type="email" />
          </Field>
          <Field label="Contact Phone">
            <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} value={site.contact_phone} onChange={e => setSite(s => ({ ...s, contact_phone: e.target.value }))} placeholder="+91 98765 43210" />
          </Field>
          <div className="admin-2col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Instagram URL">
              <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} value={site.instagram_url} onChange={e => setSite(s => ({ ...s, instagram_url: e.target.value }))} placeholder="https://instagram.com/nexletronics" />
            </Field>
            <Field label="Twitter/X URL">
              <input className="input-field" style={{ padding: '10px 14px', fontSize: 14 }} value={site.twitter_url} onChange={e => setSite(s => ({ ...s, twitter_url: e.target.value }))} placeholder="https://x.com/nexletronics" />
            </Field>
          </div>
          <button onClick={saveSiteBtn} className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
            {siteSaved ? <><CheckCircle size={15} /> Saved!</> : 'Save Store Info'}
          </button>
        </Section>

        {/* Security — Change Admin Password */}
        <Section icon={<Shield size={16} />} title="Security — Admin Password">
          <div style={{ background: 'rgba(255,184,0,0.04)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 10, padding: '11px 14px', marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--warning)' }}>Default password:</strong> <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 3 }}>nexletronics@admin</code>
            <br />Change it here to something only you know. Minimum 8 characters.
          </div>
          <div className="admin-2col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Current Password">
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-field" style={{ padding: '10px 36px 10px 32px', fontSize: 14 }} type={showCurrentPass ? 'text' : 'password'}
                  value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="Current password" />
                <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showCurrentPass ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </Field>
            <Field label="New Password" hint="Min. 8 characters">
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-field" style={{ padding: '10px 36px 10px 32px', fontSize: 14 }} type={showNewPass ? 'text' : 'password'}
                  value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New password" />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showNewPass ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </Field>
          </div>
          <Field label="Confirm New Password">
            <input className="input-field" style={{ padding: '10px 14px', fontSize: 14, maxWidth: 340 }} type="password"
              value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Re-enter new password" />
          </Field>
          {passError && (
            <div style={{ fontSize: 13, color: 'var(--error)', padding: '8px 12px', background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 7, marginBottom: 14 }}>
              ⚠️ {passError}
            </div>
          )}
          <button onClick={changePassword} className="btn-primary" style={{ padding: '10px 24px', fontSize: 14, background: 'linear-gradient(135deg, #7B2FFF, #5B0FDF)' }}>
            {passSaved ? <><CheckCircle size={15} /> Password Changed!</> : <><Lock size={14} /> Change Password</>}
          </button>
        </Section>
      </main>
    </div>
  );
}
