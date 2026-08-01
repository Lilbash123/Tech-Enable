"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import { UploadCloud } from "lucide-react";
import type { SiteSettings } from "@/lib/types/admin";
import { updateSettingsAction, uploadLogoAction } from "@/app/admin/settings/actions";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0A66FF] text-white font-semibold text-sm hover:-translate-y-0.5 transition-transform disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save settings"}
    </button>
  );
}

const FIELD_CLASS =
  "px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-[#0A66FF]/10 focus:border-[#0A66FF]";

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useFormState(updateSettingsAction, {});
  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadLogoAction(fd);
    setUploading(false);
    if (result.url) setLogoUrl(result.url);
  }

  return (
    <form action={formAction} className="grid gap-6 max-w-2xl">
      {state.error && <p className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">{state.error}</p>}
      {state.success && (
        <p className="px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">Settings saved.</p>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 grid gap-5">
        <h3 className="font-semibold text-[#111827]">Branding</h3>
        <div className="grid gap-1.5">
          <label htmlFor="site_name" className="text-sm font-semibold text-slate-600">
            Website name
          </label>
          <input id="site_name" name="site_name" defaultValue={settings.site_name} className={FIELD_CLASS} />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-600 mb-2">Logo</p>
          <input type="hidden" name="logo_url" value={logoUrl} />
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden relative shrink-0">
              {logoUrl && <Image src={logoUrl} alt="" fill className="object-contain" />}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-[#0A66FF] hover:text-[#0A66FF] disabled:opacity-60"
            >
              <UploadCloud className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload logo"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 grid gap-5">
        <h3 className="font-semibold text-[#111827]">Contact information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="contact_email" className="text-sm font-semibold text-slate-600">Email</label>
            <input id="contact_email" name="contact_email" type="email" defaultValue={settings.contact_email ?? ""} className={FIELD_CLASS} />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="contact_phone" className="text-sm font-semibold text-slate-600">Phone</label>
            <input id="contact_phone" name="contact_phone" defaultValue={settings.contact_phone ?? ""} className={FIELD_CLASS} />
          </div>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="whatsapp_link" className="text-sm font-semibold text-slate-600">WhatsApp link</label>
          <input id="whatsapp_link" name="whatsapp_link" defaultValue={settings.whatsapp_link ?? ""} className={FIELD_CLASS} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 grid gap-4">
        <h3 className="font-semibold text-[#111827]">Social links</h3>
        {[
          ["facebook_url", "Facebook"],
          ["instagram_url", "Instagram"],
          ["twitter_url", "X (Twitter)"],
          ["youtube_url", "YouTube"],
          ["linkedin_url", "LinkedIn"],
        ].map(([name, label]) => (
          <div key={name} className="grid gap-1.5">
            <label htmlFor={name} className="text-sm font-semibold text-slate-600">{label}</label>
            <input id={name} name={name} defaultValue={(settings as any)[name] ?? ""} className={FIELD_CLASS} />
          </div>
        ))}
      </div>

      <div>
        <SaveButton />
      </div>
    </form>
  );
}
