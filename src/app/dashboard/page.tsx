'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface Pitch {
  _id: string;
  title: string;
  inputData: {
    problem: string;
    solution: string;
    targetAudience?: string;
  };
  generatedPitch: string;
  createdAt: string;
}

// Icon Components for the new UI
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [loadingPitches, setLoadingPitches] = useState(false)

  useEffect(() => {
    async function getUserSession() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/');
          return;
        }
        setUser(user);
        await loadUserPitches();
      } catch (err) {
        console.error('Session error:', err);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }
    getUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
            router.push('/');
        }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const loadUserPitches = async () => {
    setLoadingPitches(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No session token available');

      const response = await fetch('/api/pitches', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setPitches(data.pitches || []);
      }
    } catch {
      console.error('Error loading pitches');
    } finally {
      setLoadingPitches(false);
    }
  };

  const deletePitch = async (pitchId: string) => {
    const originalPitches = [...pitches];
    setPitches(pitches.filter(p => p._id !== pitchId));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('No session token available');

      const response = await fetch(`/api/pitches/${pitchId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) setPitches(originalPitches);
    } catch {
      setPitches(originalPitches);
    }
  };

  if (loading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen">
         <div className="starry-bg"><div className="stars"></div><div className="twinkling"></div></div>
        <p className="text-xl animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-4 sm:p-8">
       <div className="starry-bg"><div className="stars"></div><div className="twinkling"></div></div>
      <div className="relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 glass-card-deep p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-green-300 mb-4 sm:mb-0">
            👋 Welcome, <span className="text-gray-200 font-medium">{user?.email}</span>!
            </h1>
            <button onClick={async () => await supabase.auth.signOut()} className="flex items-center text-sm font-semibold text-red-400 hover:text-red-300 transition-colors">
            <LogoutIcon />
            🚪 Logout
            </button>
        </header>

        <div className="glass-card-deep p-8 mb-10 text-center">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-4">🎯 Pitch Writer Dashboard 🎯</h2>
            <p className="text-gray-300 leading-relaxed text-lg mb-8 max-w-2xl mx-auto">
            ✨ This is your creative space. Generate, manage, and perfect your AI-powered pitches. ✨
            </p>
            <button onClick={() => router.push('/create-pitch')} className="inline-flex items-center py-3 px-8 rounded-full font-bold text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            <PlusIcon />
            🚀 Create New Pitch
            </button>
        </div>

        <div className="glass-card-deep p-8">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6">
            📚 Your Saved Pitches ({pitches.length})
            </h3>
            
            {loadingPitches ? <p className="text-gray-400 animate-pulse">⏳ Loading your pitches...</p> : 
            pitches.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg">
                <p className="text-gray-300 text-lg">🎨 Your canvas is empty.</p>
                <p className="text-gray-500 mt-2">Click &quot;Create New Pitch&quot; to bring your first idea to life! ✨</p>
            </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pitches.map((pitch) => (
                <div key={pitch._id} className="bg-slate-900/50 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-all group flex flex-col justify-between">
                    <div>
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-semibold text-white truncate pr-4">{pitch.title}</h4>
                        <button onClick={() => deletePitch(pitch._id)} className="p-2 rounded-full bg-red-800/50 text-red-300 hover:bg-red-700/70 hover:text-white transition-all opacity-0 group-hover:opacity-100" aria-label="Delete pitch">
                        <TrashIcon />
                        </button>
                    </div>
                    <div className="text-sm text-gray-400 mb-4 space-y-1">
                        <p><strong>Problem:</strong> {pitch.inputData.problem.substring(0, 50)}...</p>
                    </div>
                    </div>
                    <div className="text-xs text-gray-500 pt-2 border-t border-slate-700 mt-4">
                    Created: {new Date(pitch.createdAt).toLocaleDateString()}
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
      </div>
    </div>
  )
}
