'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FollowButton({ bandId }: { bandId: string }) {
  const supabase = createClient()
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [followId, setFollowId] = useState<string | null>(null)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        setLoading(false)
        return
      }

      // Check if already following
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type, id')
        .eq('id', user.id)
        .single()

      if (profile?.account_type !== 'fan') {
        setLoading(false)
        return
      }

      // Get fan's profile_id from follows perspective
      const { data: follow } = await supabase
        .from('follows')
        .select('id')
        .eq('fan_id', user.id)
        .eq('band_id', bandId)
        .single()

      if (follow) {
        setFollowing(true)
        setFollowId(follow.id)
      }

      setLoading(false)
    }
    check()
  }, [bandId])

  async function handleFollow() {
    if (!user) {
      window.location.href = '/signup'
      return
    }

    setLoading(true)

    if (following && followId) {
      await supabase.from('follows').delete().eq('id', followId)
      setFollowing(false)
      setFollowId(null)
    } else {
      const { data } = await supabase
        .from('follows')
        .insert({ fan_id: user.id, band_id: bandId })
        .select()
        .single()

      if (data) {
        setFollowing(true)
        setFollowId(data.id)
      }
    }

    setLoading(false)
  }

  // Don't show for non-fans or loading
  if (loading) return (
    <div className="w-24 h-9 bg-gray-800 rounded-lg animate-pulse" />
  )

  return (
    <button
      onClick={handleFollow}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        following
          ? 'bg-gray-800 text-gray-300 hover:bg-red-950 hover:text-red-400'
          : 'bg-yellow-400 text-gray-950 hover:bg-yellow-300'
      }`}
    >
      {following ? 'Following' : user ? 'Follow' : 'Follow'}
    </button>
  )
}