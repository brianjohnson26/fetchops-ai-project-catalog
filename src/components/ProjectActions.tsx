
'use client';

import { useRouter } from 'next/navigation';

export default function ProjectActions({ projectId }: { projectId: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`/projects/${projectId}/delete`, {
          method: 'POST',
        });
        if (response.ok) {
          router.push('/projects?deleted=1');
        } else {
          alert('Failed to delete project');
        }
      } catch (error) {
        alert('Error deleting project');
      }
    }
  };

  return (
    <div className="flex gap-3">
      <a 
        href={`/projects/${projectId}/edit`}
        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-300 shadow-sm font-medium text-sm inline-block"
      >
        Edit
      </a>
      <button 
        onClick={handleDelete}
        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors border border-red-300 shadow-sm font-medium text-sm"
      >
        Delete
      </button>
    </div>
  );
}
