
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
    <div className="flex gap-2">
      <a 
        href={`/projects/${projectId}/edit`}
        className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
      >
        Edit
      </a>
      <button 
        onClick={handleDelete}
        className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
      >
        Delete
      </button>
    </div>
  );
}
