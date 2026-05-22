import { API_URL } from '@/lib/api';

const API = API_URL;

export async function generateMetadata({ params }) {
  const { id } = params;
  
  try {
    const res = await fetch(`${API}/api/tutors/${id}`);
    const tutor = await res.json();
    
    return {
      title: `${tutor.subject} - ${tutor.tutorName} || Media Queue`,
      description: tutor.bio || 'Developed by Muktadir',
    };
  } catch (error) {
    return {
      title: 'Tutor Details || Media Queue',
      description: 'Developed by Muktadir',
    };
  }
}

export default function TutorDetailsLayout({ children }) {
  return children;
}
