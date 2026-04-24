'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminBandAvatarPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [band, setBand] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [profileId, setProfileId] = useState('')

  useEffect(() => {
    async function load() {
      const resolvedParams = await Promise.resolve(params)
      const id = resolvedParams.id

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) { router.push('/dashboard'); return }

      const { data: bandData } = await supabase
        .from('bands')
        .select(`*, profiles ( * )`)
        .eq('id', id)
        .single()

      if (!bandData) { router.push('/admin'); return }

      setBand(bandData)
      setAvatarUrl(bandData.profiles?.avatar_url || '')
      setProfileId(bandData.profile_id)
      setLoading(false)
    }
    load()
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const isHeic = file.name.toLowerCase().endsWith('.heic') ||
                   file.name.toLowerCase().endsWith('.heif') ||
                   file.type === 'image/heic' ||
                   file.type === 'image/heif'

    if (isHeic) {
      setError('HEIC/HEIF photos are not supported. Please use JPG or PNG.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    setUploading(true)
    setError('')

    const fileExt = file.name.split('.').pop()
    const filePath = `${profileId}/avatar-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Save to profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', profileId)

    console.log('profileId:', profileId)
    console.log('publicUrl:', publicUrl)
    console.log('updateError:', updateError)

    if (updateError) {
      setError(updateError.message)
      setUploading(false)
      return
    }

    setAvatarUrl(publicUrl)
    setSuccess('Avatar updated successfully!')
    setUploading(false)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to remove this band\'s profile image?')) return

    setSaving(true)
    setError('')
    setSuccess('')

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', profileId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setAvatarUrl('')
    setSuccess('Avatar removed successfully!')
    setSaving(false)
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-xl mx-auto">
        <a href="/admin" className="text-gray-500 text-sm hover:text-yellow-400 mb-6 inline-block">← Back to admin</a>
        <h1 className="text-3xl font-bold text-yellow-400 mb-1">Band Avatar</h1>
        <p className="text-gray-400 mb-8">{band?.profiles?.display_name}</p>

        {/* Current avatar */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-6 flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-yellow-400 flex items-center justify-center text-gray-950 text-3xl font-bold shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={band?.profiles?.display_name} className="w-full h-full object-cover" />
            ) : (
              band?.profiles?.display_name?.[0]?.toUpperCase()
            )}
          </div>
          <div>
            <p className="font-semibold">{band?.profiles?.display_name}</p>
            <p className="text-gray-500 text-sm mt-1">
              {avatarUrl ? 'Has profile image' : 'No profile image'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Upload button */}
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full py-3 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload new image'}
            </button>
            <p className="text-gray-600 text-xs mt-1 text-center">JPG or PNG only, up to 5MB — no HEIC</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleUpload}
            />
          </div>

          {/* Delete button */}
          {avatarUrl && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="w-full py-3 bg-red-950 text-red-400 font-semibold rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50"
            >
              {saving ? 'Removing...' : 'Remove image'}
            </button>
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {success && <p className="text-green-400 text-sm text-center">{success}</p>}
        </div>
      </div>
    </main>
  )
}