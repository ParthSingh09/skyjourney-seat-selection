import { AlertTriangle } from 'lucide-react'
import Modal from './Modal.jsx'

/** Generic "this will discard something – continue?" dialog. */
export default function ConfirmDialog({ title, message, items = [], confirmLabel = 'Continue', onConfirm, onCancel }) {
  return (
    <Modal titleId="confirm-title" onClose={onCancel}>
      <div className="px-6 pb-6 pt-7">
        <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600"><AlertTriangle size={24} /></span>
        <h2 id="confirm-title" className="mt-4 text-lg font-extrabold text-navy-900">{title}</h2>
        <p className="mt-1.5 text-sm text-slate-600">{message}</p>
        {items.length > 0 && (
          <ul className="mt-3 space-y-1.5 rounded-2xl bg-slate-50 p-3.5 text-sm font-medium text-navy-900">
            {items.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />{item}</li>)}
          </ul>
        )}
        <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-navy-800 px-5 py-3 text-sm font-bold text-white hover:bg-navy-700">{confirmLabel}</button>
        </div>
      </div>
    </Modal>
  )
}
