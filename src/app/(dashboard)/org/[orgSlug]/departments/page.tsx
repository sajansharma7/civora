import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Building, Users, Phone, Mail, Plus, Shield } from 'lucide-react';

interface DeptPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgDepartmentsPage({ params }: DeptPageProps) {
  const { orgSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: {
      departments: {
        include: {
          members: {
            include: { user: true },
          },
          _count: {
            select: { assignedIssues: true },
          },
        },
      },
    },
  });

  if (!org) {
    return <div className="p-8">Organization not found</div>;
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div>
        <Link
          href={`/org/${orgSlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Org Overview
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Departments & Field Staff Roster
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure civic issue routing and assign municipal staff members to specialized teams.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {org.departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-3xl p-6 border shadow-sm space-y-4"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">{dept.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{dept.description || 'Municipal department'}</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl">
                {dept._count.assignedIssues} Assigned Issues
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                slug: {dept.slug}
              </span>
              <span className={`inline-flex items-center gap-1 font-medium ${dept.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dept.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                {dept.isActive ? 'Operational' : 'Inactive'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Department Roster ({dept.members.length} Staff)
              </span>
              <div className="flex flex-wrap gap-2">
                {dept.members.length === 0 ? (
                  <span className="text-xs text-slate-400">No staff directly assigned yet</span>
                ) : (
                  dept.members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                    >
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                        {m.user.name.charAt(0)}
                      </div>
                      <span>{m.user.name}</span>
                      <span className="text-[10px] text-slate-400">({m.role})</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
