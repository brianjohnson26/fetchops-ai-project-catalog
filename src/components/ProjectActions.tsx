
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
    <div className="flex justify-between items-center w-full">
      <a 
        href={`/projects/${projectId}/edit`}
        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium text-sm inline-flex items-center min-w-[80px] justify-center"
      >
        Edit
      </a>
      <button 
        onClick={handleDelete}
        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm font-medium text-sm inline-flex items-center min-w-[80px] justify-center"
      >
        Delete
      </button>
    </div>
  );
}
