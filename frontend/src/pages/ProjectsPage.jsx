import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects, createProject } from "../api/projects";

export default function ProjectsPage() {
  const qc = useQueryClient();
  const { data: projects, isLoading } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const create = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setShowCreate(false);
      setForm({ name: "", description: "" });
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
        <button onClick={() => setShowCreate(true)} className="bg-primary-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-700">
          New project
        </button>
      </div>
      {isLoading && <p className="text-slate-500">Loading…</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(projects || []).map((p) => (
          <Link key={p.id} to={`/projects/${p.id}/board`} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-400 hover:shadow-sm transition-all">
            <h2 className="font-semibold text-slate-800">{p.name}</h2>
            {p.description && <p className="text-sm text-slate-500 mt-1">{p.description}</p>}
          </Link>
        ))}
      </div>
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-slate-800 mb-4">Create Project</h2>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Project name" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCreate(false)} className="text-sm text-slate-500 px-4 py-2">Cancel</button>
                <button onClick={() => create.mutate(form)} className="bg-primary-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-700">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
