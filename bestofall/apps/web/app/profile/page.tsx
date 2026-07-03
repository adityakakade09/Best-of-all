'use client';

import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SavedAddress, User } from '@bestofall/shared';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/apiClient';
import { MapPin, Plus, Trash2, UserCircle } from 'lucide-react';

function ProfileContent() {
  const { user, updateUser, logout } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    api
      .get<SavedAddress[]>('/addresses')
      .then(setAddresses)
      .catch(() => toast.error('Could not load saved addresses'));
  }, []);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.patch<User>('/auth/me', { name, email: email || undefined });
      updateUser(updated);
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update profile');
    }
  };

  const removeAddress = async (id: string) => {
    setAddresses((prev) => prev?.filter((a) => a.id !== id) ?? null);
    await api.delete(`/addresses/${id}`).catch(() => toast.error('Failed to remove address'));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-signal-indigo/10 text-signal-indigo">
          <UserCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold">{user?.name}</h1>
          <p className="text-sm text-ink-muted dark:text-ink-muted-dark">{user?.phone}</p>
        </div>
      </div>

      <form onSubmit={saveProfile} className="glass-panel mb-6 flex flex-col gap-4 rounded-xl3 p-6">
        <h2 className="font-display text-lg font-semibold">Profile details</h2>
        <label className="flex flex-col gap-1.5 text-sm">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl2 border border-black/10 dark:border-white/10 bg-transparent px-4 py-2.5 outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Email (optional)
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-xl2 border border-black/10 dark:border-white/10 bg-transparent px-4 py-2.5 outline-none"
          />
        </label>
        <button type="submit" className="btn-primary self-start">
          Save changes
        </button>
      </form>

      <div className="glass-panel mb-6 rounded-xl3 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <MapPin className="h-4 w-4" /> Saved addresses
          </h2>
          <button onClick={() => setShowAddForm((v) => !v)} className="btn-ghost !px-3 !py-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>

        {showAddForm && (
          <AddressForm
            onSaved={(addr) => {
              setAddresses((prev) => [addr, ...(prev ?? [])]);
              setShowAddForm(false);
            }}
          />
        )}

        {addresses === null ? (
          <div className="skeleton h-16 rounded-xl2" />
        ) : addresses.length === 0 ? (
          <p className="text-sm text-ink-muted dark:text-ink-muted-dark">No saved addresses yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {addresses.map((addr) => (
              <li key={addr.id} className="flex items-start justify-between gap-3 rounded-xl2 border border-black/10 dark:border-white/10 p-3">
                <div>
                  <p className="text-sm font-semibold">
                    {addr.label} {addr.isDefault && <span className="ml-1 text-xs text-signal-teal">Default</span>}
                  </p>
                  <p className="text-xs text-ink-muted dark:text-ink-muted-dark">
                    {addr.addressLine}, {addr.city}, {addr.state} {addr.pincode}
                  </p>
                </div>
                <button onClick={() => removeAddress(addr.id)} aria-label={`Remove ${addr.label}`}>
                  <Trash2 className="h-4 w-4 text-ink-muted dark:text-ink-muted-dark hover:text-signal-ember" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={logout} className="text-sm text-signal-ember hover:underline">
        Sign out
      </button>
    </div>
  );
}

function AddressForm({ onSaved }: { onSaved: (addr: SavedAddress) => void }) {
  const [form, setForm] = useState({ label: 'Home', addressLine: '', city: '', state: '', pincode: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Coordinates would normally come from Google Places Autocomplete on
      // the client; using a neutral default here keeps the form usable
      // without a live Maps API key configured.
      const { id } = await api.post<{ id: string }>('/addresses', {
        ...form,
        lat: 19.076,
        lng: 72.8777,
      });
      onSaved({ id, ...form, location: { lat: 19.076, lng: 72.8777 }, isDefault: false });
      toast.success('Address saved');
    } catch {
      toast.error('Could not save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-4 grid grid-cols-2 gap-2">
      <input
        required
        placeholder="Label (Home, Work…)"
        value={form.label}
        onChange={(e) => setForm({ ...form, label: e.target.value })}
        className="col-span-2 rounded-xl2 border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none"
      />
      <input
        required
        placeholder="Address line"
        value={form.addressLine}
        onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
        className="col-span-2 rounded-xl2 border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none"
      />
      <input
        required
        placeholder="City"
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
        className="rounded-xl2 border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none"
      />
      <input
        required
        placeholder="State"
        value={form.state}
        onChange={(e) => setForm({ ...form, state: e.target.value })}
        className="rounded-xl2 border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none"
      />
      <input
        required
        placeholder="Pincode"
        value={form.pincode}
        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
        className="rounded-xl2 border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none"
      />
      <button type="submit" disabled={saving} className="btn-primary col-span-2 !py-2 text-sm">
        {saving ? 'Saving…' : 'Save address'}
      </button>
    </form>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
